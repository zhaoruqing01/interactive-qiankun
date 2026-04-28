/**
 * qiankun 全局状态管理工具
 */

import { qiankunWindow } from "vite-plugin-qiankun/dist/helper";

/**
 * 获取 qiankun 全局状态方法
 * @returns 包含 onGlobalStateChange 和 setGlobalState 的对象
 */
export const getQiankunGlobalState = () => {
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    console.warn("当前不在 qiankun 微前端环境中");
    return {
      onGlobalStateChange: undefined,
      setGlobalState: undefined,
    };
  }

  return window.__QIANKUN_GLOBAL_STATE__ || {};
};

/**
 * 监听全局状态变化
 * @param callback 状态变化回调函数
 * @param fireImmediately 是否立即执行一次回调
 */
export const onGlobalStateChange = (
  callback: (state: Record<string, unknown>) => void,
  fireImmediately?: boolean,
) => {
  const { onGlobalStateChange: listener } = getQiankunGlobalState();
  if (listener) {
    listener(callback, fireImmediately);
  } else {
    console.warn("onGlobalStateChange 方法不可用");
  }
};

/**
 * 设置全局状态
 * @param state 要设置的状态对象
 */
export const setGlobalState = (state: Record<string, unknown>) => {
  const { setGlobalState: setter } = getQiankunGlobalState();
  if (setter) {
    setter(state);
  } else {
    console.warn("setGlobalState 方法不可用");
  }
};

/**
 * 获取 BASE_URL
 * @returns 当前的 API 基地址
 */
export const getBaseUrl = (): string => {
  return sessionStorage.getItem("VITE_BASE_URL") || "http://localhost:3007";
};

/**
 * 设置 BASE_URL
 * @param url 新的 API 基地址
 */
export const setBaseUrl = (url: string) => {
  sessionStorage.setItem("VITE_BASE_URL", url);
  // 同时更新全局状态
  setGlobalState({ BASE_URL: url });
};
