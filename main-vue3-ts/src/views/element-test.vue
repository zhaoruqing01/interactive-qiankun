<template>
  <div class="element-test-page">
    <h1>Element Plus 测试页面</h1>
    <p>这是一个用于测试 Element Plus 组件的页面。</p>

    <el-button type="primary">主要按钮</el-button>
    <el-button type="success">成功按钮</el-button>
    <el-button type="warning">警告按钮</el-button>
    <el-button type="danger">危险按钮</el-button>

    <div style="margin-top: 20px">
      <el-input v-model="inputValue" placeholder="请输入内容" />
    </div>

    <div style="margin-top: 20px">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>卡片标题</span>
          </div>
        </template>
        <div>卡片内容</div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const inputValue = ref("");
</script>

<style scoped>
.element-test-page {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.element-test-page h1 {
  color: #1a1a1a;
  margin-bottom: 16px;
}

.element-test-page p {
  color: #64748b;
  margin-bottom: 24px;
}

.box-card {
  width: 100%;
}
</style>
