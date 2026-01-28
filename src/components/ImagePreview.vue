<template>
  <div class="image-preview-wrapper">
    <el-image
      :src="previewSrc"
      :style="{ width: width + 'px', height: height + 'px' }"
      fit="cover"
      :preview-src-list="previewList"
      :preview-teleported="true"
      @error="handleError"
      class="preview-image"
    >
      <template #error>
        <div class="image-error" :style="{ width: width + 'px', height: height + 'px' }">
          <el-icon class="error-icon"><Picture /></el-icon>
          <div class="error-text">暂无图片</div>
        </div>
      </template>
      <template #placeholder>
        <div class="image-loading" :style="{ width: width + 'px', height: height + 'px' }">
          <el-icon class="loading-icon"><Loading /></el-icon>
        </div>
      </template>
    </el-image>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  width: {
    type: Number,
    default: 60
  },
  height: {
    type: Number,
    default: 60
  }
})

const imageError = ref(false)

// 预览图片源
const previewSrc = computed(() => {
  if (!props.src || imageError.value) {
    return null // 返回null让el-image显示error slot
  }
  
  // 如果是文件名，构造预览URL
  if (props.src && !props.src.startsWith('http') && !props.src.startsWith('/')) {
    return `/admin/file/preview/${props.src}`
  }
  
  return props.src
})

// 预览列表（用于放大查看）
const previewList = computed(() => {
  return props.src && !imageError.value ? [previewSrc.value] : []
})

const handleError = () => {
  console.log('图片加载失败:', props.src)
  imageError.value = true
}
</script>

<style scoped>
.image-preview-wrapper {
  display: inline-block;
}

.preview-image {
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 4px;
  color: #909399;
  transition: all 0.3s ease;
}

.image-error:hover {
  background: linear-gradient(135deg, #e4e7ed 0%, #bdc3c7 100%);
}

.error-icon {
  font-size: 20px;
  margin-bottom: 4px;
  opacity: 0.6;
}

.error-text {
  font-size: 11px;
  opacity: 0.8;
}

.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.loading-icon {
  font-size: 16px;
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
</style>