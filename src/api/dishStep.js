import request from '@/utils/request'

// 根据菜品ID查询制作步骤
export const getDishSteps = (dishId) => {
  return request({
    url: `/dish-step/list/${dishId}`,
    method: 'get'
  })
}

// 批量保存菜品制作步骤
export const batchSaveDishSteps = (steps) => {
  return request({
    url: '/dish-step/batch-save',
    method: 'post',
    data: steps
  })
}

// 删除制作步骤
export const deleteDishStep = (id) => {
  return request({
    url: `/dish-step/${id}`,
    method: 'delete'
  })
}