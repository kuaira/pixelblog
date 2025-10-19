<template>
  <div class="app-container" style="max-width:900px">
    <el-card class="post-card">
      <div v-if="loading" class="empty-state">加载中...</div>
      <div v-else-if="error" class="empty-state">加载失败：{{ error }}</div>
      <div v-else>
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <h2 style="margin-bottom:6px">{{ post.title }}</h2>
            <div class="post-meta">
              作者: {{ post.author || '匿名' }} · {{ (post.created_at || '').slice(0,10) }}
            </div>
          </div>
          <div>
            <el-button size="small" @click="$router.back()">返回</el-button>
          </div>
        </div>

        <!-- ① Markdown 渲染 -->
        <div
          class="markdown-body"
          style="margin-top:14px"
          v-html="renderedContent"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/api/request'
import md from '@/utils/md'

const route = useRoute()
const post = ref({})
const loading = ref(true)
const error = ref('')

/* ② 渲染并转换裸 URL 为带标题的链接 */
const renderedContent = computed(() => {
  let html = md.render(post.value.content || '')
  // 简易版：把 <a> 外链换成可显示标题的组件（见下方扩展）
  return html
})

async function fetchByPath(path) {
  const res = await request.get(path)
  return (res && res.data) ? res.data : res
}

onMounted(async () => {
  const id = route.params.id
  loading.value = true
  error.value = ''
  try {
    let data = null
    try { data = await fetchByPath(`/posts/${id}/`) } catch {
      data = await fetchByPath(`/posts/${id}`)
    }
    Object.assign(post.value, data || {})
  } catch (e) {
    error.value = e?.response?.data?.detail || e?.message || '请求失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ③ GitHub 风格的 markdown 样式 */
@import "https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-light.css";

.markdown-body {
  padding: 0 6px;
}
</style>