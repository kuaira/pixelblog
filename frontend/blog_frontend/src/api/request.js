import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

function isTokenValid(token) {
  if (!token) return false
  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    // base64url -> base64
    const b = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(atob(b).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))
    const obj = JSON.parse(json)
    return !!obj.exp && obj.exp > Math.floor(Date.now() / 1000)
  } catch (e) {
    return false
  }
}

api.interceptors.request.use(config => {
  const skip = config.skipAuth === true || (config.url && /\/login\/?$/.test(config.url))
  const token = localStorage.getItem('token')
  if (!skip && token && isTokenValid(token)) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // 如果 token 存在但无效，清理一下，避免后端因为无效 token 返回 401
    if (token && !isTokenValid(token)) {
      localStorage.removeItem('token')
    }
    if (config.headers && config.headers.Authorization) delete config.headers.Authorization
  }
  return config
}, err => Promise.reject(err))

// 响应拦截：当请求带了 Authorization 且返回 401，清 token 并重试一次（不带 auth）
api.interceptors.response.use(res => res.data !== undefined ? res.data : res, async err => {
  const errResp = err.response
  const config = err.config || {}
  if (errResp && errResp.status === 401 && config.headers && config.headers.Authorization && !config.__retryWithoutAuth) {
    try {
      localStorage.removeItem('token')
      // 标记防止循环重试
      config.__retryWithoutAuth = true
      delete config.headers.Authorization
      return api.request(config)
    } catch (e) {
      return Promise.reject(err)
    }
  }
  
  // 处理网络错误或其他异常
  if (!errResp) {
    console.error('网络错误或服务器无响应:', err)
    return Promise.reject(new Error('网络连接失败，请检查网络设置'))
  }
  
  return Promise.reject(err)
})

export default api