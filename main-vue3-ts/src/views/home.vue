<template>
  <div class="welcome-page">
    <h1>欢迎来到主应用</h1>
    <p>这是一个基于 Vue3 + TypeScript + Qiankun 的微前端示例项目。</p>
    <div class="app-cards">
      <div class="card" @click="$router.push('/son01-vue3-ts')">
        <h3>Vue3 子应用</h3>
        <p>点击加载 Vue3 技术栈的子应用</p>
      </div>
      <div class="card" @click="$router.push('/son02-react-ts')">
        <h3>React 子应用</h3>
        <p>点击加载 React 技术栈的子应用</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 可以在这里添加逻辑
</script>

<style scoped>
.welcome-page {
  flex: 1;
  text-align: center;
  padding: 40px 24px;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.welcome-page h1 {
  font-size: 28px;
  color: #1a1a1a;
  margin-bottom: 12px;
  font-weight: 600;
}

.welcome-page p {
  color: #64748b;
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.app-cards {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.card {
  width: 280px;
  padding: 32px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #1890ff;
}

.card h3 {
  margin: 0 0 12px 0;
  color: #1890ff;
  font-size: 18px;
  font-weight: 600;
}

.card p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}
</style>
