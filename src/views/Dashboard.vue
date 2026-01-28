<template>
  <div class="page-container">
    <h2 style="margin-bottom: 20px;">仪表盘</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff;">
              <el-icon size="24"><Menu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.categoryCount }}</div>
              <div class="stat-label">分类总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon size="24"><Food /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.dishCount }}</div>
              <div class="stat-label">菜品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c;">
              <el-icon size="24"><Picture /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.bannerCount }}</div>
              <div class="stat-label">Banner总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon size="24"><View /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalViews }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 20px;">
      <!-- 快捷操作 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
              <el-icon><Operation /></el-icon>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/category')" class="action-btn">
              <el-icon><Plus /></el-icon>
              新增分类
            </el-button>
            <el-button type="success" @click="$router.push('/dish')" class="action-btn">
              <el-icon><Plus /></el-icon>
              新增菜品
            </el-button>
            <el-button type="warning" @click="$router.push('/banner')" class="action-btn">
              <el-icon><Plus /></el-icon>
              新增Banner
            </el-button>
            <el-button type="info" @click="refreshStats" class="action-btn">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 系统信息 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
              <el-icon><Monitor /></el-icon>
            </div>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">系统版本：</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后更新：</span>
              <span class="info-value">{{ lastUpdateTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">在线状态：</span>
              <el-tag type="success" size="small">正常运行</el-tag>
            </div>
            <div class="info-item">
              <span class="info-label">数据库：</span>
              <el-tag type="success" size="small">连接正常</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 最近添加的菜品 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近添加的菜品</span>
              <el-icon><Food /></el-icon>
            </div>
          </template>
          <div v-if="recentDishes.length > 0">
            <div v-for="dish in recentDishes" :key="dish.id" class="recent-item">
              <div class="item-image">
                <ImagePreview :src="dish.image" :width="40" :height="40" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ dish.name }}</div>
                <div class="item-meta">
                  <el-tag size="small" type="info">{{ dish.categoryName }}</el-tag>
                  <span class="item-time">{{ formatTime(dish.createTime) }}</span>
                </div>
              </div>
              <div class="item-actions">
                <el-button type="text" size="small" @click="$router.push('/dish')">
                  查看
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无菜品数据" :image-size="80" />
        </el-card>
      </el-col>

      <!-- 分类统计 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>分类统计</span>
              <el-icon><PieChart /></el-icon>
            </div>
          </template>
          <div v-if="categoryStats.length > 0">
            <div v-for="category in categoryStats" :key="category.id" class="category-stat">
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.dishCount || 0 }} 个菜品</span>
              </div>
              <div class="category-progress">
                <el-progress 
                  :percentage="getCategoryPercentage(category.dishCount || 0)" 
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无分类数据" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ImagePreview from '@/components/ImagePreview.vue'
import { getCategoryList } from '@/api/category'
import { getBannerList } from '@/api/banner'
import { getDishPage } from '@/api/dish'

const stats = ref({
  categoryCount: 0,
  dishCount: 0,
  bannerCount: 0,
  totalViews: 0
})

const recentDishes = ref([])
const categoryStats = ref([])
const lastUpdateTime = ref('')

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${Math.floor(diff / 86400000)}天前`
  }
}

// 获取分类百分比
const getCategoryPercentage = (dishCount) => {
  if (stats.value.dishCount === 0) return 0
  return Math.round((dishCount / stats.value.dishCount) * 100)
}

// 加载统计数据
const loadStats = async () => {
  try {
    // 获取分类统计
    const categoryRes = await getCategoryList()
    if (categoryRes.code === 200) {
      stats.value.categoryCount = categoryRes.data.length
      categoryStats.value = categoryRes.data.map(category => ({
        ...category,
        dishCount: 0 // 初始化菜品数量
      }))
    }

    // 获取Banner统计
    const bannerRes = await getBannerList()
    if (bannerRes.code === 200) {
      stats.value.bannerCount = bannerRes.data.length
    }

    // 获取菜品统计
    const dishRes = await getDishPage({ current: 1, size: 1000 })
    if (dishRes.code === 200) {
      stats.value.dishCount = dishRes.data.total
      
      // 获取最近添加的菜品（前5个）
      recentDishes.value = dishRes.data.records
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .slice(0, 5)
      
      // 计算每个分类的菜品数量
      const categoryDishCount = {}
      dishRes.data.records.forEach(dish => {
        if (dish.categoryId) {
          categoryDishCount[dish.categoryId] = (categoryDishCount[dish.categoryId] || 0) + 1
        }
      })
      
      // 更新分类统计
      categoryStats.value = categoryStats.value.map(category => ({
        ...category,
        dishCount: categoryDishCount[category.id] || 0
      }))
      
      // 计算总浏览量
      stats.value.totalViews = dishRes.data.records.reduce((total, dish) => {
        return total + (dish.viewCount || 0)
      }, 0)
    }

    // 更新最后更新时间
    lastUpdateTime.value = new Date().toLocaleString()
    
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 刷新统计数据
const refreshStats = async () => {
  ElMessage.info('正在刷新数据...')
  await loadStats()
  ElMessage.success('数据刷新成功')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 16px;
    }
    
    .stat-info {
      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        line-height: 1;
      }
      
      .stat-label {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  .action-btn {
    flex: 1;
    min-width: 120px;
  }
}

.system-info {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #666;
      font-size: 14px;
    }
    
    .info-value {
      color: #333;
      font-weight: 500;
    }
  }
}

.recent-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .item-image {
    margin-right: 12px;
  }
  
  .item-info {
    flex: 1;
    
    .item-name {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }
    
    .item-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .item-time {
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .item-actions {
    margin-left: 12px;
  }
}

.category-stat {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .category-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .category-name {
      font-weight: 500;
      color: #333;
    }
    
    .category-count {
      font-size: 12px;
      color: #666;
    }
  }
  
  .category-progress {
    width: 100%;
  }
}
</style>