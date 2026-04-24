import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import qiankun from "vite-plugin-qiankun"; // 引入qiankun微应用插件

// 微应用名称(必须与主应用注册得到名称一致,作为微应用的唯一标识)
const appName = "son01-vue3-ts";

// https://vite.dev/config/
export default defineConfig({
  /**
   * 1. 动态公共路径配置（乾坤微应用关键配置）
   * 作用：适配微应用"独立运行"和"被主应用嵌入"两种场景的资源路径
   * - 独立运行时：使用环境变量VITE_PUBLIC_PATH（未配置则默认 '/'）
   * - 被主应用嵌入时：乾坤会自动注入 window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ 变量
   *   此时资源路径会基于主应用的路径动态拼接，避免资源404
   */
  base:
    process.env.NODE_ENV === "production"
      ? process.env.VITE_PUBLIC_PATH || "/"
      : "http://localhost:8081/",

  server: {
    // host: true, // 开启局域网访问
    port: 8081, // 🔥 这里配置你想要的本地端口
    origin: "http://localhost:8081", // 解决开发环境下资源路径问题
    open: true, // 自动打开浏览器（可选）
    // 由于vite默认只允许localhost访问，所以需要配置allowedHosts
    allowedHosts: true,
    cors: true,
    /**
     * 跨域请求头配置
     * 进一步细化CORS规则，确保主应用能正常请求微应用资源
     * - Access-Control-Allow-Origin: '*' - 允许所有来源（开发环境宽松配置，生产环境需按需限制）
     * - Access-Control-Allow-Methods: 允许的HTTP请求方法
     * - Access-Control-Allow-Headers: 允许的请求头（如Content-Type、Authorization等）
     */
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "window",
      },
    },
  },
  plugins: [
    // qiankun配置
    qiankun(appName, {
      useDevMode: true, // 必须开启，否则开发环境下会出现 SyntaxError
    }),
    {
      name: "ignore-vite-client",
      transformIndexHtml(html) {
        return html.replace(
          /<script type="module" src="\/@vite\/client"><\/script>/,
          '<script type="module" src="/@vite/client" ignore></script>',
        );
      },
    },
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      // 配置 @ 指向 src 目录
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
});
