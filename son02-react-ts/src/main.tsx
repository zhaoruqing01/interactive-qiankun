// 防止 React Refresh 在 qiankun 环境下注入
if (import.meta.env.DEV) {
  // 清除可能存在的 React Refresh 全局变量
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__vite_plugin_react_preamble_installed__ = true;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  qiankunWindow,
  renderWithQiankun,
} from "vite-plugin-qiankun/dist/helper";
import App from "./App.tsx";

let root: ReturnType<typeof createRoot> | null = null;

// render是
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const render = (props: any) => {
  const { container, BASE_URL, onGlobalStateChange, setGlobalState } = props;

  // qiankun 环境下使用传入的 container，否则使用 #root
  const mountElement = container
    ? container // 直接使用 qiankun 传入的容器
    : document.getElementById("root");

  // 初始化BASE_URL
  const initBASE_URL = BASE_URL || sessionStorage.getItem("BASE_URL");
  console.log("React接收父应用传递的BASE_URL", initBASE_URL);
  sessionStorage.setItem("BASE_URL", initBASE_URL);

  if (!mountElement) {
    console.error("未找到挂载元素！");
    return;
  }

  root = createRoot(mountElement as HTMLElement);

  console.log("React 开始渲染应用到容器:", mountElement);

  // 根据 qiankun 环境设置 basename
  const basename = qiankunWindow.__POWERED_BY_QIANKUN__
    ? "/son02-react-ts"
    : "/";
  console.log("React Router basename:", basename);

  root.render(
    <StrictMode>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );

  console.log("React 应用渲染完成");
  // qiankun环境时更新BASE_URL
  if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    // 将全局状态方法挂载到 window 对象，方便在任意组件中使用
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__QIANKUN_GLOBAL_STATE__ = {
      onGlobalStateChange,
      setGlobalState,
    };

    // 监听全局状态变化，动态更新 BASE_URL
    if (onGlobalStateChange) {
      onGlobalStateChange((state: Record<string, unknown>) => {
        if (
          state.BASE_URL &&
          state.BASE_URL !== sessionStorage.getItem("VITE_BASE_URL")
        ) {
          console.log("React 子应用检测到 BASE_URL 变化:", state.BASE_URL);
          sessionStorage.setItem("VITE_BASE_URL", state.BASE_URL as string);
        }
      }, true);
    }

    // 为 body 添加标识类，用于 CSS 隔离
    document.body.classList.add("qiankun-micro-app");
  }
};

// 根据qiankun环境进行不同的渲染
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render({});
} else {
  renderWithQiankun({
    bootstrap: async () => {
      console.log("React 子应用 bootstrap");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mount: async (props: any) => {
      console.log("React 子应用 mount", props);
      render(props);
    },
    unmount: async () => {
      console.log("React 子应用 unmount");
      if (root) {
        root.unmount();
        root = null;
      }
      // 移除 body 标识类
      document.body.classList.remove("qiankun-micro-app");
    },
    update: async (state) => {
      console.log("React 子应用 update", state);
    },
  });
}
