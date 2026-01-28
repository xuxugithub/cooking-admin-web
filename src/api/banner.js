import request from '@/utils/request'

// 分页查询Banner
export const getBannerPage = (params) => {
  return request({
    url: '/banner/page',
    method: 'get',
    params
  })
}

// 获取所有Banner
export const getBannerList = () => {
  return request({
    url: '/banner/list',
    method: 'get'
  })
}

// 根据ID查询Banner
export const getBannerById = (id) => {
  return request({
    url: `/banner/${id}`,
    method: 'get'
  })
}

// 新增Banner
export const createBanner = (data) => {
  return request({
    url: '/banner',
    method: 'post',
    data
  })
}

// 更新Banner
export const updateBanner = (data) => {
  return request({
    url: '/banner',
    method: 'put',
    data
  })
}

// 删除Banner
export const deleteBanner = (id) => {
  return request({
    url: `/banner/${id}`,
    method: 'delete'
  })
}

// 启用/禁用Banner
export const updateBannerStatus = (id, status) => {
  return request({
    url: `/banner/status/${id}`,
    method: 'put',
    params: { status }
  })
}