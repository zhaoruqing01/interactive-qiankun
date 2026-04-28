<template>
  <!-- 微应用容器 -->
  <div id="micro-app-container" class="micro-app-container"></div>
</template>
<style scoped>
.micro-app-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 确保 qiankun 挂载的子应用容器及其子节点充满高度 */
:deep(.micro-app-container > div) {
  height: 100% !important;
  min-height: 0;
  width: 100% !important;
}

:deep(.micro-app-container > div > div) {
  height: 100% !important;
  min-height: 0;
  width: 100% !important;
}

/* React 子应用的 root 容器 */
:deep(#root) {
  height: 100% !important;
  width: 100% !important;
}
</style>
