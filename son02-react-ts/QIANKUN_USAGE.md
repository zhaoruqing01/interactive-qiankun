# qiankun 全局状态管理使用指南

## 概述

React 子应用已将 qiankun 的全局状态方法挂载到 `window.__QIANKUN_GLOBAL_STATE__`，并提供了便捷的工具函数。

## 文件结构

```
src/
├── types/
│   └── qiankun.d.ts          # TypeScript 类型定义
├── utils/
│   └── qiankun.ts            # 工具函数
└── main.tsx                  # 入口文件（已挂载全局方法）
```

## 使用方法

### 方式一：使用工具函数（推荐）

```typescript
import {
  onGlobalStateChange,
  setGlobalState,
  getBaseUrl,
  setBaseUrl,
} from "./utils/qiankun";

// 监听全局状态变化
onGlobalStateChange((state) => {
  console.log("全局状态已更新:", state);
}, true); // true 表示立即执行一次

// 设置全局状态
setGlobalState({
  userInfo: { name: "张三" },
  theme: "dark",
});

// 获取 BASE_URL
const baseUrl = getBaseUrl();

// 设置 BASE_URL（会自动同步到全局状态）
setBaseUrl("http://new-api.example.com");
```

### 方式二：直接访问 window 对象

```typescript
// 获取全局状态方法
const { onGlobalStateChange, setGlobalState } =
  window.__QIANKUN_GLOBAL_STATE__ || {};

// 使用
if (onGlobalStateChange) {
  onGlobalStateChange((state) => {
    console.log("状态变化:", state);
  });
}

if (setGlobalState) {
  setGlobalState({ key: "value" });
}
```

### 方式三：在 React 组件中使用 Hook 模式

```typescript
import { useEffect, useState } from 'react';
import { onGlobalStateChange, getBaseUrl } from './utils/qiankun';

function MyComponent() {
  const [baseUrl, setBaseUrl] = useState(() => getBaseUrl());

  useEffect(() => {
    // 订阅全局状态变化
    onGlobalStateChange((state) => {
      if (state.BASE_URL) {
        setBaseUrl(state.BASE_URL as string);
      }
    }, true);
  }, []);

  return <div>Current BASE_URL: {baseUrl}</div>;
}
```

## API 说明

### onGlobalStateChange(callback, fireImmediately?)

监听全局状态变化。

**参数：**

- `callback`: 状态变化时的回调函数，接收最新的状态对象
- `fireImmediately`: 是否立即执行一次回调（可选，默认 false）

**示例：**

```typescript
onGlobalStateChange((state) => {
  console.log("用户信息:", state.userInfo);
  console.log("主题:", state.theme);
}, true);
```

### setGlobalState(state)

设置全局状态，会通知所有订阅的应用。

**参数：**

- `state`: 要更新的状态对象

**示例：**

```typescript
setGlobalState({
  userInfo: { name: "李四", token: "xxx" },
  theme: "light",
});
```

### getBaseUrl()

获取当前的 API 基地址。

**返回：** string 类型的 BASE_URL

**示例：**

```typescript
const baseUrl = getBaseUrl();
console.log(baseUrl); // "http://localhost:3007"
```

### setBaseUrl(url)

设置 API 基地址，会自动同步到全局状态。

**参数：**

- `url`: 新的 API 基地址

**示例：**

```typescript
setBaseUrl("http://production-api.example.com");
```

## 完整示例

查看 `src/App.tsx` 中的完整实现示例，展示了如何：

1. 在组件初始化时获取 BASE_URL
2. 监听全局状态变化
3. 通过按钮触发状态更新

## 注意事项

1. **仅在 qiankun 环境中可用**：这些方法只在微前端环境下有效，独立运行时返回 undefined
2. **类型安全**：已提供完整的 TypeScript 类型定义
3. **自动同步**：修改 BASE_URL 时会自动同步到全局状态和 sessionStorage
4. **跨应用通信**：通过全局状态可以实现主应用与子应用、子应用与子应用之间的通信

## 最佳实践

1. **优先使用工具函数**：比直接访问 window 更安全、更简洁
2. **在 useEffect 中订阅**：避免在渲染过程中直接调用
3. **清理订阅**：如果需要在组件卸载时取消订阅，可以保存回调引用
4. **状态最小化**：只在全局状态中存储需要跨应用共享的数据
