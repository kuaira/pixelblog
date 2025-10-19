import { createRouter, createWebHistory } from 'vue-router'
import PostList from '@/views/PostList.vue'
import PostForm from '@/views/PostForm.vue'
import PostDetail from '@/views/PostDetail.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import User from '@/views/User.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  { path: '/', component: PostList },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/posts/new', component: PostForm, meta: { requiresAuth: true } },
  { path: '/posts/:id', component: PostDetail },
  { path: '/posts/:id/edit', component: PostForm, meta: { requiresAuth: true } },
  { path: '/me', component: User, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加路由守卫
router.beforeEach(async (to, from, next) => {
  // 获取用户状态存储
  const store = useUserStore()
  
  // 如果目标路由需要认证
  if (to.meta.requiresAuth) {
    // 如果没有token或者用户信息，重定向到登录页
    if (!store.token || !store.user) {
      // 尝试从localStorage获取token并获取用户信息
      const token = localStorage.getItem('token')
      if (token) {
        store.token = token
        try {
          await store.fetchCurrentUser()
        } catch (e) {
          console.error('获取用户信息失败', e)
        }
      }
      
      // 如果仍然没有用户信息，重定向到登录页
      if (!store.user) {
        next('/login')
        return
      }
    }
  }
  
  // 允许访问
  next()
})

export default router