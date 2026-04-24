<template>
  <router-view />
</template>

<script setup lang="ts"></script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

* {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  margin: 0;
}

/* 强制子应用容器及 qiankun 自动生成的包装层充满高度 */
#micro-app-container,
#micro-app-container > div[data-qiankun],
#micro-app-container > div[data-qiankun] > div#app {
  height: 100% !important;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
