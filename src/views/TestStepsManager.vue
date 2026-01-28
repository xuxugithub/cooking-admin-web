<template>
  <div class="test-container">
    <h2>制作步骤管理器测试</h2>
    
    <el-alert 
      title="测试页面" 
      type="info" 
      description="这是一个测试页面，用于验证DishStepsManager组件功能"
      show-icon
      style="margin-bottom: 20px;"
    />
    
    <el-card>
      <template #header>
        <div>测试菜品：红烧肉</div>
      </template>
      
      <div v-if="showManager">
        <DishStepsManager
          :dish-id="1"
          v-model="testSteps"
          @save="handleSave"
        />
      </div>
      <div v-else>
        <el-button type="primary" @click="showManager = true">
          加载步骤管理器
        </el-button>
      </div>
    </el-card>
    
    <div style="margin-top: 20px;">
      <h3>当前步骤数据：</h3>
      <pre>{{ JSON.stringify(testSteps, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import DishStepsManager from '@/components/DishStepsManager.vue'

const showManager = ref(true)

const testSteps = ref([
  {
    id: 1,
    dishId: 1,
    stepNumber: 1,
    description: '将五花肉切成2cm见方的块，用开水焯烫去血水',
    image: '',
    duration: '10',
    difficulty: 'easy',
    temperature: ''
  },
  {
    id: 2,
    dishId: 1,
    stepNumber: 2,
    description: '热锅下油，放入冰糖炒制糖色',
    image: '',
    duration: '5',
    difficulty: 'medium',
    temperature: '120'
  }
])

const handleSave = (steps) => {
  console.log('保存步骤:', steps)
  ElMessage.success('步骤保存成功！')
}
</script>

<style scoped>
.test-container {
  padding: 20px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
}
</style>