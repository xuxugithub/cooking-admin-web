<template>
  <div class="page-container">
    <h2 style="margin-bottom: 20px;">个人信息</h2>

    <el-card style="max-width: 600px;">
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="最后登录">
          <span>{{ form.lastLoginTime || '暂无记录' }}</span>
        </el-form-item>
        
        <el-form-item label="创建时间">
          <span>{{ form.createTime }}</span>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存修改
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getAdminInfo, updateAdminInfo } from '@/api/auth'

const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  name: '',
  phone: '',
  email: '',
  lastLoginTime: '',
  createTime: ''
})

const originalForm = reactive({})

const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur'
    }
  ]
}

// 加载管理员信息
const loadAdminInfo = async () => {
  try {
    const response = await getAdminInfo()
    if (response.code === 200) {
      const data = response.data
      Object.assign(form, {
        username: data.username,
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        lastLoginTime: data.lastLoginTime || '',
        createTime: data.createTime || ''
      })
      
      // 保存原始数据用于重置
      Object.assign(originalForm, form)
    }
  } catch (error) {
    console.error('加载管理员信息失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    const updateData = {
      name: form.name,
      phone: form.phone,
      email: form.email
    }
    
    const response = await updateAdminInfo(updateData)
    if (response.code === 200) {
      ElMessage.success('修改成功')
      
      // 更新store中的管理员信息
      if (authStore.adminInfo) {
        authStore.adminInfo.name = form.name
      }
      
      // 重新加载信息
      await loadAdminInfo()
    }
  } catch (error) {
    console.error('修改失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  Object.assign(form, originalForm)
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

onMounted(() => {
  loadAdminInfo()
})
</script>

<style scoped>
.el-form-item:last-child {
  margin-bottom: 0;
}
</style>