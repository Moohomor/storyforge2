<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const props = defineProps({
  assets: {
    type: Array,
    default: () => []
  },
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-sidebar', 'asset-selected'])
const fileInput = ref(null)
const previewFile = ref(null)
const previewUrl = ref(null)
const uploadProgress = ref(0)
const isUploading = ref(false)

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    previewFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    // Reset input for future selections
    event.target.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleAssetClick = (asset) => {
  emit('asset-selected', asset)
}

const categorizedAssets = computed(() => {
  const categories = {
    all: [...props.assets]
  }
  return categories
})

const getAssetTypeFromName = (filename) => {
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

const uploadAssetToServer = async () => {
  if (!previewFile.value) return
  
  try {
    isUploading.value = true
    uploadProgress.value = 0
    
    const sid = localStorage.getItem('sid')
    const storyId = route.params.id
    
    const formData = new FormData()
    formData.append('file', previewFile.value)
    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}storage/new_asset?sid=${sid}&story_id=${parseInt(storyId)}`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Upload failed: ${errorData}`)
    }
    
    const result = await response.json()
    console.log('Asset uploaded successfully:', result)
    
    // Refresh assets
    const refreshEvent = new Event('refresh-assets')
    window.dispatchEvent(refreshEvent)
    
    // Reset
    previewFile.value = null
    previewUrl.value = null
    alert('Asset uploaded successfully!')
    return result
  } catch (error) {
    console.error('Asset upload error:', error)
    alert(`Error uploading asset: ${error.message}`)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const handleImageError = (asset) => {
  console.warn('Failed to load asset preview:', asset)
}
</script>

<template>
  <div class="asset-sidebar" :class="{ 'open': open }">
    <div class="sidebar-header">
      <h2>Assets</h2>
      <button @click="$emit('toggle-sidebar')" class="toggle-btn close-btn">
        ×
      </button>
    </div>
    
    <div class="upload-section">
      <div class="upload-container">
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          style="display: none"
          accept="image/*,audio/*,video/*"
        />
        <button @click="triggerFileInput" class="upload-btn" :disabled="isUploading">
          📤 Select Asset
        </button>
        <button 
          v-if="previewFile" 
          @click="uploadAssetToServer" 
          class="confirm-upload-btn"
          :disabled="isUploading"
        >
          {{ isUploading ? `Uploading... ${uploadProgress}%` : '✅ Upload' }}
        </button>
      </div>
      
      <div v-if="previewUrl" class="preview-container">
        <img 
          v-if="getAssetTypeFromName(previewFile.name) === 'image'" 
          :src="previewUrl" 
          alt="Preview" 
          class="preview-image" 
          @error="previewUrl = null"
        />
        <div v-else class="preview-placeholder">
          <span class="file-icon">
            {{ getAssetTypeFromName(previewFile.name) === 'audio' ? '🎵' : getAssetTypeFromName(previewFile.name) === 'video' ? '🎬' : '📁' }}
          </span>
          <span class="file-name">{{ previewFile.name }}</span>
        </div>
        <button @click="previewUrl = null; previewFile = null" class="remove-preview">×</button>
      </div>
    </div>
    
    <div class="assets-container">
      <div v-if="assets.length === 0" class="empty-state">
        <p>No assets uploaded yet</p>
        <button @click="triggerFileInput" class="upload-hint-btn">Upload your first asset</button>
      </div>
      
      <div v-else class="asset-grid">
        <div 
          v-for="asset in assets" 
          :key="asset.id || asset.name || asset" 
          class="asset-item"
          @click="handleAssetClick(asset)"
          :title="asset.name || asset"
        >
          <div class="asset-preview">
            <img 
              v-if="asset.type === 'image'" 
              :src="asset.url || asset" 
              alt="Asset preview"
              class="asset-thumbnail"
              @error="handleImageError(asset)"
            />
            <div v-else class="asset-icon">
              {{ asset.type === 'audio' ? '🎵' : asset.type === 'video' ? '🎬' : '📁' }}
            </div>
          </div>
          <div class="asset-name">
            {{ (asset.name || asset).substring(0, 15) }}{{ (asset.name || asset).length > 15 ? '...' : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-if="open" class="sidebar-overlay" @click="$emit('toggle-sidebar')"></div>
</template>

<style scoped>
.asset-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 320px;
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.asset-sidebar.open {
  transform: translateX(0);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 100;
}

.close-btn {
  background-color: #dc3545;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-section {
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
}

.upload-container {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.upload-btn, .confirm-upload-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.upload-btn {
  background-color: #007bff;
  color: white;
}

.upload-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.confirm-upload-btn {
  background-color: #28a745;
  color: white;
}

.confirm-upload-btn:hover:not(:disabled) {
  background-color: #218838;
}

.preview-container {
  position: relative;
  margin-top: 10px;
  text-align: center;
  min-height: 100px;
}

.preview-image {
  max-width: 100%;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  border: 2px dashed #6c757d;
  border-radius: 4px;
  padding: 10px;
}

.file-icon {
  font-size: 32px;
  margin-bottom: 5px;
}

.file-name {
  font-size: 14px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.remove-preview {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.assets-container {
  padding: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.upload-hint-btn {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.asset-item {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: white;
  border: 1px solid #e9ecef;
}

.asset-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.asset-preview {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  overflow: hidden;
}

.asset-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-icon {
  font-size: 24px;
  color: #6c757d;
}

.asset-name {
  font-size: 12px;
  text-align: center;
  padding: 4px 2px;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}
</style>