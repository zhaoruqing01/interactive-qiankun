# React 子应用样式和资源问题诊断清单

## 🔍 快速诊断步骤

### 1. 检查背景颜色问题

打开浏览器开发者工具（F12），执行以下检查：

#### 检查点 A：CSS 变量是否正确定义

```javascript
// 在 Console 中运行
getComputedStyle(document.querySelector("#root")).getPropertyValue("--bg");
// 应该返回: " #fff" (浅色模式) 或 " #16171d" (深色模式)
```

#### 检查点 B：#root 元素是否有背景色

```javascript
// 在 Console 中运行
getComputedStyle(document.querySelector("#root")).backgroundColor;
// 应该返回: "rgb(255, 255, 255)" 或 "rgb(22, 23, 29)"
```

#### 检查点 C：Elements 标签检查

1. 选中 `#root` 元素
2. 查看 Computed 面板
3. 确认 `background-color` 有值且不是 `transparent`

### 2. 检查图片资源加载

#### 检查点 A：Network 标签

1. 打开 Network 标签
2. 刷新页面
3. 筛选 Img 类型
4. 检查是否有红色（失败）的请求

#### 检查点 B：图片路径

```javascript
// 在 Console 中运行，查看图片实际路径
document.querySelectorAll("img").forEach((img) => {
  console.log("Image src:", img.src);
});
```

期望的路径格式：

- ✅ `http://localhost:8082/src/assets/hero.png` (开发环境)
- ✅ `/son02-react-ts/assets/hero.xxx.png` (生产环境)
- ❌ `./assets/hero.png` (相对路径可能有问题)

### 3. 检查样式隔离影响

#### 检查点 A：查看应用的样式

在 Elements 标签中，检查 `#root` 的样式：

- 是否有 `[data-qiankun="son02-react-ts"]` 前缀？
- CSS 变量是否被正确解析？

#### 检查点 B：临时禁用样式隔离测试

在主应用 `main-vue3-ts/src/main.ts` 中：

```typescript
start({
  sandbox: {
    experimentalStyleIsolation: false, // 临时改为 false
  },
});
```

重启后看是否正常，如果正常说明确实是样式隔离问题。

## 🛠️ 常见问题修复

### 问题 1：背景色不显示

**症状：** 页面背景是白色或透明，而不是预期的颜色

**修复：**

```css
/* 确保 #root 有背景色 */
#root {
  background: var(--bg);
}
```

已修复 ✅ - 已在 index.css 中添加

### 问题 2：图片 404 错误

**症状：** 图片显示为破碎图标

**可能原因：**

1. vite.config.ts 的 base 配置错误
2. 图片路径不正确
3. 缓存问题

**修复步骤：**

```bash
# 1. 清除缓存
rm -rf node_modules/.vite

# 2. 检查 vite.config.ts
# base: process.env.NODE_ENV === 'production' ? './' : '/'

# 3. 重启开发服务器
pnpm dev
```

已修复 ✅ - 已优化 base 配置

### 问题 3：深色模式不生效

**症状：** 切换系统主题后，页面颜色不变

**检查：**

```javascript
// 检查系统主题偏好
window.matchMedia("(prefers-color-scheme: dark)").matches;
// true = 深色模式, false = 浅色模式
```

**修复：**
确保在 `@media (prefers-color-scheme: dark)` 中也定义了 `#root` 的样式。

已修复 ✅ - 已添加深色模式下的 #root 样式

### 问题 4：CSS 变量未定义

**症状：** 颜色都变成默认值或透明

**检查：**

```javascript
// 查看 :root 上的 CSS 变量
getComputedStyle(document.documentElement).getPropertyValue("--bg");
```

**修复：**
确保 CSS 变量定义在 `:root` 选择器上，并且在需要的地方使用。

## 📊 预期结果对比

### 开发环境（独立运行）

访问：http://localhost:8082

- ✅ 背景色：白色（浅色）或深灰色（深色）
- ✅ 图片：正常显示三个 logo
- ✅ 字体颜色：紫灰色 (#6b6375)
- ✅ 无控制台错误

### 开发环境（qiankun 中）

访问：http://localhost:8080/son02-react-ts

- ✅ 背景色：与独立运行一致
- ✅ 图片：正常显示
- ✅ 样式：与独立运行基本一致
- ⚠️ 可能有轻微的样式差异（由于样式隔离）

### 生产环境

构建后部署

- ✅ 所有资源正确加载
- ✅ 样式完全正常
- ✅ 性能最优

## 🔧 调试命令

### 清除所有缓存

```bash
# Windows
restart-all.bat

# Mac/Linux
bash restart-all.sh
```

### 检查文件结构

```bash
# 确保 assets 目录存在
ls src/assets/
# 应该看到: hero.png, react.svg, vite.svg
```

### 验证 Vite 配置

```bash
# 查看当前配置
cat vite.config.ts
```

## 📝 检查清单

完成以下检查，确保所有问题都已解决：

- [ ] 背景颜色正常显示
- [ ] 所有图片正确加载
- [ ] 没有 404 错误
- [ ] 没有控制台错误
- [ ] 深色/浅色主题切换正常
- [ ] 在 qiankun 中和独立运行时表现一致
- [ ] 生产构建后正常

## 💡 提示

如果按照以上步骤仍然有问题：

1. **截图保存**：截取控制台的错误信息和 Network 标签的请求
2. **检查版本**：确认 qiankun 和 vite-plugin-qiankun 的版本
3. **最小化复现**：创建一个最简单的测试页面，逐步添加功能
4. **查阅文档**：参考 STYLE_AND_ASSETS_FIX.md 获取更多细节

## 🎯 下一步

修复完成后：

1. 测试所有功能是否正常
2. 构建生产版本并测试
3. 记录遇到的问题和解决方案
4. 更新项目文档
