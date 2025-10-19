<template>
  <div class="app-container" style="max-width:800px">
    <el-card class="post-card">
      <h2>{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
      <el-form :model="form" label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="正文">
          <el-input type="textarea" v-model="form.content" :rows="8" placeholder="输入正文内容..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/api/request'

const route = useRoute()
const router = useRouter()
const store = useUserStore()
const id = route.params.id
const isEdit = !!id

if (!store.token) {
  // 未登录直接跳转到登录页
  router.push('/login')
}

const form = reactive({ title: '', content: '' })

onMounted(async () => {
  if (isEdit) {
    try {
      const res = await request.get(`/posts/${id}/`)
      // 后端返回文章对象
      Object.assign(form, res)
      // 如果当前用户不是作者，禁止编辑并返回用户主页
      if (store.user && res.author !== store.user.username) {
        alert('您无权编辑此文章')
        router.push('/me')
      }
    } catch (error) {
      console.error('获取文章失败:', error)
      alert('获取文章失败，请稍后重试')
      router.push('/me')
    }
  }
})

async function submit() {
  try {
    if (isEdit) {
      await request.put(`/posts/${id}/`, form)
    } else {
      await request.post('/posts/', form)
    }
    router.push('/me')
  } catch (e) {
    console.error(e)
    alert('提交失败，请确认已登录且表单完整')
  }
}
</script>