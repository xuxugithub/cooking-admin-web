<template>
  <div class="page-container">
    <h2>文件上传测试</h2>
    
    <div style="margin-bottom: 20px;">
      <h3>当前配置信息：</h3>
      <p>前端baseURL: /admin</p>
      <p>上传接口: /file/upload (完整路径: /admin/file/upload)</p>
      <p>预览接口: /admin/file/preview/{fileName}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3>上传测试：</h3>
      <ImageUpload v-model="testFileName" :width="200" :height="200" />
      <p v-if="testFileName">当前文件名: {{ testFileName }}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h3>手动测试接口：</h3>
      <el-button @click="testUploadAPI">测试上传API连通性</el-button>
      <el-button @click="testPreviewAPI" :disabled="!testFileName">测试预览API</el-button>
    </div>
    
    <div v-if="testResult" style="margin-top: 20px;">
      <h3>测试结果：</h3>
      <pre>{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import ImageUpload from '@/components/ImageUpload.vue'
import request from '@/utils/request'

const testFileName = ref('')
const testResult = ref('')

const testUploadAPI = async () => {
  try {
    // 测试上传接口的连通性（不实际上传文件）
    const response = await request.get('/file/upload')
    testResult.value = `上传接口测试结果: ${JSON.stringify(response, null, 2)}`
  } catch (error) {
    testResult.value = `上传接口错误: ${error.message}\n状态码: ${error.response?.status}\n响应: ${JSON.stringify(error.response?.data, null, 2)}`
    console.error('上传接口测试失败:', error)
  }
}

const testPreviewAPI = () => {
  if (testFileName.value) {
    const previewUrl = `/admin/file/preview/${testFileName.value}`
    testResult.value = `预览URL: ${previewUrl}\n请在新标签页中打开此URL测试预览功能`
    
    // 在新窗口中打开预览URL
    window.open(previewUrl, '_blank')
  } else {
    ElMessage.warning('请先上传一个文件')
  }
}
</script>