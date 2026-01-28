<template>
  <div class="dish-steps-manager">
    <!-- 操作按钮 -->
    <div class="steps-toolbar">
      <el-button type="primary" @click="addStep">
        <el-icon><Plus /></el-icon>
        添加步骤
      </el-button>
      <el-button type="success" @click="saveSteps" :loading="loading">
        <el-icon><Check /></el-icon>
        保存步骤
      </el-button>
      <el-button @click="previewSteps" v-if="steps.length > 0">
        <el-icon><View /></el-icon>
        预览步骤
      </el-button>
      <el-button @click="importTemplate" type="info">
        <el-icon><Document /></el-icon>
        导入模板
      </el-button>
      <el-text size="small" type="info" style="margin-left: 10px;">
        使用上下箭头按钮调整步骤顺序
      </el-text>
    </div>
    
    <!-- 步骤列表 -->
    <div v-if="steps.length > 0" class="steps-container">
      <div class="steps-list">
        <div v-for="(step, index) in steps" :key="step.id || index" class="step-item">
          <el-card shadow="hover">
            <template #header>
              <div class="step-header">
                <div class="step-title">
                  <el-icon class="drag-handle"><Rank /></el-icon>
                  <span>步骤 {{ index + 1 }}</span>
                  <el-tag v-if="step.isRequired" type="danger" size="small">必需</el-tag>
                </div>
                <div class="step-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="moveStepUp(index)"
                    :disabled="index === 0"
                  >
                    <el-icon><ArrowUp /></el-icon>
                  </el-button>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="moveStepDown(index)"
                    :disabled="index === steps.length - 1"
                  >
                    <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <el-button type="warning" size="small" @click="duplicateStep(index)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                  <el-button type="danger" size="small" @click="removeStep(index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="step-image-section">
                  <div class="section-label">步骤图片</div>
                  <ImageUpload v-model="step.image" :width="200" :height="150" />
                  <div class="image-tips">
                    <el-text size="small" type="info">建议尺寸：400x300px</el-text>
                  </div>
                </div>
              </el-col>
              <el-col :span="16">
                <div class="step-description-section">
                  <div class="section-label">
                    步骤描述
                    <el-tooltip content="详细描述制作步骤，包括操作方法、注意事项、时间等">
                      <el-icon><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <el-input
                    v-model="step.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请详细描述制作步骤，例如：将洋葱切丝，热锅下油，中火炒制3-5分钟至微黄..."
                    maxlength="500"
                    show-word-limit
                  />
                  
                  <!-- 额外信息 -->
                  <div class="step-extra-info">
                    <el-row :gutter="10">
                      <el-col :span="8">
                        <el-input
                          v-model="step.duration"
                          placeholder="耗时(分钟)"
                          size="small"
                        >
                          <template #prepend>
                            <el-icon><Timer /></el-icon>
                          </template>
                        </el-input>
                      </el-col>
                      <el-col :span="8">
                        <el-select v-model="step.difficulty" placeholder="难度" size="small">
                          <el-option label="简单" value="easy" />
                          <el-option label="中等" value="medium" />
                          <el-option label="困难" value="hard" />
                        </el-select>
                      </el-col>
                      <el-col :span="8">
                        <el-input
                          v-model="step.temperature"
                          placeholder="温度(°C)"
                          size="small"
                        >
                          <template #prepend>
                            <el-icon><Sunny /></el-icon>
                          </template>
                        </el-input>
                      </el-col>
                    </el-row>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-steps">
      <el-empty description="暂无制作步骤">
        <el-button type="primary" @click="addStep">添加第一个步骤</el-button>
      </el-empty>
    </div>

    <!-- 步骤预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="制作步骤预览"
      width="700px"
    >
      <div class="steps-preview">
        <div v-for="(step, index) in steps" :key="index" class="preview-step">
          <div class="preview-step-header">
            <span class="step-number">{{ index + 1 }}</span>
            <span class="step-title">步骤 {{ index + 1 }}</span>
            <div class="step-meta">
              <el-tag v-if="step.duration" size="small" type="info">
                <el-icon><Timer /></el-icon>
                {{ step.duration }}分钟
              </el-tag>
              <el-tag v-if="step.difficulty" size="small" :type="getDifficultyType(step.difficulty)">
                {{ getDifficultyText(step.difficulty) }}
              </el-tag>
              <el-tag v-if="step.temperature" size="small" type="warning">
                <el-icon><Sunny /></el-icon>
                {{ step.temperature }}°C
              </el-tag>
            </div>
          </div>
          <div class="preview-step-content">
            <div v-if="step.image" class="preview-image">
              <ImagePreview :src="step.image" :width="150" :height="100" />
            </div>
            <div class="preview-description">
              {{ step.description || '暂无描述' }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 模板选择对话框 -->
    <el-dialog
      v-model="templateVisible"
      title="选择步骤模板"
      width="600px"
    >
      <div class="template-list">
        <el-row :gutter="16">
          <el-col :span="12" v-for="template in stepTemplates" :key="template.id">
            <el-card class="template-card" @click="selectTemplate(template)">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-desc">{{ template.description }}</div>
              <div class="template-steps">{{ template.steps.length }} 个步骤</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImageUpload from './ImageUpload.vue'
import ImagePreview from './ImagePreview.vue'

const props = defineProps({
  dishId: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const loading = ref(false)
const previewVisible = ref(false)
const templateVisible = ref(false)

const steps = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 步骤模板
const stepTemplates = ref([
  {
    id: 1,
    name: '炒菜基础步骤',
    description: '适用于大部分炒菜类菜品',
    steps: [
      { description: '准备食材，洗净切好', image: '', duration: '10' },
      { description: '热锅下油，爆香配料', image: '', duration: '2' },
      { description: '下主料炒制', image: '', duration: '5' },
      { description: '调味装盘', image: '', duration: '2' }
    ]
  },
  {
    id: 2,
    name: '汤类基础步骤',
    description: '适用于各种汤品制作',
    steps: [
      { description: '准备食材，处理干净', image: '', duration: '15' },
      { description: '冷水下锅，大火烧开', image: '', duration: '10' },
      { description: '转小火慢炖', image: '', duration: '30' },
      { description: '调味出锅', image: '', duration: '5' }
    ]
  }
])

// 添加步骤
const addStep = () => {
  const newStep = {
    id: Date.now(),
    dishId: props.dishId,
    stepNumber: steps.value.length + 1,
    description: '',
    image: '',
    duration: '',
    difficulty: '',
    temperature: '',
    isRequired: false
  }
  steps.value.push(newStep)
}

// 删除步骤
const removeStep = (index) => {
  ElMessageBox.confirm('确定要删除这个步骤吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    steps.value.splice(index, 1)
    ElMessage.success('步骤已删除')
  }).catch(() => {
    // 用户取消
  })
}

// 上移步骤
const moveStepUp = (index) => {
  if (index > 0) {
    const temp = steps.value[index]
    steps.value[index] = steps.value[index - 1]
    steps.value[index - 1] = temp
    // 重新设置步骤序号
    steps.value.forEach((step, idx) => {
      step.stepNumber = idx + 1
    })
  }
}

// 下移步骤
const moveStepDown = (index) => {
  if (index < steps.value.length - 1) {
    const temp = steps.value[index]
    steps.value[index] = steps.value[index + 1]
    steps.value[index + 1] = temp
    // 重新设置步骤序号
    steps.value.forEach((step, idx) => {
      step.stepNumber = idx + 1
    })
  }
}

// 复制步骤
const duplicateStep = (index) => {
  const originalStep = steps.value[index]
  const duplicatedStep = {
    ...originalStep,
    id: Date.now(),
    stepNumber: steps.value.length + 1
  }
  steps.value.splice(index + 1, 0, duplicatedStep)
  ElMessage.success('步骤已复制')
}

// 保存步骤
const saveSteps = () => {
  if (steps.value.length === 0) {
    ElMessage.warning('请至少添加一个制作步骤')
    return
  }
  
  // 验证步骤描述
  for (let i = 0; i < steps.value.length; i++) {
    if (!steps.value[i].description.trim()) {
      ElMessage.warning(`请填写步骤 ${i + 1} 的描述`)
      return
    }
  }
  
  emit('save', steps.value)
}

// 预览步骤
const previewSteps = () => {
  previewVisible.value = true
}

// 导入模板
const importTemplate = () => {
  templateVisible.value = true
}

// 选择模板
const selectTemplate = (template) => {
  ElMessageBox.confirm(`确定要导入"${template.name}"模板吗？这将替换当前所有步骤。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const newSteps = template.steps.map((step, index) => ({
      id: Date.now() + index,
      dishId: props.dishId,
      stepNumber: index + 1,
      ...step
    }))
    steps.value = newSteps
    templateVisible.value = false
    ElMessage.success('模板导入成功')
  }).catch(() => {
    // 用户取消
  })
}

// 获取难度类型
const getDifficultyType = (difficulty) => {
  const typeMap = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }
  return typeMap[difficulty] || 'info'
}

// 获取难度文本
const getDifficultyText = (difficulty) => {
  const textMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return textMap[difficulty] || difficulty
}
</script>

<style scoped>
.dish-steps-manager {
  width: 100%;
}

.steps-toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.steps-container {
  max-height: 600px;
  overflow-y: auto;
}

.step-item {
  margin-bottom: 20px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #409eff;
}

.drag-handle {
  cursor: move;
  color: #909399;
}

.step-actions {
  display: flex;
  gap: 8px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.image-tips {
  margin-top: 8px;
  text-align: center;
}

.step-extra-info {
  margin-top: 12px;
}

.empty-steps {
  text-align: center;
  padding: 60px 0;
}

.steps-preview {
  max-height: 500px;
  overflow-y: auto;
}

.preview-step {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.preview-step:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.preview-step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  margin-right: 8px;
}

.step-meta {
  display: flex;
  gap: 8px;
}

.preview-step-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.preview-image {
  flex-shrink: 0;
}

.preview-description {
  flex: 1;
  line-height: 1.6;
  color: #606266;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.template-list {
  max-height: 400px;
  overflow-y: auto;
}

.template-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.template-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.template-steps {
  color: #909399;
  font-size: 12px;
}
</style>