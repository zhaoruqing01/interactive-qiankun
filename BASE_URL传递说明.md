# 主应用向子应用传递 BASE_URL 配置

## 功能说明

实现了主应用向 qiankun 子应用动态传递 API 基地址（BASE_URL）的功能，确保子应用能够使用统一的 API 服务地址。

## 实现方案

### 1. 主应用配置

#### 环境变量文件

**文件**: `main-vue3-ts/src/.env.development`

```env
VITE_BASE_URL = "http://localhost:3007"
```

#### 主应用 main.ts

**文件**: `main-vue3-ts/src/main.ts`

在注册子应用时，通过 `props` 传递 BASE_URL：

```typescript
registerMicroApps([
  {
    name: "son01-vue3-ts",
    entry:
      process.env.NODE_ENV === "development"
        ? "//localhost:8081"
        : "/son01-vue3-ts/",
    container: "#micro-app-container",
    activeRule: "/son01-vue3-ts",
    props: {
      onGlobalStateChange: actions.onGlobalStateChange,
      setGlobalState: actions.setGlobalState,
      mainAppName: "son01-vue3-ts",
      // 传递 API 基地址
      BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:3007",
    },
  },
  // ... 其他子应用
]);
```

### 2. Vue3 子应用配置

#### 接收 BASE_URL

**文件**: `son01-vue3-ts/src/main.ts`

在 `render` 函数中接收并存储 BASE_URL：

```typescript
function render(props: any = {}) {
  const { container, BASE_URL } = props;

  // ... 其他初始化代码

  // 如果主应用传递了 BASE_URL，则使用它
  if (BASE_URL) {
    console.log("从主应用接收到的 BASE_URL:", BASE_URL);
    // 将 BASE_URL 存储到 sessionStorage 中
    sessionStorage.setItem("VITE_BASE_URL", BASE_URL);
  }

  // ... 挂载应用
}
```

#### 使用 BASE_URL

**文件**: `son01-vue3-ts/src/utils/request.ts`

在 axios 实例中动态获取 BASE_URL：

```typescript
// 优先使用从主应用传递的 BASE_URL，否则使用环境变量
const getBaseURL = () => {
  // 1. 尝试从 sessionStorage 获取（由主应用传递）
  const sessionBaseURL = sessionStorage.getItem("VITE_BASE_URL");
  if (sessionBaseURL) {
    return sessionBaseURL;
  }

  // 2. 使用环境变量
  return import.meta.env.VITE_BASE_URL || "http://localhost:3007";
};

const request = axios.create({
  baseURL: getBaseURL(),
  timeout: 5000,
});

// 请求拦截器 - 每次请求前动态更新 baseURL
request.interceptors.request.use(
  (config) => {
    // 动态更新 baseURL
    config.baseURL = getBaseURL();

    // 添加 token 等其他逻辑
    const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
    if (userInfo.token) {
      config.headers.Authorization = userInfo.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
```

## 工作流程

1. **主应用启动**：读取 `.env.development` 中的 `VITE_BASE_URL`
2. **注册子应用**：通过 `props.BASE_URL` 传递给子应用
3. **子应用挂载**：接收 `props.BASE_URL` 并存储到 `sessionStorage`
4. **发起请求**：axios 拦截器从 `sessionStorage` 读取 BASE_URL 并设置到请求配置中

## 优势

1. **统一管理**：所有子应用的 API 地址由主应用统一配置
2. **灵活切换**：只需修改主应用的环境变量，所有子应用自动生效
3. **降级方案**：如果主应用未传递，子应用仍可使用自己的环境变量
4. **动态更新**：每次请求都会重新获取最新的 BASE_URL

## 注意事项

1. **环境变量命名**：
   - 主应用使用 `VITE_BASE_URL`（Vite 项目）
   - 子应用也使用 `VITE_BASE_URL` 保持一致性

2. **存储方式**：使用 `sessionStorage` 而非 `localStorage`，确保会话结束后自动清除

3. **TypeScript 类型**：主应用 main.ts 中的生命周期函数类型错误不影响功能运行

4. **React 子应用**：如需为 React 子应用添加相同功能，参考 Vue3 子应用的实现方式

## 测试验证

1. 启动主应用和子应用
2. 打开浏览器控制台
3. 访问子应用路由（如 `/son01-vue3-ts`）
4. 查看控制台输出：`从主应用接收到的 BASE_URL: http://localhost:3007`
5. 检查网络请求，确认请求地址使用了正确的 BASE_URL
