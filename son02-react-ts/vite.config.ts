import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import qiankun from "vite-plugin-qiankun";

// https://vite.dev/config/
export default defineConfig({
  // 开发环境使用绝对路径，生产环境使用相对路径
  base: process.env.NODE_ENV === "production" ? "./" : "/",
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
    // 关键配置：禁用 HMR，避免与 qiankun 冲突
    hmr: false,
  },
  build: {
    outDir: "dist",
  },
});
