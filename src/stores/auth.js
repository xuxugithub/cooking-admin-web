import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, sendCode as apiSendCode, getAdminInfo } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const adminInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  // 发送验证码
  const sendCode = async (email) => {
    try {
      const response = await apiSendCode(email)
      if (response.code === 200) {
        return { success: true, message: response.data }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      return { success: false, message: error.message || '发送验证码失败' }
    }
  }

  // 登录（邮箱 + 密码 + 验证码）
  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials)
      if (response.code === 200) {
        token.value = response.data.token
        adminInfo.value = {
          adminId: response.data.adminId,
          username: response.data.username,
          name: response.data.name
        }
        localStorage.setItem('admin_token', token.value)
        return { success: true }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      return { success: false, message: error.message || '登录失败' }
    }
  }

  // 获取管理员信息
  const fetchAdminInfo = async () => {
    try {
      const response = await getAdminInfo()
      if (response.code === 200) {
        adminInfo.value = response.data
      }
    } catch (error) {
      console.error('获取管理员信息失败:', error)
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    adminInfo.value = null
    localStorage.removeItem('admin_token')
  }

  return {
    token,
    adminInfo,
    isLoggedIn,
    sendCode,
    login,
    fetchAdminInfo,
    logout
  }
})