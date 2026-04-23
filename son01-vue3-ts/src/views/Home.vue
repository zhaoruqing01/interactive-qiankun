<template>
  <div class="home">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>欢迎使用交互练习系统</span>
        </div>
      </template>
      <div class="content">
        <p>这是一个基于 Vue 3 + TypeScript + Element Plus 构建的简单交互练习系统框架。</p>
        <p>左侧为菜单区域，右侧为内容展示区，已经为您配置好了基础路由功能。</p>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="8">
            <el-statistic title="今日访问量" :value="1234" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="活跃用户" :value="567" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="系统通知" :value="8" />
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
  padding: 20px;
}
.card-header {
  font-weight: bold;
  font-size: 18px;
}
.content p {
  line-height: 1.6;
  color: #606266;
}
</style>