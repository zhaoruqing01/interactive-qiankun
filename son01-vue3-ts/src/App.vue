<template>
  <router-view />
  <!-- AI悬浮球 -->
  <FloatingBall />
</template>

<script setup lang="ts">
import FloatingBall from "@/components/FloatingBall.vue";
// 移除原有的登录页面逻辑，统一交由 vue-router 管理
</script>

<style>
/* 全局样式重置 */
body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* 隐藏部分浏览器的滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
</style>
