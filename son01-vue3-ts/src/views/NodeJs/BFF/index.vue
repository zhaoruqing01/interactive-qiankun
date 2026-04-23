<template>
  <div class="bff-page">
    <h1>BFF 数据展示</h1>

    <!-- 用户信息 -->
    <div class="user-info-card">
      <h3>用户信息</h3>
      <div class="user-info-content">
        <span>{{ userInfo }}</span>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="articles-section">
      <h3>文章列表</h3>
      <div class="articles-container">
        <el-table :data="articlesList" style="width: 100%" border>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="文章标题" />
          <el-table-column prop="author" label="作者" width="120" />
          <el-table-column label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.create_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === '已发布' ? 'success' : 'info'"
              >
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, prev, pager, next, sizes, jumper"
            :total="articlesTotal"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBFFListAPI } from "@/api/bff";
import { onMounted, reactive, ref } from "vue";

// 文章列表数据
const articlesList = ref([]);
// 文章总数
const articlesTotal = ref(0);
// 用户信息
const userInfo = ref("");
// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
});

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 获取BFF数据
const getBFFData = async () => {
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
  try {
    const res = await getBFFListAPI(params);
    if (res.code === 200) {
      articlesList.value = res.data.articles.list || [];
      articlesTotal.value = res.data.articles.total || 0;
      userInfo.value = res.data.userInfo || "";
    }
  } catch (error) {
    console.error("获取BFF数据失败:", error);
  }
};

// 初始化数据
onMounted(() => {
  getBFFData();
});

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  getBFFData();
};

// 处理当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.page = current;
  getBFFData();
};
</script>

<style scoped>
.bff-page {
  padding: 20px;
}

.user-info-card {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.user-info-content {
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.articles-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.articles-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

.articles-container {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
