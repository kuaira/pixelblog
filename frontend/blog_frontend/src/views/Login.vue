<template>
  <div class="app-container" style="max-width:420px;margin:80px auto;">
    <el-card class="post-card">
      <h2 style="margin-bottom:8px;">登录</h2>
      <p class="post-meta">使用你的账号登录管理博客</p>

      <el-form :model="form" label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit" style="width:100%;">登录</el-button>
        </el-form-item>
      </el-form>
      
      <div style="text-align:center;margin-top:16px">
        <el-link @click="$router.push('/register')" type="primary">没有账号？立即注册</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useUserStore()
const form = reactive({ username:'', password:'' })

async function onSubmit(){
  try{
    await store.login(form)
    // 登录成功后跳转到用户主页（/me）
    router.push('/me')
  }catch(e){
    console.error('登录失败:', e)
    // 根据错误类型显示不同的提示信息
    if (e.response && e.response.status === 401) {
      alert('登录失败，用户名或密码错误')
    } else if (e.message && e.message.includes('网络')) {
      alert('登录失败，网络连接问题')
    } else {
      alert('登录失败，请检查用户名/密码或后端接口')
    }
  }
}
</script>