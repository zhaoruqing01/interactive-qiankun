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
/* 全局样式重置 - 仅在子应用独立运行时生效 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

/* 当被子应用加载时，不设置 html/body 的全局样式，避免影响主应用 */
body:not(.qiankun-micro-app) {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  /* 确保在 qiankun 下也能撑开高度 */
  display: flex;
  flex-direction: column;
}

/* 针对 experimentalStyleIsolation: true 的特别修复 */
/* qiankun 会将子应用的所有选择器增加 [data-qiankun="son01-vue3-ts"] 前缀 */
/* 如果子应用有 * { padding: 0 } 这种选择器，会导致所有元素 padding 丢失 */
/* 我们在这里显式为 layout-container 设置 flex: 1 以撑开高度 */
.layout-container {
  flex: 1;
  display: flex;
  height: 100%;
  min-height: 0;
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
