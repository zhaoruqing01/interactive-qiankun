<template>
  <div class="article-list">
    <h1>文章列表</h1>

    <!-- 查询表单 -->
    <div class="search-form">
      <el-button type="primary" @click="handleAdd">添加文章</el-button>
      <el-input
        v-model="searchForm.title"
        placeholder="请输入文章标题"
        style="width: 300px"
        clearable
      >
        <template #append>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </template>
      </el-input>
    </div>

    <div class="table-container">
      <!-- 文章表格 -->
      <el-table
        :data="articleList"
        style="width: 100%; height: calc(100vh - 300px)"
        border
      >
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
            <el-tag :type="scope.row.status === '已发布' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, prev, pager, next, sizes, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 文章编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        :model="formData"
        label-width="80px"
        :rules="rules"
        ref="formRef"
      >
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="formData.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="文章内容" prop="content">
          <el-input v-model="formData.content" placeholder="请输入文章内容" />
        </el-form-item>
        <el-form-item label="发布状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择发布状态">
            <el-option label="已发布" value="已发布" />
            <el-option label="草稿" value="草稿" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  createArticleAPI,
  deleteArticleAPI,
  getArticlesListAPI,
  updateArticleAPI,
} from "@/api/article";
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, reactive, ref } from "vue";

// 搜索表单
const searchForm = reactive({
  title: "",
});

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 文章列表数据
const articleList = ref([]);

// 对话框状态
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref();

// 表单数据
const formData = reactive({
  id: 0,
  title: "",
  author: "",
  content: "",
  status: "草稿",
});

// 表单验证规则
const rules = reactive({
  title: [
    { required: true, message: "请输入文章标题", trigger: "blur" },
    {
      min: 2,
      max: 100,
      message: "标题长度在 2 到 100 个字符",
      trigger: "blur",
    },
  ],
  author: [
    { required: true, message: "请输入作者", trigger: "blur" },
    { min: 2, max: 50, message: "作者长度在 2 到 50 个字符", trigger: "blur" },
  ],
  status: [{ required: true, message: "请选择发布状态", trigger: "change" }],
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

// 获取文章列表
const getArticlesList = async () => {
  const res = await getArticlesListAPI({
    title: searchForm.title,
    page: pagination.currentPage,
    limit: pagination.pageSize,
  });
  if (res.status === 0) {
    articleList.value = res.data.list || [];
    pagination.total = res.data.total || 0;
  } else {
    ElMessage.error(res.message || "获取文章列表失败");
  }
};

// 初始化时设置总数
onMounted(() => {
  getArticlesList();
});

// 处理搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  getArticlesList();
};

// 处理添加
const handleAdd = () => {
  dialogTitle.value = "添加文章";
  // 重置表单
  Object.assign(formData, {
    id: 0,
    title: "",
    author: "",
    status: "草稿",
  });
  dialogVisible.value = true;
};

// 处理编辑
const handleEdit = (row: any) => {
  dialogTitle.value = "编辑文章";
  // 填充表单数据
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    author: row.author,
    status: row.status,
  });
  dialogVisible.value = true;
};

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        let res;
        if (formData.id) {
          // 更新文章
          res = await updateArticleAPI({
            id: formData.id,
            title: formData.title,
            author: formData.author,
            status: formData.status,
            content: formData.content,
          });
        } else {
          // 新增文章
          res = await createArticleAPI({
            title: formData.title,
            author: formData.author,
            status: formData.status,
            content: formData.content,
          });
        }

        if (res.status === 0) {
          ElMessage.success(formData.id ? "更新成功" : "添加成功");
          dialogVisible.value = false;
          getArticlesList();
        } else {
          ElMessage.error(
            res.message || (formData.id ? "更新失败" : "添加失败"),
          );
        }
      } catch (error) {
        ElMessage.error("操作失败，请稍后重试");
      }
    }
  });
};

// 处理删除
const handleDelete = (id: number) => {
  ElMessageBox.confirm("确定要删除这篇文章吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const res = await deleteArticleAPI(id);
      if (res.status === 0) {
        ElMessage.success("删除成功");
        getArticlesList();
      } else {
        ElMessage.error(res.message || "删除失败");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  getArticlesList();
};

// 处理当前页码变化
const handleCurrentChange = (current: number) => {
  pagination.currentPage = current;
  getArticlesList();
};
</script>

<style scoped>
.article-list {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.table-container {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
