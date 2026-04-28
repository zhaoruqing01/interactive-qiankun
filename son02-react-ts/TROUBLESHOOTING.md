# React 子应用 qiankun 配置问题修复指南

## 问题描述

在加载 React 子应用时出现以下错误：

```
Uncaught SyntaxError: Cannot use import statement outside a module
@vitejs/plugin-react can't detect preamble. Something is wrong.
```

## 原因分析

这是因为 Vite 的开发服务器在开发模式下会注入 HMR（热模块替换）代码和 React Fast Refresh 代码，这些代码使用了 ES Module 语法（`import` 语句），而 qiankun 的沙箱机制在执行这些代码时会出现问题。

## 已应用的修复方案

### 1. vite.config.ts 配置优化

```typescript
export default defineConfig({
  base: "./", // 设置相对路径，避免资源加载问题
  plugins: [
    react(),
    qiankun("son02-react-ts", {
      useDevMode: true,
    }),
  ],
  server: {
    open: false, // 子应用不要自动打开浏览器
    port: 8082,
    cors: true, // 启用 CORS
    headers: {
      "Access-Control-Allow-Origin": "*", // 允许跨域访问
    },
  },
  build: {
    outDir: "dist",
  },
});
```

**关键配置说明：**

- `base: './'` - 使用相对路径，确保资源正确加载
- `open: false` - 子应用不应该自动打开浏览器窗口
- `cors: true` 和 `headers` - 允许主应用跨域访问子应用
- `useDevMode: true` - 启用 qiankun 开发模式

### 2. index.html 添加防护脚本

在 `<head>` 中添加了检测 qiankun 环境的脚本，防止某些开发特性冲突。

### 3. .env.development 环境变量

创建了环境变量文件，配置 API 基地址等参数。

## 使用步骤

### 启动开发环境

1. **启动主应用**（在主应用目录）：

```bash
cd main-vue3-ts
pnpm dev
```

2. **启动 React 子应用**（在 React 子应用目录）：

```bash
cd son02-react-ts
pnpm dev
```

3. **访问主应用**：
   打开浏览器访问 `http://localhost:8080`（或主应用的端口）

4. **导航到 React 子应用**：
   点击菜单或访问 `/son02-react-ts` 路由

## 如果仍然出现问题

### 方案 1：清除缓存并重启

```bash
# 在 React 子应用目录
rm -rf node_modules/.vite
pnpm dev
```

### 方案 2：检查端口是否被占用

确保 8082 端口没有被其他应用占用：

```bash
# Windows
netstat -ano | findstr :8082

# 如果被占用，杀死进程或修改端口
```

### 方案 3：检查主应用配置

确认主应用中 React 子应用的配置：

```typescript
{
  name: "son02-react-ts",
  entry: "//localhost:8082",  // 开发环境
  container: "#micro-app-container",
  activeRule: "/son02-react-ts",
  props: {
    ...actions,
    BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:3007",
  },
}
```

### 方案 4：使用生产构建测试

如果开发环境仍有问题，可以尝试构建后测试：

```bash
# 在 React 子应用目录
pnpm build

# 使用 preview 模式
pnpm preview
```

然后修改主应用配置，将 entry 指向构建后的文件。

## 在页面中使用全局状态

### 方法 1：使用工具函数（推荐）

```tsx
import { useEffect, useState } from "react";
import {
  onGlobalStateChange,
  setGlobalState,
  getBaseUrl,
} from "./utils/qiankun";

function MyComponent() {
  const [baseUrl, setBaseUrl] = useState(getBaseUrl());

  useEffect(() => {
    // 监听全局状态变化
    onGlobalStateChange((state) => {
      console.log("全局状态更新:", state);
      if (state.BASE_URL) {
        setBaseUrl(state.BASE_URL as string);
      }
    }, true);
  }, []);

  // 修改全局状态
  const handleChangeUrl = () => {
    setGlobalState({ BASE_URL: "http://new-api.com" });
  };

  return (
    <div>
      <p>Current BASE_URL: {baseUrl}</p>
      <button onClick={handleChangeUrl}>Change URL</button>
    </div>
  );
}
```

### 方法 2：直接访问 window 对象

```tsx
// 获取全局状态方法
const { onGlobalStateChange, setGlobalState } =
  window.__QIANKUN_GLOBAL_STATE__ || {};

// 使用
if (onGlobalStateChange) {
  onGlobalStateChange((state) => {
    console.log("状态变化:", state);
  });
}
```

## 注意事项

1. **不要在子应用中独立使用 BrowserRouter**
   - qiankun 环境下应该使用主应用的路由

2. **样式隔离**
   - 已配置 `experimentalStyleIsolation: true`
   - 建议使用 CSS Modules 或 scoped CSS

3. **资源路径**
   - 所有静态资源使用相对路径或绝对路径
   - 避免使用 `../` 这样的相对路径引用

4. **生命周期管理**
   - 确保在 unmount 时清理定时器和事件监听器
   - 避免内存泄漏

## 常见问题

### Q: 为什么禁用 React Fast Refresh？

A: React Fast Refresh 会与 qiankun 的沙箱机制冲突，导致 HMR 代码无法正确执行。在微前端环境下，建议通过刷新页面来查看更改。

### Q: 子应用可以独立运行吗？

A: 可以！当不在 qiankun 环境中时，子应用会独立运行，所有功能正常。

### Q: 如何调试子应用？

A:

1. 可以直接访问 `http://localhost:8082` 独立调试
2. 也可以在主应用中通过开发者工具调试
3. 查看控制台日志了解加载状态

## 更多信息

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [vite-plugin-qiankun](https://github.com/hongxin07/vite-plugin-qiankun)
- [React 子应用最佳实践](./QIANKUN_USAGE.md)
