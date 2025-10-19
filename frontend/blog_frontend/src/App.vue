<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const store = useUserStore()
const user = computed(() => store.user)

function goHome() { router.push('/') }
function logout() { store.logout(); router.push('/') }
function goProfile() { router.push('/me') }
</script>

<template>
  <div id="app">
    <header class="header app-container" style="align-items:center">
      <div class="title" @click="goHome">我的博客</div>

      <div style="display:flex;align-items:center;gap:10px">
        <template v-if="user">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link" style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <el-avatar :src="user.avatar" size="32" /> <span>{{ user.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">我的主页</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/posts/new')">新建文章</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <el-button v-else size="small" @click="$router.push('/login')">登录</el-button>
      </div>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.header { background: transparent; padding-top:12px; padding-bottom:12px; }
.title { cursor:pointer; }
</style>
