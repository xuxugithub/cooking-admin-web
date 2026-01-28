import request from '@/utils/request'

// 管理员登录
export const login = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 获取管理员信息
export const getAdminInfo = () => {
  return request({
    url: '/info',
    method: 'get'
  })
}

// 更新管理员信息
export const updateAdminInfo = (data) => {
  return request({
    url: '/info',
    method: 'put',
    data
  })
}

// 管理员登出
export const logout = () => {
  return request({
    url: '/logout',
    method: 'post'
  })
}