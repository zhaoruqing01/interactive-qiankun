/**
 * qiankun 全局状态类型定义
 */

export interface QiankunGlobalState {
  onGlobalStateChange?: (
    callback: (state: Record<string, unknown>) => void,
    fireImmediately?: boolean,
  ) => void;
  setGlobalState?: (state: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    __QIANKUN_GLOBAL_STATE__?: QiankunGlobalState;
  }
}
