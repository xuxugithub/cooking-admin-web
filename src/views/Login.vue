<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">管理员登录</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱"
            size="large"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            class="send-code-button"
            type="primary"
            size="large"
            :loading="sendingCode"
            :disabled="codeSent && countdown > 0"
            @click="handleSendCode"
          >
            {{ codeSent && countdown > 0 ? `${countdown}秒后可重发` : '发送验证码' }}
          </el-button>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="code">
          <el-input
            v-model="loginForm.code"
            placeholder="请输入验证码"
            size="large"
            prefix-icon="Key"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            class="login-button"
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!codeSent"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tip">
        请先发送验证码，然后输入密码和验证码登录
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref()
const loading = ref(false)
const sendingCode = ref(false)
const codeSent = ref(false)
const countdown = ref(0)

let countdownTimer = null

const loginForm = reactive({
  email: '',
  password: '',
  code: ''
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 发送验证码
const handleSendCode = async () => {
  // 只验证邮箱字段
  try {
    await loginFormRef.value.validateField('email')
  } catch {
    return
  }

  sendingCode.value = true

  try {
    const result = await authStore.sendCode(loginForm.email)

    if (result.success) {
      ElMessage.success(result.message || '验证码已发送，请查收邮件')
      codeSent.value = true
      countdown.value = 60
      startCountdown()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('发送验证码失败')
  } finally {
    sendingCode.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()

    loading.value = true
    const result = await authStore.login(loginForm)

    if (result.success) {
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;
}

/* 添加动态背景效果 */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 40%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(118, 75, 162, 0.15) 0%, transparent 50%);
  animation: bgMove 20s ease-in-out infinite;
}

@keyframes bgMove {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-5%, -5%); }
}

.login-form {
  width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(102, 126, 234, 0.1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #1a1a2e;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 2px;
}

/* 输入框样式优化 */
:deep(.el-input) {
  .el-input__wrapper {
    border-radius: 10px;
    padding: 4px 15px;
    background: #f5f7fa;
    box-shadow: none;
    border: 1px solid #e4e7ed;
    transition: all 0.3s ease;
  }

  .el-input__wrapper:hover {
    border-color: #c0c4cc;
  }

  .el-input__wrapper.is-focus {
    border-color: #667eea;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }

  .el-input__prefix-inner {
    color: #909399;
  }
}

.send-code-button {
  width: 100%;
  border-radius: 10px;
  font-weight: 500;
  height: 42px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.send-code-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-code-button:disabled {
  background: linear-gradient(135deg, #a0a0a0 0%, #888 100%);
  cursor: not-allowed;
}

.login-button {
  width: 100%;
  border-radius: 10px;
  font-weight: 500;
  height: 42px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #252545 0%, #1e2d4e 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.login-button:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
}

.login-tip {
  margin-top: 24px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  line-height: 1.6;
}
</style>