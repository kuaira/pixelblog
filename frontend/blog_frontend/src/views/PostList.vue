<template>
  <div style="max-width: 800px; margin: 20px auto">
    <el-input
      v-model="search"
      placeholder="搜索标题或正文"
      clearable
      @clear="onClear"
      style="margin-bottom:12px"
    />
    <div v-if="loading" class="empty-state">加载中...</div>
    <div v-else>
      <div v-for="p in posts" :key="p.id" class="post-card" @click="$router.push(`/posts/${p.id}`)">
        <h3>{{ p.title }}</h3>
        <p>{{ (p.content || '').slice(0, 120) }}...</p>
        <div class="meta">作者: {{ p.author }} · {{ p.created_at?.slice(0,10) }}</div>
      </div>

      <el-pagination
        v-model:current-page="page"
        :total="total"
        :page-size="10"
        @change="onPageChange"
        style="margin-top: 20px; display:flex; justify-content: center"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const posts = ref([])
const page = ref(1)
const total = ref(0)
const search = ref('')
const loading = ref(false)

const router = useRouter()

let debounceTimer = null
let abortCtrl = null

function buildQuery(p, s) {
  const params = new URLSearchParams()
  if (p) params.set('page', p)
  if (s) params.set('search', s)
  return params.toString()
}

async function load(p = 1, s = '') {
  // 取消上一次请求
  if (abortCtrl) abortCtrl.abort()
  abortCtrl = new AbortController()
  loading.value = true
  try {
    const q = buildQuery(p, s)
    const res = await fetch(`/api/posts/?${q}`, { signal: abortCtrl.signal })
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const data = await res.json()
    posts.value = data.results || []
    total.value = data.count || 0
  } catch (e) {
    // 中断请求不视为错误
    if (e.name !== 'AbortError') {
      console.error('load posts failed', e)
      posts.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

function triggerLoadDebounced(p = 1) {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => load(p, search.value.trim()), 300)
}

function onClear() {
  search.value = ''
  page.value = 1
  triggerLoadDebounced(1)
}

function onPageChange(p) {
  page.value = p
  load(p, search.value.trim())
}

watch(search, () => {
  page.value = 1
  triggerLoadDebounced(1)
})

onMounted(() => {
  // 初次加载
  load(page.value, search.value.trim())
})
</script>

<style scoped>
.post-card {
  border: 1px solid #eee;
  padding: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}
.meta { color: #888; font-size: 12px; margin-top:8px; }
.empty-state { color: #999; padding: 18px; text-align: center; }
</style>