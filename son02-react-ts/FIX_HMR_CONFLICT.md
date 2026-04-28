# React Fast Refresh 与 qiankun 冲突解决方案

## 问题描述

```
Uncaught SyntaxError: Cannot use import statement outside a module
@vitejs/plugin-react can't detect preamble. Something is wrong.
```

这是因为 Vite 的 React Fast Refresh (HMR) 代码使用了 ES Module 语法，而 qiankun 的沙箱在执行时将其当作普通脚本处理。

## 已应用的修复

### 1. vite.config.ts - 禁用 HMR

```typescript
export default defineConfig({
  server: {
    hmr: false, // 禁用 HMR，避免与 qiankun 冲突
  },
});
```

### 2. main-vue3-ts/src/main.ts - 配置 singular

```typescript
start({
  sandbox: {
    strictStyleIsolation: false,
    experimentalStyleIsolation: true,
  },
  singular: false, // 允许多个微应用同时存在
});
```

## 如果问题仍然存在

### 方案 1：清除缓存并重启（推荐首先尝试）

```bash
# 在 React 子应用目录
rm -rf node_modules/.vite
pnpm dev

# 在主应用目录也清除缓存
cd ../main-vue3-ts
rm -rf node_modules/.vite
pnpm dev
```

### 方案 2：使用生产构建测试

开发环境的 HMR 代码会导致问题，但生产构建不会：

```bash
# 在 React 子应用目录
pnpm build

# 启动预览服务器
pnpm preview
```

然后修改主应用配置，将 entry 改为预览服务器的地址。

### 方案 3：降级 @vitejs/plugin-react 版本

新版本的 React 插件可能与 qiankun 有兼容性问题：

```bash
# 在 React 子应用目录
pnpm remove @vitejs/plugin-react
pnpm add -D @vitejs/plugin-react@4.3.0
```

然后在 `vite.config.ts` 中配置：

```typescript
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      // 尝试禁用 fast refresh
      babel: {
        plugins: [],
      },
    }),
  ],
});
```

### 方案 4：配置 qiankun 使用 legacy 沙箱

在主应用中修改配置：

```typescript
start({
  sandbox: {
    // 使用 legacy 沙箱，兼容性更好
    legacySandbox: true,
    experimentalStyleIsolation: true,
  },
});
```

### 方案 5：修改 Vite 配置输出格式

在 `vite.config.ts` 中添加：

```typescript
export default defineConfig({
  build: {
    // 确保输出兼容的代码
    target: "es2015",
  },
  optimizeDeps: {
    // 预构建依赖，避免运行时问题
    include: ["react", "react-dom"],
  },
});
```

## 临时 Workaround：独立开发 React 子应用

如果上述方法都不起作用，可以在开发时独立运行 React 子应用：

1. **直接访问子应用**：

   ```
   http://localhost:8082
   ```

2. **在主应用中仅用于集成测试**：
   - 开发时在子应用中调试
   - 需要测试集成时使用生产构建

## 验证修复

重启应用后，检查控制台是否还有以下错误：

- ❌ `Cannot use import statement outside a module`
- ❌ `@vitejs/plugin-react can't detect preamble`

如果看到以下日志，说明成功：

- ✅ `React 子应用 bootstrap`
- ✅ `React 子应用 mount`
- ✅ React 组件正常渲染

## 最佳实践建议

1. **开发阶段**：
   - 优先在子应用中独立开发和调试
   - 使用 `pnpm dev` 直接访问子应用
   - 享受完整的 HMR 功能

2. **集成测试**：
   - 使用生产构建测试 qiankun 集成
   - 或者接受开发环境下没有 HMR

3. **生产环境**：
   - 使用构建后的文件
   - 不会有 HMR 相关问题

## 相关资源

- [qiankun Issues - React Fast Refresh](https://github.com/umijs/qiankun/issues)
- [vite-plugin-qiankun GitHub](https://github.com/hongxin07/vite-plugin-qiankun)
- [Vite HMR Documentation](https://vite.dev/guide/features.html#hot-module-replacement)
