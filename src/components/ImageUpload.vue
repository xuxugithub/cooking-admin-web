<template>
  <div class="image-upload">
    <el-upload
      :action="uploadAction"
      :headers="uploadHeaders"
      :show-file-list="false"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :disabled="loading"
      accept="image/*"
      :http-request="customUpload"
    >
      <div v-if="previewUrl" class="image-preview">
        <el-image
          :src="previewUrl"
          :style="{ width: width + 'px', height: height + 'px' }"
          fit="cover"
          :preview-src-list="[previewUrl]"
        />
        <div class="image-overlay">
          <el-icon class="overlay-icon"><View /></el-icon>
          <el-icon class="overlay-icon" @click.stop="removeImage"><Delete /></el-icon>
        </div>
      </div>
      <div v-else class="upload-placeholder" :style="{ width: width + 'px', height: height + 'px' }">
        <el-icon v-if="!loading" class="upload-icon"><Plus /></el-icon>
        <el-icon v-else class="upload-icon loading"><Loading /></el-icon>
        <div class="upload-text">{{ loading ? '上传中...' : '点击上传' }}</div>
      </div>
    </el-upload>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile } from '@/api/upload'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  width: {
    type: Number,
    default: 150
  },
  height: {
    type: Number,
    default: 150
  },
  maxSize: {
    type: Number,
    default: 5 // MB
  }
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const uploadedFile = ref(null) // 存储上传后的文件信息

const fileName = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 预览URL：如果是刚上传的文件使用blob URL，否则使用预览接口
const previewUrl = computed(() => {
  if (uploadedFile.value && uploadedFile.value.blobUrl) {
    // 刚上传的文件，使用blob URL
    return uploadedFile.value.blobUrl
  } else if (fileName.value) {
    // 已存在的文件，使用预览接口
    return `/admin/file/preview/${fileName.value}`
  }
  return ''
})

const uploadAction = '/admin/file/upload' // 这个不会被使用，因为我们用了自定义上传

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < props.maxSize

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isValidType) {
    ElMessage.error('只支持 JPG、PNG、GIF、WEBP 格式的图片!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB!`)
    return false
  }

  return true
}

// 自定义上传方法
const customUpload = async (options) => {
  const { file } = options
  
  if (!beforeUpload(file)) {
    return
  }
  
  loading.value = true
  
  try {
    // 创建blob URL用于立即预览
    const blobUrl = URL.createObjectURL(file)
    
    const response = await uploadFile(file)
    console.log('上传响应:', response)
    
    if (response.code === 200) {
      console.log('上传成功，文件名:', response.data.fileName)
      
      // 设置文件名到v-model
      fileName.value = response.data.fileName
      
      // 存储上传文件信息，包含blob URL用于预览
      uploadedFile.value = {
        fileName: response.data.fileName,
        originalName: response.data.originalName,
        blobUrl: blobUrl
      }
      
      ElMessage.success('上传成功')
      
      // 调用Element Plus的成功回调
      options.onSuccess(response)
    } else {
      console.error('上传失败，响应:', response)
      URL.revokeObjectURL(blobUrl) // 清理blob URL
      ElMessage.error(response.message || '上传失败')
      options.onError(new Error(response.message || '上传失败'))
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error('上传失败，请重试')
    options.onError(error)
  } finally {
    loading.value = false
  }
}

const handleSuccess = (response) => {
  // 这个方法现在主要用于兼容，实际逻辑在customUpload中
  console.log('handleSuccess 被调用:', response)
}

const handleError = (error) => {
  console.error('handleError 被调用:', error)
}

const removeImage = () => {
  // 清理blob URL
  if (uploadedFile.value && uploadedFile.value.blobUrl) {
    URL.revokeObjectURL(uploadedFile.value.blobUrl)
  }
  
  fileName.value = ''
  uploadedFile.value = null
}
</script>

<style scoped>
.image-upload {
  display: inline-block;
}

.image-preview {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.overlay-icon {
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  transition: background-color 0.3s;
}

.overlay-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.upload-placeholder {
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  background-color: #fafafa;
}

.upload-placeholder:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-icon.loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.upload-text {
  color: #8c939d;
  font-size: 14px;
}
</style>