<template>
  <div class="feedback-page">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="处理状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待处理" value="0" />
            <el-option label="处理中" value="1" />
            <el-option label="已回复" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈类型">
          <el-select v-model="queryParams.type" placeholder="全部" clearable style="width: 150px">
            <el-option label="功能异常" value="bug" />
            <el-option label="产品建议" value="suggestion" />
            <el-option label="内容问题" value="content" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadFeedbackList">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="feedbackList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="反馈内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contact" label="联系方式" width="150" show-overflow-tooltip />
        <el-table-column prop="images" label="图片" width="120">
          <template #default="{ row }">
            <div v-if="row.images" class="image-preview-list">
              <el-image
                v-for="(img, idx) in row.images.split(',')"
                :key="idx"
                :src="getImageUrl(img)"
                :preview-src-list="row.images.split(',').map(i => getImageUrl(i))"
                fit="cover"
                class="preview-img"
              />
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openReplyDialog(row)">
              回复
            </el-button>
            <el-button size="small" @click="openDetailDialog(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.current"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadFeedbackList"
        @current-change="loadFeedbackList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复反馈" width="500px">
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="反馈内容">
          <el-input type="textarea" :rows="3" :value="currentFeedback?.content" disabled />
        </el-form-item>
        <el-form-item label="回复内容">
          <el-input
            type="textarea"
            v-model="replyForm.reply"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply" :loading="replyLoading">提交回复</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="反馈详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="反馈ID">{{ currentFeedback?.id }}</el-descriptions-item>
        <el-descriptions-item label="反馈类型">
          <el-tag :type="getTypeTag(currentFeedback?.type)">{{ getTypeLabel(currentFeedback?.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusTag(currentFeedback?.status)">{{ getStatusLabel(currentFeedback?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系方式">{{ currentFeedback?.contact || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatTime(currentFeedback?.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentFeedback?.userId || '未登录用户' }}</el-descriptions-item>
        <el-descriptions-item label="反馈内容" :span="2">
          {{ currentFeedback?.content }}
        </el-descriptions-item>
        <el-descriptions-item label="反馈图片" :span="2">
          <div v-if="currentFeedback?.images" class="image-preview-list">
            <el-image
              v-for="(img, idx) in currentFeedback.images.split(',')"
              :key="idx"
              :src="getImageUrl(img)"
              :preview-src-list="currentFeedback.images.split(',').map(i => getImageUrl(i))"
              fit="cover"
              class="preview-img-large"
            />
          </div>
          <span v-else>无图片</span>
        </el-descriptions-item>
        <el-descriptions-item label="官方回复" :span="2">
          {{ currentFeedback?.reply || '暂无回复' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const replyLoading = ref(false)
const feedbackList = ref([])
const total = ref(0)
const queryParams = reactive({
  current: 1,
  size: 10,
  status: null,
  type: null
})

const replyDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentFeedback = ref(null)
const replyForm = reactive({
  reply: ''
})

const FILE_BASE_URL = 'https://cook.xuaq.top'

// 获取类型标签
const getTypeLabel = (type) => {
  const map = { bug: '功能异常', suggestion: '产品建议', content: '内容问题', other: '其他' }
  return map[type] || '其他'
}

const getTypeTag = (type) => {
  const map = { bug: 'danger', suggestion: 'success', content: 'warning', other: 'info' }
  return map[type] || 'info'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const map = { 0: '待处理', 1: '处理中', 2: '已回复' }
  return map[status] || '待处理'
}

const getStatusTag = (status) => {
  const map = { 0: 'warning', 1: 'info', 2: 'success' }
  return map[status] || 'warning'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${FILE_BASE_URL}/api/admin/file/preview/${path}`
}

// 加载反馈列表
const loadFeedbackList = async () => {
  loading.value = true
  try {
    const res = await request.get('/feedback/page', {
      params: {
        current: queryParams.current,
        size: queryParams.size,
        status: queryParams.status,
        type: queryParams.type
      }
    })
    if (res.data) {
      feedbackList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 打开回复对话框
const openReplyDialog = (row) => {
  currentFeedback.value = row
  replyForm.reply = row.reply || ''
  replyDialogVisible.value = true
}

// 打开详情对话框
const openDetailDialog = (row) => {
  currentFeedback.value = row
  detailDialogVisible.value = true
}

// 提交回复
const submitReply = async () => {
  if (!replyForm.reply.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  replyLoading.value = true
  try {
    await request.post('/feedback/reply', null, {
      params: {
        id: currentFeedback.value.id,
        reply: replyForm.reply.trim()
      }
    })
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    loadFeedbackList()
  } catch (error) {
    ElMessage.error('回复失败')
  } finally {
    replyLoading.value = false
  }
}

onMounted(() => {
  loadFeedbackList()
})
</script>

<style scoped>
.feedback-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.image-preview-list {
  display: flex;
  gap: 8px;
}

.preview-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.preview-img-large {
  width: 100px;
  height: 100px;
  border-radius: 8px;
}
</style>