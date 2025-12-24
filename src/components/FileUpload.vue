<!-- components/FileUpload.vue -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  endpoint: { type: String, default: '/upload' },
  multiple: { type: Boolean, default: false }
})

const emit = defineEmits(['uploaded', 'error'])
const files = ref([])
const isUploading = ref(false)
const uploadProgress = ref(0)

const handleFileSelect = (event) => {
  files.value = Array.from(event.target.files)
}

const uploadFiles = async () => {
  if (!files.value.length) return
  
  isUploading.value = true
  const formData = new FormData()
  
  files.value.forEach(file => {
    formData.append('files', file)
  })

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${props.endpoint}`, {
      method: 'POST',
      body: formData,
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    if (!response.ok) throw new Error('Upload failed')
    
    const result = await response.json()
    emit('uploaded', result)
    files.value = []
    uploadProgress.value = 0
  } catch (error) {
    emit('error', error.message)
    console.error('Upload error:', error)
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="file-upload">
    <input 
      type="file" 
      @change="handleFileSelect" 
      :multiple="multiple"
      :disabled="isUploading"
    />
    <button @click="uploadFiles" :disabled="!files.length || isUploading">
      {{ isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Files' }}
    </button>
    <div v-if="files.length" class="file-list">
      <div v-for="(file, index) in files" :key="index" class="file-item">
        {{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)
      </div>
    </div>
  </div>
</template>