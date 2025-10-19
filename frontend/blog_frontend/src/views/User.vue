<template>
  <div class="app-container" style="max-width:900px">
    <el-card class="post-card" style="display:flex;gap:16px;align-items:center">
      <el-avatar :src="user?.avatar" size="64" />
      <div>
        <h2 style="margin:0">{{ user?.username || '用户' }}</h2>
        <div class="post-meta">{{ user?.email || '' }}</div>
      </div>
    </el-card>

    <div style="margin-top:18px">
      <h3>我的文章</h3>
      <el-row :gutter="20">
        <el-col :span="8" v-for="p in posts" :key="p.id" style="margin-bottom:18px">
          <el-card class="post-card">
            <div @click="$router.push(`/posts/${p.id}`)" style="cursor:pointer">
              <h4 style="margin:0 0 8px">{{ p.title }}</h4>
              <div class="post-meta">{{ p.created_at?.slice(0,10) }}</div>
              <div style="margin-top:10px;color:var(--muted);max-height:60px;overflow:hidden">{{ p.content }}</div>
            </div>
            <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
              <el-button size="small" @click="$router.push(`/posts/${p.id}/edit`)">编辑</el-button>
              <el-button size="small" type="danger" @click="remove(p.id)">删除</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div v-if="!posts.length" class="empty-state">
        <el-empty description="暂无文章"></el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import request from '@/api/request'

const store = useUserStore()
const user = store.user || {}
const posts = ref([])

async function load() {
  try {
    // 优先让后端按 author 查询，后端支持 ?author=username
    const r = await request.get('/posts/', { params: { author: user?.username } })
    posts.value = r.results || r || []
  } catch (e) {
    console.warn('后端按作者查询失败，尝试前端过滤:', e)
    try {
      const r2 = await request.get('/posts/')
      posts.value = (r2.results || r2 || []).filter(p => p.author === user?.username)
    } catch (e2) {
      console.error('获取文章列表失败:', e2)
      // 显示错误提示
      alert('获取文章列表失败，请稍后重试')
    }
  }
}

async function remove(id) {
  if (!confirm('确定删除这篇文章吗？')) return
  try {
    await request.delete(`/posts/${id}/`)
    await load()
  } catch (e) {
    console.error(e)
    alert('删除失败，确认你为作者且已登录')
  }
}

onMounted(load)
</script>