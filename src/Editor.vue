<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Step from "./components/Step.vue"
import AssetSidebar from "./components/AssetSidebar.vue"

const route = useRoute()
const backendUrl = import.meta.env.VITE_BACKEND_URL

function countLeadingSpaces(str) {
  const match = str.match(/^\s*/);
  return match[0].length;
}

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
    return data.content || data
  } catch (error) {
    console.error('Error loading story:', error)
    throw error
  }
}

function parseXML(xmlString) {
  return new DOMParser().parseFromString(xmlString, 'text/xml')
}

function serializeXML(xml) {
  return new XMLSerializer().serializeToString(xml)
}

function XMLtoJSON(xml) {
  const trimmed = xml.trim()
  if (!trimmed || trimmed === '') {
    return {
      tag: '',
      spaces: 0,
      single: true,
      closing: false,
      content: '',
      attributes: {}
    }
  }

  let props = {}
  let single = false
  let closing = false
  let content = ""
  let tagName = ''
  let attributes = {}

  // Handle closing tags like </step>
  if (trimmed.startsWith('</') && trimmed.endsWith('>')) {
    closing = true
    single = true
    tagName = trimmed.substring(2, trimmed.length - 1).trim()
    content = ""
  } 
  // Handle self-closing tags like <char/>
  else if (trimmed.startsWith('<') && trimmed.endsWith('/>')) {
    single = true
    closing = false
    const tagContent = trimmed.substring(1, trimmed.length - 2).trim()
    const firstSpace = tagContent.indexOf(' ')
    tagName = firstSpace === -1 ? tagContent : tagContent.substring(0, firstSpace)
    
    // Parse attributes
    const attrMatches = tagContent.match(/(\w+)="([^"]*)"/g) || []
    attrMatches.forEach(match => {
      const [, name, value] = match.match(/(\w+)="([^"]*)"/) || []
      if (name && value) {
        attributes[name] = { name, value, nodeValue: value }
      }
    })
  }
  // Handle opening tags with content
  else if (trimmed.startsWith('<') && trimmed.includes('>')) {
    const firstTagEnd = trimmed.indexOf('>')
    const openingTag = trimmed.substring(1, firstTagEnd).trim()
    const firstSpace = openingTag.indexOf(' ')
    tagName = firstSpace === -1 ? openingTag : openingTag.substring(0, firstSpace)
    
    // Parse attributes
    const attrMatches = openingTag.match(/(\w+)="([^"]*)"/g) || []
    attrMatches.forEach(match => {
      const [, name, value] = match.match(/(\w+)="([^"]*)"/) || []
      if (name && value) {
        attributes[name] = { name, value, nodeValue: value }
      }
    })
    
    // Check if it has a closing tag
    const closingTagMatch = trimmed.match(new RegExp(`</${tagName}>$`))
    if (closingTagMatch) {
      single = true
      closing = false
      content = trimmed.substring(firstTagEnd + 1, trimmed.lastIndexOf('</'))
    } else {
      single = false
      closing = false
      content = trimmed.substring(firstTagEnd + 1)
    }
  }

  return {
    tag: closing ? `/${tagName}` : tagName,
    spaces: countLeadingSpaces(xml),
    single: single,
    closing: closing,
    content: content.trim(),
    attributes: attributes
  }
}

function JSONtoXML(obj) {
  // Handle closing tags
  if (obj.closing) {
    const tagName = obj.tag.startsWith('/') ? obj.tag.substring(1) : obj.tag
    return `${' '.repeat(obj.spaces)}</${tagName}>`
  }
  
  const tagName = obj.tag.startsWith('/') ? obj.tag.substring(1) : obj.tag
  
  // Build attributes string
  let attributesStr = ''
  if (obj.attributes) {
    for (const attrName in obj.attributes) {
      const attr = obj.attributes[attrName]
      const value = attr.value || attr.nodeValue || ''
      if (value) {
        attributesStr += ` ${attrName}="${value}"`
      }
    }
  }
  
  // Special handling for choice - always use opening/closing tags with question attribute
  if (tagName === 'choice') {
    // Ensure question attribute is included
    if (!attributesStr.includes('question=') && obj.attributes?.question) {
      const questionValue = obj.attributes.question.value || obj.attributes.question.nodeValue || ''
      attributesStr += ` question="${questionValue}"`
    }
    return `${' '.repeat(obj.spaces)}<${tagName}${attributesStr}>${obj.content || ''}`
  }
  
  // For option tags, always use opening/closing tags
  if (tagName === 'option') {
    return `${' '.repeat(obj.spaces)}<${tagName}${attributesStr}>${obj.content || ''}</${tagName}>`
  }
  
  // Handle content tags - these should never be self-closing if they have content
  const contentTags = ['tx', 'bg', 'char', 'sprite', 'go', 'set', 'choice', 'option']
  const hasContent = obj.content && obj.content.trim() !== ''
  
  // If it's a content tag and has content, always use opening/closing tags
  if (contentTags.includes(tagName) && hasContent) {
    return `${' '.repeat(obj.spaces)}<${tagName}${attributesStr}>${obj.content.trim()}</${tagName}>`
  }
  
  // Handle self-closing tags - ONLY if they have no content and are in the self-closing list
  const isSelfClosingTag = ['sprite', 'bg', 'char', 'set'].includes(tagName)
  
  // Only self-close if it's one of the special tags AND has no content AND is marked as single
  if (isSelfClosingTag && !hasContent && obj.single) {
    return `${' '.repeat(obj.spaces)}<${tagName}${attributesStr}/>`
  }
  
  // Handle single tags with content
  if (obj.single) {
    return `${' '.repeat(obj.spaces)}<${tagName}${attributesStr}>${obj.content || ''}</${tagName}>`
  }
  
  // Handle opening tags
  return `${' '.repeat(obj.spaces)}<${tagName}${attributesStr}>${obj.content || ''}`
}

const mods = ref({})
const assets = ref([])
const sidebarOpen = ref(false)
const burgerMenuOpen = ref(false)
const isLoading = ref(true)

// Function to get parent tag for a step
const getParentTag = (moduleName, stepIndex) => {
  if (!mods.value[moduleName]) return ''
  
  const steps = mods.value[moduleName]
  const currentStep = steps[stepIndex]
  if (!currentStep) return ''
  
  // Find the nearest opening tag with less indentation that's not closed yet
  let parentTag = ''
  let openTags = []
  
  for (let i = 0; i <= stepIndex; i++) {
    const step = steps[i]
    
    if (step.closing) {
      // Remove from open tags when we encounter closing tag
      const tagName = step.tag.startsWith('/') ? step.tag.substring(1) : step.tag
      const index = openTags.lastIndexOf(tagName)
      if (index !== -1) {
        openTags.splice(index, 1)
      }
    } else if (!step.tag.startsWith('/') && step.tag !== '') {
      // Add to open tags when we encounter opening tag
      openTags.push(step.tag)
    }
    
    if (i === stepIndex) {
      // Current step's parent is the last open tag (if any)
      if (openTags.length > 1) {
        parentTag = openTags[openTags.length - 2] || ''
      }
    }
  }
  
  return parentTag
}

// Check if tag can be placed at current level
const canPlaceTagHere = (tag, spaces) => {
  const restrictedTags = ['tx', 'sprite', 'bg', 'char', 'option']
  const tagName = tag.replace('/', '')
  
  // Options can only be placed inside choice tags (handled by parentTag in Step.vue)
  // For now, just check the indentation rule for other restricted tags
  return !restrictedTags.includes(tagName) || spaces >= 4
}

// Add/Remove functionality
const addStep = (moduleName, stepIndex) => {
  if (!mods.value[moduleName]) {
    console.error(`Module "${moduleName}" not found`)
    return
  }
  
  const currentStep = mods.value[moduleName][stepIndex]
  if (!currentStep) {
    console.error(`Step at index ${stepIndex} not found in module "${moduleName}"`)
    return
  }
  
  const parentTag = getParentTag(moduleName, stepIndex)
  let newTag = 'tx'
  
  // If inside a choice, default to option tag
  if (parentTag === 'choice') {
    newTag = 'option'
  }
  
  const newStep = {
    tag: newTag,
    content: '',
    spaces: currentStep.spaces,
    single: true,
    closing: false,
    attributes: {}
  }
  
  const steps = [...mods.value[moduleName]]
  steps.splice(stepIndex + 1, 0, newStep)
  mods.value[moduleName] = steps
}

const removeStep = (moduleName, stepIndex) => {
  if (!mods.value[moduleName]) {
    console.error(`Module "${moduleName}" not found`)
    return
  }
  
  if (confirm('Are you sure you want to remove this step?')) {
    const steps = [...mods.value[moduleName]]
    steps.splice(stepIndex, 1)
    mods.value[moduleName] = steps
  }
}

// Add option inside choice
const addOptionInsideChoice = (moduleName, stepIndex) => {
  if (!mods.value[moduleName]) {
    console.error(`Module "${moduleName}" not found`)
    return
  }
  
  const currentStep = mods.value[moduleName][stepIndex]
  if (!currentStep) {
    console.error(`Step at index ${stepIndex} not found in module "${moduleName}"`)
    return
  }
  
  // Find where to insert the option (inside the choice)
  let insertIndex = stepIndex + 1
  const steps = mods.value[moduleName]
  
  // Look for the next closing choice tag
  while (insertIndex < steps.length) {
    if (steps[insertIndex].tag === '/choice') {
      break
    }
    insertIndex++
  }
  
  const newOption = {
    tag: 'option',
    content: '',
    spaces: currentStep.spaces + 4, // Indent options inside choice
    single: true,
    closing: false,
    attributes: {}
  }
  
  const newSteps = [...steps]
  newSteps.splice(insertIndex, 0, newOption)
  mods.value[moduleName] = newSteps
}

// Module management
const addModule = () => {
  const moduleName = prompt('Enter module name:', `module_${Object.keys(mods.value).length + 1}`)
  if (moduleName && !mods.value[moduleName]) {
    mods.value[moduleName] = [{
      tag: 'module',
      attributes: { name: { nodeValue: moduleName, value: moduleName } },
      spaces: 0,
      single: false,
      closing: false
    }, {
      tag: 'step',
      spaces: 4,
      single: false,
      closing: false
    }, {
      tag: '/step',
      spaces: 4,
      single: true,
      closing: true
    }, {
      tag: '/module',
      spaces: 0,
      single: true,
      closing: true
    }]
  }
}

const removeModule = (moduleName) => {
  if (confirm(`Are you sure you want to remove module "${moduleName}"?`)) {
    const newMods = { ...mods.value }
    delete newMods[moduleName]
    mods.value = newMods
  }
}

// Upload functionality
const uploadStory = async () => {
  try {
    // Convert mods to XML
    let xmlContent = '<story>\n'
    for (const [moduleName, steps] of Object.entries(mods.value)) {
      // Find the module definition (first step with tag 'module')
      const moduleStep = steps.find(step => step.tag === 'module')
      const actualModuleName = moduleStep?.attributes?.name?.value || moduleName
      
      xmlContent += `${' '.repeat(2)}<module name="${actualModuleName}">\n`
      
      // Add all steps except module definition and closing module tag
      for (const step of steps) {
        if (step.tag !== 'module' && !step.tag.startsWith('/module')) {
          xmlContent += `${JSONtoXML(step)}\n`
        }
      }
      
      xmlContent += `${' '.repeat(2)}</module>\n`
    }
    xmlContent += '</story>'
    
    console.log('Generated XML:', xmlContent)
    
    const sid = localStorage.getItem('sid')
    const storyId = route.params.id
    
    const response = await fetch(`${backendUrl}storage/update_story_content`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sid: sid,
        id: parseInt(storyId),
        content: xmlContent
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to upload story: ${errorData}`)
    }
    
    alert('Story uploaded successfully!')
    console.log('Upload response:', await response.json())
  } catch (error) {
    console.error('Upload error:', error)
    alert(`Error uploading story: ${error.message}`)
  }
}

// Load assets
const loadAssets = async () => {
  try {
    const sid = localStorage.getItem('sid')
    const storyId = route.params.id
    
    const response = await fetch(`${backendUrl}storage/list_story_assets/${storyId}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${sid}`
      }
    })
    
    if (!response.ok) throw new Error('Failed to load assets')
    const data = await response.json()
    
    if (Array.isArray(data)) {
      assets.value = data.map(asset => ({
        id: asset,
        name: asset,
        type: getAssetType(asset),
        url: `${backendUrl}storage/asset_content/${storyId}/${asset}`
      }))
    } else if (data.assets && Array.isArray(data.assets)) {
      assets.value = data.assets.map(asset => ({
        id: asset,
        name: asset,
        type: getAssetType(asset),
        url: `${backendUrl}storage/asset_content/${storyId}/${asset}`
      }))
    } else {
      console.warn('Unexpected assets response format:', data)
      assets.value = []
    }
    
    console.log('Loaded assets:', assets.value)
  } catch (error) {
    console.error('Error loading assets:', error)
    assets.value = []
  }
}

// Helper function to determine asset type
const getAssetType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return 'image'
  } else if (['mp3', 'wav', 'ogg'].includes(ext)) {
    return 'audio'
  } else if (['mp4', 'webm', 'avi'].includes(ext)) {
    return 'video'
  } else {
    return 'other'
  }
}

// Handle asset selection
const handleAssetSelected = (asset) => {
  console.log('Asset selected:', asset)
  sidebarOpen.value = false
}

onMounted(async () => {
  try {
    const xml = await downloadStory()
    console.log('Downloaded XML:', xml)
    
    const parsed = parseXML(xml)
    if (parsed.documentElement && parsed.documentElement.tagName === 'story') {
      for (const i of parsed.documentElement.children) {
        if (i.tagName === 'module') {
          let t = []
          const serialized = serializeXML(i)
          
          // Parse the entire module content properly
          const lines = serialized.split('\n')
          for (const line of lines) {
            if (line.trim()) {
              const json = XMLtoJSON(line)
              if (json.tag) {
                t.push(json)
              }
            }
          }
          
          const moduleName = i.getAttribute('name') || `module_${Object.keys(mods.value).length + 1}`
          mods.value[moduleName] = t
        }
      }
    }
    
    console.log('Parsed modules:', mods.value)
    await loadAssets()
  } catch (error) {
    console.error('Initialization error:', error)
    // Initialize with default module
    mods.value[`module_1`] = [{
      tag: 'module',
      attributes: { name: { nodeValue: 'module_1', value: 'module_1' } },
      spaces: 0,
      single: false,
      closing: false
    }, {
      tag: 'step',
      spaces: 4,
      single: false,
      closing: false
    }, {
      tag: '/step',
      spaces: 4,
      single: true,
      closing: true
    }, {
      tag: '/module',
      spaces: 0,
      single: true,
      closing: true
    }]
  } finally {
    isLoading.value = false
    await nextTick()
  }
})

// Toggle burger menu
const toggleBurgerMenu = () => {
  burgerMenuOpen.value = !burgerMenuOpen.value
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (burgerMenuOpen.value && !event.target.closest('.burger-menu') && !event.target.closest('.burger-btn')) {
    burgerMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Refresh assets when needed
const handleRefreshAssets = async () => {
  await loadAssets()
  sidebarOpen.value = true
}

// Listen for refresh events
onMounted(() => {
  window.addEventListener('refresh-assets', handleRefreshAssets)
})

onUnmounted(() => {
  window.removeEventListener('refresh-assets', handleRefreshAssets)
})

// Safe update step function
const safeUpdateStep = (moduleName, stepIndex, updatedJson) => {
  if (!mods.value[moduleName]) {
    console.error(`Module "${moduleName}" not found during update`)
    return
  }
  
  if (stepIndex < 0 || stepIndex >= mods.value[moduleName].length) {
    console.error(`Invalid step index ${stepIndex} for module "${moduleName}"`)
    return
  }
  
  try {
    const steps = [...mods.value[moduleName]]
    steps[stepIndex] = updatedJson
    mods.value[moduleName] = steps
  } catch (error) {
    console.error('Error updating step:', error)
    console.error('Module:', moduleName, 'Step index:', stepIndex, 'Updated JSON:', updatedJson)
  }
}
</script>

<template>
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading story...</p>
  </div>
  
  <div v-else class="editor-container">
    <AssetSidebar 
      :assets="assets" 
      :open="sidebarOpen" 
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @asset-selected="handleAssetSelected"
    />
    
    <div class="main-content">
      <div class="editor-header">
        <div class="burger-menu-container">
          <button @click="toggleBurgerMenu" class="burger-btn">
            🍔
          </button>
          <div v-if="burgerMenuOpen" class="burger-menu">
            <button @click="sidebarOpen = true; burgerMenuOpen = false" class="menu-item">
              🗂️ Assets
            </button>
            <button @click="addModule(); burgerMenuOpen = false" class="menu-item">
              ➕ Add Module
            </button>
            <button @click="uploadStory(); burgerMenuOpen = false" class="menu-item">
              📤 Upload Story
            </button>
          </div>
        </div>
        <h1>Story Editor</h1>
        <h2>ID: {{route.params.id}}</h2>
        <button @click="uploadStory" class="upload-btn">📤 Upload</button>
      </div>
      
      <div class="module-controls">
        <button @click="addModule" class="add-module-btn">+ Add Module</button>
      </div>
      
      <div class="wrapper">
        <ul class="mods-list">
          <li v-for="(mod, moduleName) in mods" :key="moduleName" class="module-item">
            <div class="module-header">
              <h3>Module: {{ moduleName }}</h3>
              <button @click="removeModule(moduleName)" class="remove-module-btn">×</button>
            </div>
            
            <ul class="steps-list">
              <li v-for="(json, stepIndex) in mod" :key="`${moduleName}-${stepIndex}`">
                <Step 
                  :json="json" 
                  :module-name="moduleName" 
                  :step-index="stepIndex"
                  :can-place-tag="canPlaceTagHere"
                  :parent-tag="getParentTag(moduleName, stepIndex)"
                  @add-step="addStep(moduleName, stepIndex)"
                  @remove-step="removeStep(moduleName, stepIndex)"
                  @add-option="addOptionInsideChoice(moduleName, stepIndex)"
                  @update-step="(updatedJson) => safeUpdateStep(moduleName, stepIndex, updatedJson)"
                />
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
/* Keep all existing Editor.vue styles exactly as they are */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.editor-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.burger-menu-container {
  position: relative;
}

.burger-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  z-index: 1001;
}

.burger-menu {
  position: absolute;
  top: 40px;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 1000;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 10px 15px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f0f0f0;
}

.upload-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.upload-btn:hover {
  background-color: #0b7dda;
}

.module-controls {
  margin-bottom: 20px;
}

.add-module-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-module-btn:hover {
  background-color: #45a049;
}

.module-item {
  max-width: 90vw;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.module-item > * {
  max-width: 100%;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: var(--black);
}

h3 {
  color: var(--black);
}

.remove-module-btn {
  background-color: #f44336;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
}

.remove-module-btn:hover {
  background-color: #d32f2f;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

.wrapper {
  width: 100%;
  overflow-x: auto;
}

.mods-list {
  display: flex;
  gap: 30px;
  margin: 20px auto;
}

.steps-list {
  display: block;
  padding-left: 20px;
}

.steps-list > li {
  margin-bottom: 8px;
}
</style>