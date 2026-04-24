<template>
  <div class="layout-container">
    <div class="main-content">
      <header class="header">
        <div class="logo-main">Qiankun Main</div>
        <nav class="menu">
          <!-- 动态生成菜单 -->
          <router-link
            v-for="route in menuRoutes"
            :key="route.path"
            :to="route.path"
            class="menu-item"
            :class="{ active: isActiveRoute(route) }"
          >
            {{ route.meta?.title }}
          </router-link>
        </nav>
        <div class="user-section">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ userStore.userInfo?.username?.charAt(0).toUpperCase() || "U" }}
            </el-avatar>
            <span class="username">{{
              userStore.userInfo?.username || "用户"
            }}</span>
          </div>
          <el-dropdown @command="handleCommand">
            <el-button type="primary" link class="dropdown-btn">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <div class="content">
        <div v-if="$route.path !== '/'" class="micro-app-view">
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </div>
        <div v-else class="welcome-page">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "../router/index";
import { useUserStore } from "../store/user";

const $route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 获取所有带有菜单标识的路由
const menuRoutes = computed(() => {
  // 从路由配置中找到 Layout 的子路由
  const layoutRoute = routes.find((route: any) => route.path === "/");

  if (layoutRoute && layoutRoute.children) {
    return layoutRoute.children
      .filter((child: any) => child.meta?.isMenu)
      .map((child: any) => {
        // 将相对路径转换为绝对路径
        let fullPath = child.path === "" ? "/" : `/${child.path.split("/")[0]}`;

        return {
          ...child,
          path: fullPath,
          // 保存原始路径用于判断
          originalPath: child.path,
        };
      });
  }

  return [];
});

// 判断当前路由是否激活
const isActiveRoute = (route: any) => {
  const routePath = route.path; // 已经转换后的绝对路径
  const originalPath = route.originalPath || route.path; // 原始路径

  if (routePath === "/") {
    // 首页特殊处理，精确匹配根路径
    return $route.path === "/";
  } else if (originalPath.includes(":pathMatch")) {
    // 对于包含通配符的子应用路由，使用前缀匹配
    return $route.path.startsWith(routePath + "/") || $route.path === routePath;
  } else {
    // 其他路由精确匹配
    return $route.path === routePath;
  }
};

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case "profile":
      ElMessage.info("个人信息功能待实现");
      break;
    case "settings":
      ElMessage.info("设置功能待实现");
      break;
    case "logout":
      handleLogout();
      break;
  }
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 清空用户信息
      userStore.clearUserInfo();
      ElMessage.success("退出登录成功");
      // 跳转到登录页
      router.push("/login");
    })
    .catch(() => {
      // 取消操作
    });
};
</script>

<style scoped>
/* 优化后的整体布局 */
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
  min-height: 0;
}

/* 头部样式优化 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0 24px;
  z-index: 10;
}

.logo-main {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.menu {
  display: flex;
  gap: 8px;
  margin-left: auto;
  margin-right: 24px;
}

.menu-item {
  padding: 8px 16px;
  color: #4a5568;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
}

.menu-item:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.08);
}

.menu-item.active {
  background-color: #1890ff;
  color: white;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background-color: #1890ff;
  color: white;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.dropdown-btn {
  padding: 0;
  font-size: 12px;
}

/* 内容区域优化 */
.content {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.micro-app-view {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: white;

  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 欢迎页面优化 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }

  .menu {
    gap: 4px;
    margin-right: 12px;
  }

  .menu-item {
    padding: 6px 12px;
    font-size: 13px;
  }

  .content {
    padding: 16px;
  }

  .app-cards {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 100%;
    max-width: 320px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
