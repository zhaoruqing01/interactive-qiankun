# React 子应用样式和资源加载问题修复指南

## 问题描述

在 qiankun 微前端环境中，React 子应用出现以下问题：

1. ❌ 背景颜色不显示或与主应用冲突
2. ❌ 静态资源（图片、字体等）加载失败
3. ❌ CSS 变量无法正确继承

## 根本原因

### 1. 样式隔离导致的问题

- `experimentalStyleIsolation: true` 会给子应用的样式添加特殊的选择器前缀
- `:root` 选择器在隔离环境下可能无法正常工作
- CSS 变量定义在 `:root` 上时，子应用可能无法访问

### 2. 资源路径问题

- Vite 的 `base` 配置影响资源加载路径
- 开发环境和生产环境需要不同的配置
- qiankun 动态加载时，相对路径可能解析错误

## 已应用的修复

### ✅ 1. index.css - 调整背景色应用位置

**修改前：**

```css
:root {
  background: var(--bg); /* ❌ 在 qiankun 中可能被隔离 */
}
```

**修改后：**

```css
:root {
  /* background: var(--bg); */ /* 移除 :root 上的背景 */
}

#root {
  background: var(--bg); /* ✅ 直接在容器上应用背景 */
}
```

### ✅ 2. vite.config.ts - 优化 base 配置

**修改前：**

```typescript
export default defineConfig({
  base: "./", // ❌ 开发环境使用相对路径会导致资源加载错误
});
```

**修改后：**

```typescript
export default defineConfig({
  // ✅ 开发环境使用绝对路径，生产环境使用相对路径
  base: process.env.NODE_ENV === "production" ? "./" : "/",
});
```

### ✅ 3. 保持样式隔离配置

主应用中保持：

```typescript
start({
  sandbox: {
    strictStyleIsolation: false, // 不使用 Shadow DOM
    experimentalStyleIsolation: true, // 使用实验性样式隔离
  },
});
```

## 如果仍有问题

### 方案 1：检查浏览器控制台

打开开发者工具，检查：

1. **Network 标签** - 查看图片等资源是否 404
2. **Console 标签** - 查看是否有 CSS 加载错误
3. **Elements 标签** - 检查 `#root` 元素是否有正确的背景色

### 方案 2：临时禁用样式隔离测试

在主应用中临时修改：

```typescript
start({
  sandbox: {
    strictStyleIsolation: false,
    experimentalStyleIsolation: false, // 临时禁用来测试
  },
});
```

如果禁用后正常，说明确实是样式隔离导致的问题。

### 方案 3：使用更具体的 CSS 选择器

如果 CSS 变量不起作用，可以直接指定颜色值：

```css
#root {
  background: #fff; /* 直接使用颜色值，不依赖变量 */
  color: #6b6375;
}

@media (prefers-color-scheme: dark) {
  #root {
    background: #16171d;
    color: #9ca3af;
  }
}
```

### 方案 4：确保图片正确导入

在 React 组件中，确保使用正确的导入方式：

```tsx
// ✅ 正确：通过 import 导入
import heroImg from "./assets/hero.png";

function App() {
  return <img src={heroImg} alt="Hero" />;
}

// ❌ 错误：直接使用相对路径
<img src="./assets/hero.png" alt="Hero" />;
```

### 方案 5：检查 public 目录的资源

如果图片放在 `public` 目录：

```
son02-react-ts/
├── public/
│   └── images/
│       └── logo.png
```

使用时需要用绝对路径：

```tsx
<img src="/images/logo.png" alt="Logo" />
```

## 验证修复

### 1. 清除缓存并重启

```bash
# Windows
restart-all.bat

# 或手动执行
cd son02-react-ts
rm -rf node_modules/.vite
pnpm dev
```

### 2. 检查要点

- ✅ 背景颜色正常显示
- ✅ 图片资源正确加载
- ✅ 没有 404 错误
- ✅ CSS 样式正确应用
- ✅ 深色/浅色主题切换正常

### 3. 测试不同环境

**开发环境：**

```bash
pnpm dev
# 访问 http://localhost:8082（独立运行）
# 或在主应用中访问 /son02-react-ts
```

**生产环境：**

```bash
pnpm build
pnpm preview
```

## 最佳实践

### 1. CSS 变量使用建议

```css
/* ✅ 推荐：在容器级别应用背景和颜色 */
#root {
  background: var(--bg);
  color: var(--text);
}

/* ❌ 避免：在 :root 上设置背景 */
:root {
  background: var(--bg);
}
```

### 2. 资源导入建议

```tsx
// ✅ 推荐：使用 import 导入 src 目录的资源
import logo from './assets/logo.png';

// ✅ 推荐：public 目录使用绝对路径
<img src="/logo.png" alt="Logo" />

// ❌ 避免：相对路径引用 public 资源
<img src="../public/logo.png" alt="Logo" />
```

### 3. Vite 配置建议

```typescript
export default defineConfig({
  // 根据环境动态设置 base
  base: process.env.NODE_ENV === "production" ? "./" : "/",

  server: {
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },

  build: {
    assetsDir: "assets", // 静态资源目录
    outDir: "dist",
  },
});
```

## 常见问题

### Q: 为什么深色模式不生效？

A: 检查以下几点：

1. 确保 `@media (prefers-color-scheme: dark)` 规则存在
2. 确保在 `#root` 上也定义了深色模式的样式
3. 检查浏览器是否支持 `prefers-color-scheme`

### Q: 图片显示为空白或破碎图标？

A:

1. 检查 Network 标签是否有 404 错误
2. 确认图片路径是否正确
3. 尝试清除浏览器缓存
4. 检查 vite.config.ts 的 base 配置

### Q: 样式在主应用中正常，但在 qiankun 中不正常？

A:

1. 检查是否使用了 `:root` 或 `html/body` 选择器
2. 尝试将样式应用到具体容器（如 `#root`）
3. 检查是否有 CSS 优先级问题
4. 考虑暂时禁用 `experimentalStyleIsolation` 测试

## 相关资源

- [qiankun 样式隔离文档](https://qiankun.umijs.org/zh/api#startopts)
- [Vite 静态资源处理](https://vite.dev/guide/assets.html)
- [CSS 变量兼容性](https://caniuse.com/css-variables)
