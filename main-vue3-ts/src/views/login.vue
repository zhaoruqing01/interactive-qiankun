<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">用户登录</h2>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        class="login-form"
        label-position="top"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
            autocomplete="username"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
      </el-form>
      <div class="button-group">
        <el-button
          type="primary"
          @click="handleLogin"
          :loading="loading"
          class="login-button"
          size="large"
        >
          登录
        </el-button>
        <el-button
          class="register-button"
          plain
          @click="handleRegister"
          :loading="loading"
          size="large"
        >
          注册
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getUserInfoAPI, loginAPI, registerAPI } from "@/api/user";
import { useUserStore } from "@/store/user";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

// 实例化
const userStore = useUserStore();
const router = useRouter();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

const rules = reactive<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
});

// 登录：使用 async/await 优化异步逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    const res = await loginAPI(loginForm);

    if (res.status === 0) {
      // 存储 Token
      userStore.setToken(res.token);

      // 确保用户信息获取成功后再跳转
      const userInfo = await getUserInfoAPI();
      userStore.setUserInfo(userInfo.data);

      ElMessage.success("登录成功！");
      router.push("/");
    } else {
      ElMessage.error(res.msg || "登录失败");
    }
  } catch (error) {
    console.error("表单校验失败或接口报错", error);
  } finally {
    loading.value = false;
  }
};

// 注册
const handleRegister = async () => {
  if (!loginFormRef.value) return;

  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    const res = await registerAPI(loginForm);

    if (res.status === 0) {
      ElMessage.success("注册成功！");
    } else {
      ElMessage.error(res.msg || "注册失败");
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
// 全局样式重置与容器美化
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  // 柔和渐变背景，提升视觉质感
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%);
  padding: 20px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

// 登录卡片优化
.login-box {
  width: 100%;
  max-width: 440px;
  padding: 50px 35px;
  background: #ffffff;
  border-radius: 20px;
  // 更柔和的多层阴影
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

  // 悬浮动效：卡片轻微上浮
  &:hover {
    transform: translateY(-6px);
    box-shadow:
      0 16px 32px rgba(0, 0, 0, 0.12),
      0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

// 标题美化
.login-title {
  text-align: center;
  margin: 0 0 45px 0;
  font-size: 28px;
  color: #2c3e50;
  font-weight: 600;
  letter-spacing: 2px;
  position: relative;

  // 标题底部装饰线
  &::after {
    content: "";
    display: block;
    width: 50px;
    height: 3px;
    background: #409eff;
    margin: 12px auto 0;
    border-radius: 3px;
  }
}

// 表单样式优化
.login-form {
  // 输入框样式美化
  :deep(.el-input__wrapper) {
    padding: 10px 16px;
    border-radius: 10px;
    box-shadow: none;
    border: 1px solid #e5e6eb;
    transition: all 0.3s ease;
  }

  // 输入框聚焦效果
  :deep(.el-input__wrapper.is-focus) {
    border-color: #409eff;
    box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
  }

  // 表单间距统一
  .el-form-item {
    margin-bottom: 28px;
  }

  // 按钮组布局
}

// 移动端响应式优化
@media (max-width: 576px) {
  .login-container {
    background: #ffffff;
    padding-top: 40px;
  }

  .login-box {
    box-shadow: none;
    padding: 0 25px;
    max-width: 100%;
  }

  .login-title {
    font-size: 24px;
    margin-bottom: 35px;
    text-align: center;
  }

  .login-form {
    .el-form-item {
      margin-bottom: 24px;
    }

    .login-button,
    .register-button {
      height: 48px;
    }
  }
}
.button-group {
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 18px;

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}

// 登录按钮（主按钮）
.login-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #409eff 0%, #2b8dff 100%);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  }
}

// 注册按钮（次按钮）
.register-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10px;
  color: #409eff;
  border-color: #409eff;
  transition: all 0.3s ease;
  margin-left: 0px !important;

  &:hover {
    background-color: rgba(64, 158, 255, 0.05);
    transform: translateY(-2px);
  }
}
</style>
