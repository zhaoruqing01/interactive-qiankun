import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import {
  qiankunWindow,
  renderWithQiankun,
} from "vite-plugin-qiankun/dist/helper";
import { createApp, type App as AppInstance } from "vue";
import App from "./App.vue";
import router, { routes } from "./router";

let app: AppInstance | null = null;

function render(props: any = {}) {
  const { container, BASE_URL } = props;
  app = createApp(App);

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.use(pinia);
  app.use(ElementPlus);
  app.use(router);

  // 如果主应用传递了 BASE_URL，则使用它
  if (BASE_URL) {
    console.log("从主应用接收到的 BASE_URL:", BASE_URL);
    // 将 BASE_URL 存储到 sessionStorage 或全局变量中
    sessionStorage.setItem("VITE_BASE_URL", BASE_URL);
  }

  const mountElement = container ? container.querySelector("#app") : "#app";
  app.mount(mountElement);

  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 1. 接收主应用参数和方法
    app.config.globalProperties.$microProps = props;
    const { onGlobalStateChange, setGlobalState } = props;
    if (onGlobalStateChange) {
      app.config.globalProperties.$onGlobalStateChange = onGlobalStateChange;
    }
    if (setGlobalState) {
      app.config.globalProperties.$setGlobalState = setGlobalState;
    }

    // 2. 为 body 添加标识类，用于 CSS 隔离
    document.body.classList.add("qiankun-micro-app");
  }
}

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
} else {
  renderWithQiankun({
    bootstrap: async () => {
      console.log("子应用 bootstrap");
    },
    mount: async (props: any) => {
      console.log("子应用 mount", props);
      // 将子应用路由暴露出去
      (qiankunWindow as any).son01Vue3Routes = routes;
      render(props);
    },
    unmount: async () => {
      console.log("子应用 unmount");
      if (app) {
        app.unmount();
        app = null;
      }
      // 移除 body 标识类
      document.body.classList.remove("qiankun-micro-app");
    },
    update: async (state) => {
      console.log("子应用 update", state);
    },
  });
}
