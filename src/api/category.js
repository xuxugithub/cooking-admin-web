import request from '@/utils/request'

// 分页查询分类
export const getCategoryPage = (params) => {
  return request({
    url: '/category/page',
    method: 'get',
    params
  })
}

// 获取所有分类
export const getCategoryList = () => {
  return request({
    url: '/category/list',
    method: 'get'
  })
}

// 根据ID查询分类
export const getCategoryById = (id) => {
  return request({
    url: `/category/${id}`,
    method: 'get'
  })
}

// 新增分类
export const createCategory = (data) => {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

// 更新分类
export const updateCategory = (data) => {
  return request({
    url: '/category',
    method: 'put',
    data
  })
}

// 删除分类
export const deleteCategory = (id) => {
  return request({
    url: `/category/${id}`,
    method: 'delete'
  })
}