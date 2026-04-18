<template>
  <el-container class="layout-container">
    <!-- 头部 -->
    <el-header class="layout-header" height="60px">
      <div class="logo">做菜小程序管理后台</div>
      <div class="user-info">
        <!-- 反馈提醒 -->
        <el-badge :value="pendingCount" :hidden="pendingCount === 0" class="feedback-badge" @click="goFeedback">
          <el-button type="text" class="feedback-btn">
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>
        <span>欢迎，{{ adminInfo?.name || adminInfo?.username }}</span>
        <el-dropdown @command="handleCommand">
          <el-button type="text">
            <el-icon><User /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside class="layout-aside" width="200px">
        <el-menu
          :default-active="$route.path"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409eff"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/category">
            <el-icon><Menu /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/dish">
            <el-icon><Food /></el-icon>
            <span>菜品管理</span>
          </el-menu-item>
          <el-menu-item index="/banner">
            <el-icon><Picture /></el-icon>
            <span>Banner管理</span>
          </el-menu-item>
          <el-menu-item index="/feedback">
            <el-icon><ChatDotRound /></el-icon>
            <span>用户反馈</span>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="/test-steps">
            <el-icon><Operation /></el-icon>
            <span>步骤管理器测试</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const authStore = useAuthStore()

const adminInfo = computed(() => authStore.adminInfo)
const pendingCount = ref(0)
let refreshTimer = null

// 获取未处理反馈数量
const fetchPendingCount = async () => {
  try {
    const res = await request.get('/feedback/pending-count')
    if (res.data) {
      pendingCount.value = res.data
    }
  } catch (error) {
    console.error('获取未处理反馈数量失败', error)
  }
}

// 跳转到反馈页面
const goFeedback = () => {
  router.push('/feedback')
}

onMounted(() => {
  // 获取管理员信息
  if (authStore.isLoggedIn && !authStore.adminInfo) {
    authStore.fetchAdminInfo()
  }
  // 获取未处理反馈数量
  fetchPendingCount()
  // 定时刷新（每5分钟）
  refreshTimer = setInterval(fetchPendingCount, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      authStore.logout()
      router.push('/login')
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.feedback-badge {
  margin-right: 20px;
  cursor: pointer;
}

.feedback-btn {
  color: #333;
  font-size: 18px;
}

.feedback-btn:hover {
  color: #409eff;
}
</style>