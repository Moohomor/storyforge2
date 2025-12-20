<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const backendUrl = import.meta.env.VITE_BACKEND_URL || ''
const rawXML = ref('')
const storyTree = ref(null)
const currentModule = ref(null)
const currentPosition = ref(0)
const executionStack = ref([])
const nvars = reactive({}) // Numeric variables
const vars = reactive({
  'Engine.text': '', 
  'Engine.char': '', 
  'Engine.bg_name': ''
})
const sprites = ref([])
let msg_for_next = null

class StoryElement {
  constructor(element) {
    this.element = element
    this.children = []
    this.parseChildren()
  }

  parseChildren() {
    for (let i = 0; i < this.element.children.length; i++) {
      const child = this.element.children[i]
      const className = child.nodeName.toLowerCase()
      
      switch (className) {
        case 'step':
          this.children.push(new Step(child))
          break
        case 'tx':
          this.children.push(new TX(child))
          break
        case 'char':
          this.children.push(new Char(child))
          break
        case 'if':
          this.children.push(new If(child))
          break
        case 'else':
          this.children.push(new Else(child))
          break
        case 'set':
          this.children.push(new Set(child))
          break
        case 'go':
          this.children.push(new Go(child))
          break
        case 'sprite':
          this.children.push(new Sprite(child))
          break
        case 'bg':
          this.children.push(new BG(child))
          break
        default:
          console.warn(`Unknown element: ${className}`)
          break
      }
    }
  }

  async exec(mod) {
    console.log(`Executing ${this.constructor.name}`)
    return true
  }
}

class Module extends StoryElement {
  constructor(element) {
    super(element)
    this.name = element.getAttribute('name') || 'main'
  }

  async executeNext() {
    if (!this.children || currentPosition.value >= this.children.length) {
      // End of module - check if we need to return
      if (executionStack.value.length > 0) {
        const returnPoint = executionStack.value.pop()
        currentModule.value = mods.value[returnPoint.module]
        currentPosition.value = returnPoint.position
        console.log(`Returning to ${returnPoint.module} at position ${returnPoint.position}`)
        return await currentModule.value.executeNext()
      }
      console.log('End of story reached')
      vars['Engine.text'] = 'The end of the story.'
      vars['Engine.char'] = ''
      return false
    }

    const element = this.children[currentPosition.value]
    console.log(`Executing position ${currentPosition.value}: ${element.constructor.name}`)
    
    const result = await element.exec(this)
    
    // Only increment position if the element didn't handle navigation itself
    // AND if it's a step element (non-step elements execute immediately)
    if (result !== false && !(element instanceof Step)) {
      currentPosition.value++
    }
    
    return true
  }
}

class Step extends StoryElement {
  async exec(mod) {
    console.log('Executing step with children:', this.children.length)
    // Execute all children in this step immediately
    for (const child of this.children) {
      await child.exec(mod)
    }
    // Don't auto-increment position - wait for user click
    return false // Return false to prevent auto-increment
  }
}

class Sprite extends StoryElement {
  async exec(mod) {
    const spriteName = this.element.textContent.trim()
    const pos = parseInt(this.element.getAttribute('pos')) || 0
    const mode = this.element.getAttribute('mode') || 'ins'
    
    if (mode === 'ins') {
      // Вставка спрайта
      const spriteUrl = `${backendUrl}storage/asset_content/${route.params.id}/${spriteName}`
      // Вставляем в позицию pos
      sprites.value.splice(pos, 0, {
        url: spriteUrl,
        name: spriteName,
        index: sprites.value.length // для z-index
      })
    } else if (mode === 'del') {
      // Удаление спрайта
      if (pos >= 0 && pos < sprites.value.length) {
        sprites.value.splice(pos, 1)
      }
    }
    return true
  }
}

class TX extends StoryElement {
  async exec(mod) {
    const rawText = this.element.textContent.trim();
    const processedText = replaceVariables(rawText);
    vars['Engine.text'] = processedText;
    console.log('Text:', vars['Engine.text'])
    return true
  }
}

class BG extends StoryElement {
  async exec(mod) {
    vars['Engine.bg_name'] = this.element.textContent.trim()
    console.log('Text:', vars['Engine.bg_name'])
    return true
  }
}

class Char extends StoryElement {
  async exec(mod) {
    vars['Engine.char'] = this.element.textContent.trim()
    console.log('Character:', vars['Engine.char'])
    return true
  }
}

class Set extends StoryElement {
  async exec(mod) {
    const attributes = this.element.attributes
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i]
      try {
        // Try to parse as number, fall back to string
        let value = attr.value
        if (!isNaN(value) && value.trim() !== '') {
          value = parseFloat(value)
        }
        nvars[attr.name] = value
        console.log(`Set ${attr.name} =`, value, 'Type:', typeof value)
      } catch (error) {
        nvars[attr.name] = attr.value
        console.log(`Set ${attr.name} =`, attr.value)
      }
    }
    return true
  }
}

class If extends StoryElement {
  constructor(element) {
    super(element)
    this.condition = element.getAttribute('condition') || ''
    this.elsePosition = -1
    this.findBlocks(element)
  }

  findBlocks(element) {
    // Find the corresponding else position
    const parent = element.parentNode
    for (let i = 0; i < parent.children.length; i++) {
      if (parent.children[i] === element) {
        // Look for the next else element at the same level
        for (let j = i + 1; j < parent.children.length; j++) {
          const child = parent.children[j]
          const nodeName = child.nodeName.toLowerCase()
          if (nodeName === 'else') {
            this.elsePosition = j
            break
          } else if (nodeName === 'if') {
            // Stop looking if we encounter another if (nested if-else not supported)
            break
          }
        }
        break
      }
    }
  }

  async exec(mod) {
    try {
      const conditionResult = this.evaluateCondition()
      console.log(`If condition "${this.condition}" evaluated to:`, conditionResult)
      
      if (conditionResult) {
        // Execute the content inside the if block
        for (const child of this.children) {
          await child.exec(mod)
        }
        // If we have an else block, we need to skip it
        if (this.elsePosition !== -1) {
          console.log(`Condition true, skipping else block at position ${this.elsePosition}`)
          // Set position to after the else block
          currentPosition.value = this.elsePosition - 1 // This will be incremented by Module.executeNext
          msg_for_next = 'skip'
        }
      } else {
        // Skip to else block if it exists
        if (this.elsePosition !== -1) {
          console.log(`Condition false, jumping to else block at position ${this.elsePosition}`)
          currentPosition.value = this.elsePosition - 1 // -1 because we'll increment after
        } else {
          // If there's no else block, just continue normally
          // The position will be incremented by Module.executeNext
        }
      }
      return true
    } catch (error) {
      console.error('Error evaluating condition:', this.condition, error)
      return true
    }
  }

  evaluateCondition() {
    // Replace variable references with their actual values
    let processedCondition = this.condition.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, (match) => {
      if (match in nvars) {
        return nvars[match]
      }
      return match
    })
    
    try {
      // Safer evaluation using Function constructor
      return new Function(`return ${processedCondition}`)()
    } catch (error) {
      console.error('Error in condition evaluation:', processedCondition, error)
      return false
    }
  }
}

class Else extends StoryElement {
  async exec(mod) {
    // Execute the content inside the else block
    if (msg_for_next=='skip') {
      msg_for_next = null
      currentPosition.value++
      await currentModule.value.executeNext()
      return true
    }
    for (const child of this.children) {
      await child.exec(mod)
    }
    return true
  }
}

class Go extends StoryElement {
  async exec(mod) {
    const targetModule = this.element.getAttribute('to')
    console.log(`Go to module: ${targetModule}`)
    
    // Save current position + 1 (next line after go) for return
    executionStack.value.push({
      module: currentModule.value.name,
      position: currentPosition.value + 1
    })
    
    if (mods.value[targetModule]) {
      // Switch to target module
      currentModule.value = mods.value[targetModule]
      currentPosition.value = 0
      console.log(`Transitioned to module "${targetModule}"`)
      
      // Execute the first step of the new module
      await currentModule.value.executeNext()
      
      // Don't increment position - we've already executed the new module
      return false
    } else {
      console.error(`Module not found: ${targetModule}`)
      vars['Engine.text'] = `Error: Module "${targetModule}" not found`
      return true
    }
  }
}

function replaceVariables(text) {
  if (!text) return '';
  
  return text.replace(/{([^{}]+)}/g, (match, variableName) => {
    variableName = variableName.trim();
    // Проверяем числовые переменные
    if (variableName in nvars) {
      return nvars[variableName];
    }
    // Проверяем строковые переменные
    if (variableName in vars) {
      return vars[variableName];
    }
    return match; // если переменная не найдена, оставляем как есть
  });
}

// Store all modules
const mods = ref({})

async function downloadStory() {
  const sid = localStorage.getItem('sid')
  const storyId = route.params.id
  
  try {
    const response = await fetch(`${backendUrl}storage/story_content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(storyId),
        sid: sid
      })
    })
    
    if (!response.ok) throw new Error('Failed to load story')
    
    const data = await response.json()
    // Предполагаем, что контент в поле 'content'
    return data.content || data
  } catch (error) {
    console.error('Error loading story:', error)
    throw error
  }
}

async function loadStory() {
  try {
    // Properly structured XML
//     rawXML.value = `
// <story>
//   <module name="main">
//     <step>
//       <char>Daun</char>
//       <tx>Hello! This is a test story.</tx>
//     </step>
//     <step>
//       <set a="1"></set>
//       <sprite>man.png</sprite>
//       <tx>Variable a has been set to 1</tx>
//     </step>
//     <if condition="a == 1">
//       <step>
//         <char>Megadaun</char>
//         <tx>The condition is true!</tx>
//       </step>
//     </if>
//     <else>
//       <step>
//         <tx>This would show if condition was false</tx>
//       </step>
//     </else>
//     <step>
//       <char></char>
//       <tx>Variable a = '{a}'</tx>
//     </step>
//     <step>
//       <tx>Now going to the second module...</tx>
//     </step>
//     <go to="second"></go>
//     <step>
//       <tx>We're back from the second module!</tx>
//     </step>
//   </module>
//   <module name="second">
//     <step>
//       <char>Not Daun</char>
//       <tx>Welcome to the second module!</tx>
//     </step>
//     <step>
//       <set b="42"></set>
//       <tx>Variable b has been set to 42</tx>
//     </step>
//     <step>
//       <tx>Returning to main module...</tx>
//     </step>
//   </module>
// </story>
// `
    rawXML.value = await downloadStory()
    
    // Clear previous state
    nvars.a = undefined
    nvars.b = undefined
    vars['Engine.text'] = ''
    vars['Engine.char'] = ''
    executionStack.value = []
    currentPosition.value = 0
    
    storyTree.value = new DOMParser().parseFromString(rawXML.value, 'text/xml')
    const error = storyTree.value.querySelector('parsererror')
    if (error) {
      throw new Error(`XML parsing error: ${error.textContent}`)
    }
    console.log(storyTree.value.children[0])

    // Parse modules
    const storyElement = storyTree.value.children[0]
    mods.value = {}
    
    for (let i = 0; i < storyElement.children.length; i++) {
      const moduleElement = storyElement.children[i]
      if (moduleElement.nodeName.toLowerCase() === 'module') {
        const module = new Module(moduleElement)
        mods.value[module.name] = module
        console.log(`Loaded module: ${module.name}`)
      }
    }

    if (!mods.value.main) {
      throw new Error('No main module found in story')
    }

    // Start execution from main module
    currentModule.value = mods.value.main
    console.log('Starting execution from main module')
    await currentModule.value.executeNext()
    
  } catch (error) {
    console.error('Error loading story:', error)
    alert(`Failed to load story: ${error.message}`)
    vars['Engine.text'] = `Error: ${error.message}`
  }
}

function nextStep() {
  console.log('--- Next Step Clicked ---')
  console.log('Current module:', currentModule.value?.name)
  console.log('Current position:', currentPosition.value)
  console.log('Execution stack:', [...executionStack.value])
  console.log('Variables:', {...nvars})
  
  if (currentModule.value) {
    // For step elements, we need to increment position manually after execution
    if (currentModule.value.children[currentPosition.value] instanceof Step) {
      currentPosition.value++
    }
    currentModule.value.executeNext()
  } else {
    console.log('No current module - reloading story')
    loadStory()
  }
}

onMounted(async () => {
  console.log('Component mounted - loading story')
  await loadStory()
})
</script>

<template>
  <div class="story-container" @click="nextStep">
    <!-- Фон -->
    <div 
      class="background" 
      :style="{ 
        backgroundImage: `url(${backendUrl}storage/asset_content/${route.params.id}/${vars['Engine.bg_name']})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }"
    ></div>
    
    <!-- Контейнер для спрайтов -->
    <div class="sprites-container">
      <div 
        v-for="(sprite, index) in sprites" 
        :key="index" 
        class="sprite-item"
        :style="{
          zIndex: sprites.length - index, // Первый спрайт сверху, последний снизу
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: `${index * 5}px` // Чуть налезают друг на друга
        }"
      >
        <img 
          :src="sprite.url" 
          :alt="sprite.name" 
          @error="handleSpriteError(sprite, index)"
          :style="{
            maxHeight: '70vh', // Ограничиваем высоту
            width: 'auto'
          }"
        />
      </div>
    </div>
    
    <!-- Диалоговое окно -->
    <div class="dialogue-box" v-if="vars['Engine.text'] || vars['Engine.char']">
      <div v-if="vars['Engine.char']" class="character-name">
        {{ vars['Engine.char'] || '...' }}
      </div>
      <div class="text-content" v-text="vars['Engine.text']"></div>
    </div>
    
    <!-- Информация для отладки -->
    <div class="debug-info">
      <div>История: {{ route.params.id }}</div>
      <div>Модуль: {{ currentModule?.name || 'none' }}</div>
      <div>Позиция: {{ currentPosition }}</div>
      <div>Спрайты: {{ sprites.length }}</div>
      <div v-if="Object.keys(nvars).length > 0">Переменные: {{ nvars }}</div>
    </div>
  </div>
</template>

<style scoped>
.story-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease;
}

.dialogue-box {
  position: absolute;
  bottom: 20px;
  left: 10%;
  right: 10%;
  background-color: var(--black);
/*  opacity: .85;*/
  color: white;
  padding: 24px;
/*  border-radius: 5px;*/
  border: 2px solid var(--dark_gray);
/*  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);*/
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease; /*cubic-bezier(0.3, 0.91, 0.66, 1.4);*/
  z-index: 100;
}

.character-name {
  position: absolute;
  bottom: 3.2em;
  padding: .7em;
/*  border-radius: 5px;*/
  border: 2px solid var(--dark_gray);
  background-color: var(--black);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  font-weight: bold;
  color: var(--white);
  margin-bottom: 12px;
  font-size: 1.6em;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
}

.text-content {
  line-height: 1.8;
  font-size: 1.5em;
  hyphens: auto;
  word-break: normal;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.debug-info {
  display: none;
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: #4da6ff;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 1000;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(-10px);
/*      transform: rotate3d(1, 0, 0, 90deg);*/
  }
  to {
    opacity: 1; 
    transform: translateY(0);
/*      transform: rotate3d(1, 0, 0, 0deg);*/
  }
}

.sprites-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50; /* Между фоном (0) и диалогом (100) */
}

.sprite-item {
  position: absolute;
  bottom: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  max-height: 70vh;
}

.sprite-item img {
  display: block;
  max-height: 100%;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.sprite-item.removing {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@keyframes spriteAppear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.sprite-item.appearing {
  animation: spriteAppear 0.3s ease forwards;
}
</style>