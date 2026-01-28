import request from '@/utils/request'

// 根据菜品ID查询食材
export const getDishIngredients = (dishId) => {
  return request({
    url: `/dish-ingredient/list/${dishId}`,
    method: 'get'
  })
}

// 批量保存菜品食材
export const batchSaveDishIngredients = (ingredients) => {
  return request({
    url: '/dish-ingredient/batch-save',
    method: 'post',
    data: ingredients
  })
}

// 删除食材
export const deleteDishIngredient = (id) => {
  return request({
    url: `/dish-ingredient/${id}`,
    method: 'delete'
  })
}