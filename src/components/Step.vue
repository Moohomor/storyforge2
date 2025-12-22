<script setup>
import { defineProps, ref, onMounted, defineEmits, watch, computed, nextTick } from 'vue'

const emit = defineEmits(['add-step', 'remove-step', 'update-step', 'add-option'])

const props = defineProps({
  json: {
    type: Object,
    required: true
  },
  moduleName: {
    type: String,
    required: true
  },
  stepIndex: {
    type: Number,
    required: true
  },
  canPlaceTag: {
    type: Function,
    required: true
  },
  parentTag: {
    type: String,
    default: ''
  }
})

const isClosing = ref(false)
const tag = ref('')
const content = ref('')
const attributes = ref({})
const tags = [
  ['Text', 'tx'], 
  ['Sprite', 'sprite'], 
  ['Background', 'bg'], 
  ['Character', 'char'], 
  ['Choice', 'choice'],
  ['Option', 'option'],
  ['Step', 'step'], 
  ['If condition', 'if'], 
  ['Else', 'else'], 
  ['Go to module', 'go'], 
  ['Set variable', 'set']
]

const selfClosingTags = ['sprite', 'bg', 'char', 'set']
const isSelfClosing = ref(false)

onMounted(() => {
  initializeFromProps()
})

const initializeFromProps = () => {
  try {
    // Handle closing tags
    const currentTag = props.json.tag || 'tx'
    isClosing.value = currentTag.startsWith('/')
    tag.value = isClosing.value ? currentTag.substring(1) : currentTag
    
    content.value = props.json.content || ''
    isSelfClosing.value = selfClosingTags.includes(tag.value) && props.json.single
    
    // Initialize attributes
    attributes.value = {}
    if (props.json.attributes) {
      for (const attrName in props.json.attributes) {
        const attr = props.json.attributes[attrName]
        attributes.value[attrName] = attr.value || attr.nodeValue || ''
      }
    }
    
    // Ensure choice has question attribute
    if (tag.value === 'choice' && !attributes.value.question) {
      attributes.value.question = ''
    }
  } catch (error) {
    console.error('Error initializing from props:', error)
    console.error('Props:', props)
    // Reset to safe defaults
    isClosing.value = false
    tag.value = 'tx'
    content.value = ''
    attributes.value = {}
    isSelfClosing.value = false
  }
}

// Watch for external changes
watch(() => [props.json, props.moduleName, props.stepIndex], async (newVal) => {
  try {
    if (newVal[0]) {
      await nextTick()
      initializeFromProps()
    }
  } catch (error) {
    console.error('Error in props watch:', error)
  }
}, { deep: true })

const handleClosingChange = (checked) => {
  try {
    isClosing.value = checked
    updateStepData()
  } catch (error) {
    console.error('Error in handleClosingChange:', error)
    console.error('Checked:', checked)
  }
}

const handleTagChange = (newTag) => {
  try {
    // Validate tag placement
    if (!props.canPlaceTag(newTag, props.json.spaces)) {
      alert(`"${newTag}" can only be placed inside a step block (indented at least 4 spaces)`)
      tag.value = props.json.tag.replace('/', '') // Revert to previous tag without slash
      return
    }
    
    // Special handling for choice and option tags
    if (newTag === 'choice') {
      // Ensure question attribute exists
      if (!attributes.value.question) {
        attributes.value.question = ''
      }
      // Clear content for choice (uses question attribute instead)
      content.value = ''
    } else if (newTag === 'option' && props.parentTag !== 'choice') {
      alert('Option tags can only be placed inside choice tags!')
      tag.value = props.json.tag.replace('/', '')
      return
    }
    
    tag.value = newTag
    updateStepData()
  } catch (error) {
    console.error('Error in handleTagChange:', error)
    console.error('New tag:', newTag)
  }
}

const handleContentChange = (newContent) => {
  try {
    content.value = newContent
    updateStepData()
  } catch (error) {
    console.error('Error in handleContentChange:', error)
    console.error('New content:', newContent)
  }
}

const handleAttributeChange = (attrName, newValue) => {
  try {
    attributes.value[attrName] = newValue
    updateStepData()
  } catch (error) {
    console.error('Error in handleAttributeChange:', error)
    console.error('Attribute:', attrName, 'New value:', newValue)
  }
}

const handleSelfClosingChange = () => {
  try {
    isSelfClosing.value = !isSelfClosing.value
    updateStepData()
  } catch (error) {
    console.error('Error in handleSelfClosingChange:', error)
  }
}

const updateStepData = () => {
  try {
    const updatedTag = isClosing.value ? `/${tag.value}` : tag.value
    
    const updatedJson = {
      ...props.json,
      tag: updatedTag,
      content: content.value,
      single: isSelfClosing.value || !selfClosingTags.includes(tag.value),
      closing: isClosing.value,
      attributes: {}
    }
    
    // Update attributes
    for (const attrName in attributes.value) {
      if (attributes.value[attrName] !== undefined && attributes.value[attrName] !== '') {
        updatedJson.attributes[attrName] = { 
          name: attrName, 
          value: attributes.value[attrName],
          nodeValue: attributes.value[attrName]
        }
      }
    }
    
    // Special handling for module name attribute
    if (tag.value === 'module' && !updatedJson.attributes.name) {
      updatedJson.attributes.name = { 
        name: 'name', 
        value: props.moduleName,
        nodeValue: props.moduleName
      }
    }
    
    emit('update-step', updatedJson)
  } catch (error) {
    console.error('Error in updateStepData:', error)
    console.error('Current state:', {
      isClosing: isClosing.value,
      tag: tag.value,
      content: content.value,
      attributes: attributes.value,
      isSelfClosing: isSelfClosing.value
    })
  }
}

const addAttribute = () => {
  try {
    const newAttrName = prompt('Enter attribute name:')
    if (newAttrName && newAttrName.trim() && !attributes.value[newAttrName.trim()]) {
      attributes.value[newAttrName.trim()] = ''
      updateStepData()
    }
  } catch (error) {
    console.error('Error in addAttribute:', error)
  }
}

const removeAttribute = (attrName) => {
  try {
    if (confirm(`Remove attribute "${attrName}"?`)) {
      delete attributes.value[attrName]
      updateStepData()
    }
  } catch (error) {
    console.error('Error in removeAttribute:', error)
    console.error('Attribute name:', attrName)
  }
}

const filteredTags = computed(() => {
  if (isClosing.value) {
    // For closing tags, only show tags that can be closed
    return tags.filter(([_, value]) => 
      ['step', 'if', 'else', 'module', 'choice'].includes(value)
    )
  }
  
  // If inside a choice, only show option tag
  if (props.parentTag === 'choice') {
    return tags.filter(([_, value]) => value === 'option')
  }
  
  // Filter out option tag if not inside choice
  return tags.filter(([_, value]) => value !== 'option')
})

const showSelfClosingToggle = computed(() => {
  return selfClosingTags.includes(tag.value) && !isClosing.value
})

const showContentInput = computed(() => {
  const contentTags = ['tx', 'bg', 'char', 'sprite', 'go', 'set', 'option']
  return contentTags.includes(tag.value) && !isClosing.value
})

const showQuestionEditor = computed(() => {
  return tag.value === 'choice' && !isClosing.value
})

const getContentPlaceholder = () => {
  if (tag.value === 'tx') return 'Enter text...'
  if (tag.value === 'bg') return 'Background path...'
  if (tag.value === 'char') return 'Character path...'
  if (tag.value === 'sprite') return 'Sprite path...'
  if (tag.value === 'go') return 'Module name...'
  if (tag.value === 'set') return 'Variable value...'
  if (tag.value === 'option') return 'Option text...'
  return 'Value...'
}

const showAddOptionButton = computed(() => {
  return tag.value === 'choice' && !isClosing.value
})
</script>

<template>
<div class="step">
  <!-- Spaces visualization -->
  <div class="space-visualization">
    <span v-for="n in Math.floor(props.json.spaces/2)" :key="n" class="space-marker"></span>
  </div>
  
  <div v-if="tag === 'module'">
    <h3>Module</h3>
    <input 
      type="text" 
      name="module" 
      v-model="attributes.name" 
      @change="handleAttributeChange('name', $event.target.value)"
      placeholder="Module name"
    >
  </div>
  
  <div v-else class="tag-container">
    <!-- Closing tag checkbox -->
    <div class="closing-checkbox-container">
      <label class="closing-checkbox-label">
        <input 
          type="checkbox" 
          v-model="isClosing" 
          @change="handleClosingChange(isClosing)"
          :disabled="tag === 'module'"
        >
        <span class="checkbox-text">End of</span>
      </label>
    </div>
    
    <!-- Tag selector -->
    <select name="tag" v-model="tag" @change="handleTagChange(tag)">
      <option v-for="option in filteredTags" :key="option[1]" :value="option[1]">
        {{ option[0] }}
      </option>
    </select>
    
    <!-- Self-closing toggle for relevant tags -->
    <div v-if="showSelfClosingToggle" class="self-closing-toggle">
      <label>
        <input type="checkbox" v-model="isSelfClosing" @change="handleSelfClosingChange">
        Self-closing tag
      </label>
    </div>
  </div>
  
  <!-- Special editor for choice question -->
  <div v-if="showQuestionEditor" class="question-editor">
    <span class="attr-label">question:</span>
    <input 
      type="text" 
      v-model="attributes.question" 
      @change="handleAttributeChange('question', $event.target.value)"
      placeholder="Enter question for the choice..."
    />
  </div>
  
  <!-- Content input for relevant tags -->
  <input 
    v-if="showContentInput" 
    v-model="content"
    @change="handleContentChange(content)"
    :placeholder="getContentPlaceholder()"
  />
  
  <!-- Special case for 'if' tag to show cond attribute -->
  <div v-if="tag === 'if' && !isClosing" class="cond-editor">
    <span class="attr-label">cond:</span>
    <input 
      type="text" 
      v-model="attributes.cond" 
      @change="handleAttributeChange('cond', $event.target.value)"
      placeholder="condition (e.g., var > 5)"
    />
  </div>
  
  <!-- Attribute editor -->
  <div class="attributes-editor">
    <div class="attribute-item" v-for="(value, name) in attributes" :key="name">
      <!-- Hide question attribute for choice (handled separately) -->
      <template v-if="!(tag === 'choice' && name === 'question')">
        <span class="attr-label">{{ name }}:</span>
        <input 
          type="text" 
          v-model="attributes[name]" 
          @change="handleAttributeChange(name, $event.target.value)"
          :placeholder="name"
          :disabled="isClosing"
        />
        <button @click="removeAttribute(name)" class="remove-btn" :disabled="isClosing">×</button>
      </template>
    </div>
    <button @click="addAttribute" class="add-attr-btn" :disabled="isClosing || tag === 'module'">+ Add Attribute</button>
  </div>
  
  <!-- Action buttons -->
  <div class="step-actions">
    <button @click="$emit('remove-step')" class="action-btn remove-btn" title="Remove step">−</button>
    <button @click="$emit('add-step')" class="action-btn add-btn" title="Add step">+</button>
    
    <!-- Add option button for choice tags -->
    <button 
      v-if="showAddOptionButton" 
      @click="$emit('add-option')" 
      class="action-btn add-option-btn" 
      title="Add option inside choice"
    >
      + Option
    </button>
  </div>
</div>  
</template>

<style scoped>
.step {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 4px 0;
  transition: all 0.2s ease;
}

.step:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.space-visualization {
  display: flex;
  align-items: center;
  min-width: 20px;
}

.space-marker {
  display: inline-block;
  width: 8px;
  height: 16px;
  background-color: #6c757d;
  margin-right: 2px;
  border-radius: 2px;
}

.closing-tag {
  color: #6c757d;
  font-style: italic;
  margin: 0;
  font-size: 12px;
}

.tag-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.closing-checkbox-container {
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.closing-checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.checkbox-text {
  font-size: 12px;
  color: #6c757d;
}

select, input[type="text"] {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

select:focus, input[type="text"]:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.attributes-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 8px;
}

.attribute-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.attr-label {
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.question-editor, .cond-editor {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 8px;
}

.question-editor input, .cond-editor input {
  min-width: 200px;
}

.step-actions {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-btn {
  background-color: #28a745;
  color: white;
}

.add-btn:hover {
  background-color: #218838;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
}

.remove-btn:hover {
  background-color: #c82333;
}

.add-option-btn {
  width: auto;
  padding: 0 8px;
  background-color: #ff9800;
  color: white;
  font-size: 12px;
}

.add-option-btn:hover {
  background-color: #e68900;
}

.add-attr-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 2px;
}

.add-attr-btn:hover {
  background-color: #138496;
}

.self-closing-toggle {
  display: flex;
  align-items: center;
  margin: 0 8px;
  font-size: 12px;
  color: #6c757d;
}

.self-closing-toggle label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.choice-container {
  border-left: 3px solid #ff9800;
  background-color: #fff8e1;
}

.option-container {
  border-left: 3px solid #4caf50;
  background-color: #f1f8e9;
}
</style>