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
        <el-form-item class="button-group">
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
            type="primary"
            class="login-button"
            plain
            @click="handleRegister"
            :loading="loading"
            size="large"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa; // 改为浅灰色背景，现代感更强
  padding: 20px;
  box-sizing: border-box;
}

.login-box {
  width: 100%;
  max-width: 420px;
  padding: 40px 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-title {
  text-align: center;
  margin: 0 0 40px 0;
  font-size: 26px;
  color: #303133;
  font-weight: 700;
  letter-spacing: 1px;
}

.login-form {
  :deep(.el-input__wrapper) {
    padding: 8px 15px; // 增大输入框触控面积
  }

  .button-group {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px; // 按钮之间的间距

    :deep(.el-form-item__content) {
      margin-left: 0 !important; // 强制居中
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }

  .login-button {
    width: 100%;
    height: 50px; // 适配大拇指操作的高度
    font-size: 16px;
    border-radius: 8px;
    margin-left: 0 !important; // 覆盖 Element 默认的左边距
  }
}

/* 移动端适配 */
@media (max-width: 576px) {
  .login-container {
    background-color: #ffffff; // 手机端背景设为纯白
    align-items: flex-start; // 靠顶布局，预留键盘位置
    padding-top: 60px;
  }

  .login-box {
    box-shadow: none; // 去掉阴影，模拟原生 App 感
    padding: 0 20px;
    border-radius: 0;
  }

  .login-title {
    font-size: 24px;
    margin-bottom: 30px;
    text-align: left; // 手机端左对齐标题更符合习惯
  }

  .login-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}
</style>
