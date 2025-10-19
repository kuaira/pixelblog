<template>
  <div class="app-container" style="max-width:420px;margin:80px auto;">
    <el-card class="post-card">
      <h2 style="margin-bottom:8px;">注册</h2>
      <p class="post-meta">创建一个新的账号</p>

      <el-form :model="form" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="form.passwordConfirm" type="password" placeholder="请再次输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" style="width:100%;">注册</el-button>
        </el-form-item>
      </el-form>
      
      <div style="text-align:center;margin-top:16px">
        <el-link @click="$router.push('/login')" type="primary">已有账号？立即登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/api/request'

const router = useRouter()
const store = useUserStore()
const form = reactive({ 
  username: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

async function onSubmit(){
  // 验证表单
  if (!form.username || !form.password) {
    alert('用户名和密码是必填项')
    return
  }
  
  if (form.password !== form.passwordConfirm) {
    alert('两次输入的密码不一致')
    return
  }
  
  try {
    // 调用注册API
    const res = await api.post('/register/', form, { skipAuth: true })
    const data = res || {}
    const token = data.access || data.token || data.access_token
    
    if (token) {
      // 保存token到store和localStorage
      store.token = token
      localStorage.setItem('token', token)
      
      // 保存用户信息
      if (data.user) store.user = data.user
      else {
        try {
          const r = await api.get('/me/')
          store.user = r
        } catch (e) { 
          store.user = { username: form.username } 
        }
      }
      
      // 注册成功后跳转到用户主页
      router.push('/me')
    } else {
      throw new Error('注册响应中未包含访问令牌')
    }
  } catch (e) {
    console.error('注册失败:', e)
    // 根据错误类型显示不同的提示信息
    let message = '注册失败，请稍后重试'
    if (e.response) {
      if (e.response.status === 400) {
        if (e.response.data.detail) {
          message = `注册失败：${e.response.data.detail}`
        } else {
          message = '注册失败，请求参数有误'
        }
      } else if (e.response.status === 500) {
        message = '注册失败，服务器内部错误'
      }
    } else if (e.message && e.message.includes('网络')) {
      message = '注册失败，网络连接问题'
    }
    alert(message)
  }
}
</script>