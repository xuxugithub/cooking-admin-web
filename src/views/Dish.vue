<template>
  <div class="page-container">
    <h2 style="margin-bottom: 20px;">菜品管理</h2>

    <!-- 搜索表单 -->
    <el-form class="search-form" :model="searchForm" inline>
      <el-form-item label="菜品名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入菜品名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="searchForm.categoryId" placeholder="请选择分类" clearable>
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleAdd">新增菜品</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="菜品名称" min-width="150" />
      <el-table-column prop="image" label="图片" width="100">
        <template #default="{ row }">
          <ImagePreview :src="row.image" :width="80" :height="60" />
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="difficulty" label="难度" width="80">
        <template #default="{ row }">
          <el-tag
            :type="row.difficulty === 1 ? 'success' : row.difficulty === 2 ? 'warning' : 'danger'"
          >
            {{ ['', '简单', '中等', '困难'][row.difficulty] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cookingTime" label="制作时间" width="100">
        <template #default="{ row }">
          {{ row.cookingTime }}分钟
        </template>
      </el-table-column>
      <el-table-column prop="viewCount" label="浏览量" width="100" />
      <el-table-column prop="collectCount" label="收藏量" width="100" />
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
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" size="small" @click="handleManageSteps(row)">
              制作步骤
            </el-button>
            <el-button type="warning" size="small" @click="handleManageIngredients(row)">
              食材配置
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
      width="800px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入菜品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类">
                <el-option
                  v-for="category in categoryList"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="菜品图片" prop="image">
          <ImageUpload v-model="form.image" :width="200" :height="150" />
        </el-form-item>
        
        <el-form-item label="菜品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入菜品描述"
          />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="难度" prop="difficulty">
              <el-select v-model="form.difficulty" placeholder="请选择难度">
                <el-option label="简单" :value="1" />
                <el-option label="中等" :value="2" />
                <el-option label="困难" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="制作时间" prop="cookingTime">
              <el-input-number
                v-model="form.cookingTime"
                :min="1"
                placeholder="分钟"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="份数" prop="servings">
              <el-input-number v-model="form.servings" :min="1" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="卡路里" prop="calories">
              <el-input-number v-model="form.calories" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">上架</el-radio>
                <el-radio :label="0">下架</el-radio>
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

    <!-- 制作步骤管理对话框 -->
    <el-dialog
      v-model="stepsDialogVisible"
      :title="`${currentDish?.name} - 制作步骤`"
      width="900px"
      @close="handleStepsDialogClose"
    >
      <DishStepsManager
        v-if="currentDish"
        :dish-id="currentDish.id"
        v-model="dishSteps"
        @save="handleSaveSteps"
      />
    </el-dialog>


    <!-- 食材管理对话框 -->
    <el-dialog
      v-model="ingredientsDialogVisible"
      :title="`${currentDish?.name} - 食材配置`"
      width="600px"
      @close="handleIngredientsDialogClose"
    >
      <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="addIngredient">添加食材</el-button>
        <el-button type="success" @click="saveIngredients" :loading="ingredientsLoading">保存食材</el-button>
      </div>
      
      <el-table :data="dishIngredients" border>
        <el-table-column label="食材名称" width="200">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="请输入食材名称" />
          </template>
        </el-table-column>
        <el-table-column label="用量" width="120">
          <template #default="{ row }">
            <el-input v-model="row.amount" placeholder="用量" />
          </template>
        </el-table-column>
        <el-table-column label="单位" width="100">
          <template #default="{ row }">
            <el-select v-model="row.unit" placeholder="选择单位" size="small">
              <el-option label="克" value="克" />
              <el-option label="个" value="个" />
              <el-option label="斤" value="斤" />
              <el-option label="两" value="两" />
              <el-option label="毫升" value="毫升" />
              <el-option label="升" value="升" />
              <el-option label="勺" value="勺" />
              <el-option label="茶匙" value="茶匙" />
              <el-option label="汤匙" value="汤匙" />
              <el-option label="杯" value="杯" />
              <el-option label="片" value="片" />
              <el-option label="根" value="根" />
              <el-option label="颗" value="颗" />
              <el-option label="块" value="块" />
              <el-option label="条" value="条" />
              <el-option label="适量" value="适量" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeIngredient($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-if="dishIngredients.length === 0" style="text-align: center; color: #999; padding: 40px;">
        暂无食材配置，点击"添加食材"开始添加
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImageUpload from '@/components/ImageUpload.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import DishStepsManager from '@/components/DishStepsManager.vue'
import {
  getDishPage,
  createDish,
  updateDish,
  deleteDish,
  updateDishStatus
} from '@/api/dish'
import { getCategoryList } from '@/api/category'
import { getDishSteps, batchSaveDishSteps } from '@/api/dishStep'
import { getDishIngredients, batchSaveDishIngredients } from '@/api/dishIngredient'

const loading = ref(false)
const submitLoading = ref(false)
const ingredientsLoading = ref(false)
const tableData = ref([])
const categoryList = ref([])
const dialogVisible = ref(false)
const stepsDialogVisible = ref(false)
const ingredientsDialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const currentDish = ref(null)
const dishSteps = ref([])
const dishIngredients = ref([])

const searchForm = reactive({
  name: '',
  categoryId: null,
  status: null
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  categoryId: null,
  image: '',
  description: '',
  difficulty: 1,
  cookingTime: null,
  servings: 1,
  calories: null,
  status: 1
})

const formRules = {
  name: [
    { required: true, message: '请输入菜品名称', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  difficulty: [
    { required: true, message: '请选择难度', trigger: 'change' }
  ],
  cookingTime: [
    { required: true, message: '请输入制作时间', trigger: 'blur' }
  ]
}

// 加载分类列表
const loadCategoryList = async () => {
  try {
    const response = await getCategoryList()
    if (response.code === 200) {
      categoryList.value = response.data
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      current: pagination.current,
      size: pagination.size,
      name: searchForm.name || undefined,
      categoryId: searchForm.categoryId || undefined,
      status: searchForm.status
    }
    
    const response = await getDishPage(params)
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
    const response = await updateDishStatus(row.id, row.status)
    if (response.code === 200) {
      ElMessage.success(row.status === 1 ? '上架成功' : '下架成功')
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
    name: '',
    categoryId: null,
    status: null
  })
  pagination.current = 1
  loadData()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增菜品'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑菜品'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除菜品"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await deleteDish(row.id)
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
    const api = isEdit ? updateDish : createDish
    
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
    name: '',
    categoryId: null,
    image: '',
    description: '',
    difficulty: 1,
    cookingTime: null,
    servings: 1,
    calories: null,
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

// 管理制作步骤
const handleManageSteps = async (row) => {
  currentDish.value = row
  stepsDialogVisible.value = true
  
  try {
    const response = await getDishSteps(row.id)
    if (response.code === 200) {
      dishSteps.value = response.data || []
    }
  } catch (error) {
    console.error('加载制作步骤失败:', error)
  }
}

// 处理步骤保存（由DishStepsManager组件触发）
const handleSaveSteps = async (steps) => {
  try {
    const response = await batchSaveDishSteps(steps)
    if (response.code === 200) {
      ElMessage.success('保存成功')
      stepsDialogVisible.value = false
    }
  } catch (error) {
    console.error('保存制作步骤失败:', error)
    ElMessage.error('保存失败')
  }
}

// 制作步骤对话框关闭
const handleStepsDialogClose = () => {
  dishSteps.value = []
  currentDish.value = null
}

// 管理食材
const handleManageIngredients = async (row) => {
  currentDish.value = row
  ingredientsDialogVisible.value = true
  
  try {
    const response = await getDishIngredients(row.id)
    if (response.code === 200) {
      dishIngredients.value = response.data || []
    }
  } catch (error) {
    console.error('加载食材失败:', error)
  }
}

// 添加食材
const addIngredient = () => {
  dishIngredients.value.push({
    dishId: currentDish.value.id,
    name: '',
    amount: '',
    unit: ''
  })
}

// 删除食材
const removeIngredient = (index) => {
  dishIngredients.value.splice(index, 1)
}

// 保存食材
const saveIngredients = async () => {
  if (dishIngredients.value.length === 0) {
    ElMessage.warning('请至少添加一个食材')
    return
  }
  
  // 验证食材名称
  for (let i = 0; i < dishIngredients.value.length; i++) {
    if (!dishIngredients.value[i].name.trim()) {
      ElMessage.warning(`请填写第 ${i + 1} 个食材的名称`)
      return
    }
  }
  
  try {
    ingredientsLoading.value = true
    const response = await batchSaveDishIngredients(dishIngredients.value)
    if (response.code === 200) {
      ElMessage.success('保存成功')
      ingredientsDialogVisible.value = false
    }
  } catch (error) {
    console.error('保存食材失败:', error)
  } finally {
    ingredientsLoading.value = false
  }
}

// 食材对话框关闭
const handleIngredientsDialogClose = () => {
  dishIngredients.value = []
  currentDish.value = null
}

onMounted(() => {
  loadCategoryList()
  loadData()
})
</script>

<style scoped>
/* 保留必要的样式 */
</style>