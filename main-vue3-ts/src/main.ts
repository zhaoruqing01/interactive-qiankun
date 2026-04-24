// src/main.js
import { initGlobalState, registerMicroApps, start } from "qiankun";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// 4. 全局错误处理（qiankun 官方推荐方式）
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { addGlobalUncaughtErrorHandler } from "qiankun";
// 引入 Element Plus 弹出层组件样式（解决 qiankun 样式隔离问题）
import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/message-box/style/css";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/notification/style/css";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router).mount("#app");
console.log(import.meta.env, "import.meta.env.VITE_BASE_URL");

// 1. 初始化全局状态（应用通信核心）
const globalState = {
  userInfo: { name: "qiankun-user", token: "xxx" },
  theme: "light",
};

const actions = initGlobalState(globalState);
// 暴露给主应用组件（可选，主应用内部可修改全局状态）
app.config.globalProperties.$microActions = actions;

// 存储所有子应用路由（给菜单渲染用）
export const microAppRoutes = [];

// 2. 注册子应用
// 总结就是 当匹配到activeRule时,就请求获取entry资源,渲染到container中
registerMicroApps(
  [
    {
      name: "son01-vue3-ts", // 必须与子应用 package.json name 一致
      entry:
        import.meta.env.MODE === "development"
          ? "//localhost:8081"
          : "/son01-vue3-ts/", // 开发/生产地址
      container: "#micro-app-container", // 子应用挂载容器（需在模板中定义）
      activeRule: "/son01-vue3-ts", // 激活路由（主应用路由匹配时加载）
      props: {
        // 传递给子应用的参数（含通信方法）
        onGlobalStateChange: actions.onGlobalStateChange,
        setGlobalState: actions.setGlobalState,
        mainAppName: "son01-vue3-ts",
        // 传递 API 基地址
        BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:3007",
      },
    },
    {
      name: "son02-react-ts", // Vue2 子应用
      entry:
        import.meta.env.MODE === "development"
          ? "//localhost:8082"
          : "/son02-react-ts/",
      container: "#micro-app-container",
      activeRule: "/son02-react-ts",
      props: {
        ...actions,
        mainAppName: "son02-react-ts",
        // 传递 API 基地址
        BASE_URL: import.meta.env.VITE_BASE_URL || "http://localhost:3007",
      },
    },
  ],
  {
    // 全局生命周期钩子（可选）
    beforeMount: (app) => {
      console.log("子应用开始挂载：", app.name);
    },
    beforeLoad: (app) => console.log("子应用开始加载：", app.name),
    afterMount: (app) => {
      console.log("子应用挂载完成：", app.name);
    },
    afterUnmount: (app) => console.log("子应用卸载完成：", app.name),
  },
);

// 3. 启动 qiankun（关键：需在 Vue 实例挂载后启动，避免 DOM 未就绪）
start({
  sandbox: {
    // experimentalStyleIsolation: true, // 实验性样式隔离可能会导致一些 padding 丢失或高度问题
    // 如果样式干扰严重，建议使用 strictStyleIsolation: true (Shadow DOM)，但要注意 Element Plus 的一些弹出层可能需要适配
    strictStyleIsolation: false,
    experimentalStyleIsolation: true,
  },
});

addGlobalUncaughtErrorHandler((err) => {
  console.error("qiankun 运行错误：", err);
  // 可添加错误弹窗提示
});
