import { defineStore } from 'pinia'
import api from '@/api/request'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  actions: {
    async login(credentials) {
      try {
        const res = await api.post('/login/', credentials, { skipAuth: true })
        const data = res || {}
        const token = data.access || data.token || data.access_token
        if (token) {
          this.token = token
          localStorage.setItem('token', token)
        }
        if (data.user) this.user = data.user
        else {
          try {
            const r = await api.get('/me/')
            this.user = r
          } catch (e) { 
            console.warn('获取用户信息失败，使用用户名作为默认信息:', e)
            this.user = { username: credentials.username } 
          }
        }
        return this.user
      } catch (error) {
        // 清理可能存储的无效token
        this.token = null
        localStorage.removeItem('token')
        throw error
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },
    async fetchCurrentUser() {
      if (!this.token) return null
      try {
        const r = await api.get('/me/')
        this.user = r
        return this.user
      } catch (e) {
        this.user = null
        return null
      }
    }
  }
})
export default useUserStore