<template>
  <div class="page-container">
    <h2 style="margin-bottom: 20px;">Banner管理</h2>

    <!-- 搜索表单 -->
    <el-form class="search-form" :model="searchForm" inline>
      <el-form-item label="标题">
        <el-input
          v-model="searchForm.title"
          placeholder="请输入标题"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleAdd">新增Banner</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="150" />
      <el-table-column prop="image" label="图片" width="120">
        <template #default="{ row }">
          <ImagePreview :src="row.image" :width="100" :height="60" />
        </template>
      </el-table-column>
      <el-table-column prop="linkType" label="链接类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getLinkTypeTagType(row.linkType)">
            {{ getLinkTypeText(row.linkType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="linkValue" label="链接值" min-width="200" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; justify-content: center;"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="图片" prop="image">
          <ImageUpload v-model="form.image" :width="300" :height="180" />
        </el-form-item>
        
        <el-form-item label="链接类型" prop="linkType">
          <el-radio-group v-model="form.linkType">
            <el-radio :label="0">无链接</el-radio>
            <el-radio :label="1">菜品详情</el-radio>
            <el-radio :label="2">外部链接</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item
          v-if="form.linkType !== 0"
          label="链接值"
          prop="linkValue"
        >
          <el-input
            v-model="form.linkValue"
            :placeholder="form.linkType === 1 ? '请输入菜品ID' : '请输入外部链接URL'"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImageUpload from '@/components/ImageUpload.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import {
  getBannerPage,
  createBanner,
  updateBanner,
  deleteBanner,
  updateBannerStatus
} from '@/api/banner'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()

const searchForm = reactive({
  title: '',
  status: null
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  title: '',
  image: '',
  linkType: 0,
  linkValue: '',
  sort: 0,
  status: 1
})

const formRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请输入图片URL', trigger: 'blur' }
  ],
  linkValue: [
    {
      validator: (rule, value, callback) => {
        if (form.linkType !== 0 && !value) {
          callback(new Error('请输入链接值'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取链接类型文本
const getLinkTypeText = (type) => {
  const typeMap = {
    0: '无链接',
    1: '菜品详情',
    2: '外部链接'
  }
  return typeMap[type] || '未知'
}

// 获取链接类型标签类型
const getLinkTypeTagType = (type) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return typeMap[type] || 'info'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      title: searchForm.title || undefined,
      status: searchForm.status
    }
    
    const response = await getBannerPage(params)
    if (response.code === 200) {
      tableData.value = response.data.records
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    const response = await updateBannerStatus(row.id, row.status)
    if (response.code === 200) {
      ElMessage.success(row.status === 1 ? '启用成功' : '禁用成功')
    }
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    console.error('状态更新失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  loadData()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    title: '',
    status: null
  })
  pagination.current = 1
  loadData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增Banner'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑Banner'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除Banner"${row.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteBanner(row.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    const isEdit = !!form.id
    const api = isEdit ? updateBanner : createBanner
    
    // 如果链接类型为无链接，清空链接值
    if (form.linkType === 0) {
      form.linkValue = ''
    }
    
    const response = await api(form)
    if (response.code === 200) {
      ElMessage.success(isEdit ? '更新成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    id: null,
    title: '',
    image: '',
    linkType: 0,
    linkValue: '',
    sort: 0,
    status: 1
  })
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 分页
const handleSizeChange = () => {
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>