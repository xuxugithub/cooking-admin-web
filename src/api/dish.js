import request from '@/utils/request'

// 分页查询菜品
export const getDishPage = (params) => {
  return request({
    url: '/dish/page',
    method: 'get',
    params
  })
}

// 根据ID查询菜品
export const getDishById = (id) => {
  return request({
    url: `/dish/${id}`,
    method: 'get'
  })
}

// 新增菜品
export const createDish = (data) => {
  return request({
    url: '/dish',
    method: 'post',
    data
  })
}

// 更新菜品
export const updateDish = (data) => {
  return request({
    url: '/dish',
    method: 'put',
    data
  })
}

// 删除菜品
export const deleteDish = (id) => {
  return request({
    url: `/dish/${id}`,
    method: 'delete'
  })
}

// 上架/下架菜品
export const updateDishStatus = (id, status) => {
  return request({
    url: `/dish/status/${id}`,
    method: 'put',
    params: { status }
  })
}