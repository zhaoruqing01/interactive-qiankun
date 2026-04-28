// request.ts
import { message } from "antd";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";

/**
 * 获取 baseURL
 * 优先级：sessionStorage (qiankun 传递) > 环境变量 > 默认值
 */
const getBaseURL = (): string => {
  // 1. 尝试从 sessionStorage 获取（由主应用 qiankun 传递）
  const sessionBaseURL =
    sessionStorage.getItem("BASE_URL") ||
    sessionStorage.getItem("VITE_BASE_URL");
  if (sessionBaseURL) {
    return sessionBaseURL;
  }

  // 2. 使用环境变量
  const envBaseURL = import.meta.env.VITE_BASE_URL;
  if (envBaseURL) {
    return envBaseURL;
  }

  // 3. 默认值
  return "http://localhost:3007";
};

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 请求超时时间 10s
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 动态更新 baseURL，确保使用最新的配置
    config.baseURL = getBaseURL();

    // 添加 token（如果存在）
    const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
    if (userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  },
);

// 响应数据类型定义
export interface ResponseData<T = unknown> {
  code?: number;
  status?: number;
  msg: string;
  data: T;
}

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data as ResponseData;

    // 根据后端返回的状态码处理
    // 假设后端返回格式为 { code: 200, msg: 'success', data: {...} }
    if (res.code === 200 || res.status === 200) {
      return res.data; // 直接返回数据部分
    }

    // 业务错误处理
    message.error(res.msg || "请求失败");
    throw new Error(res.msg || "请求失败");
  },
  (error) => {
    const axiosError = error as AxiosError<ResponseData>;

    // HTTP 状态码错误处理
    if (axiosError.response) {
      const { status, data } = axiosError.response;

      switch (status) {
        case 401:
          message.error("登录过期，请重新登录");
          // 清除用户信息
          localStorage.removeItem("user");
          // 跳转到登录页（如果需要）
          // window.location.href = "/login";
          break;
        case 403:
          message.error("拒绝访问");
          break;
        case 404:
          message.error("请求资源不存在");
          break;
        case 500:
          message.error("服务器错误");
          break;
        default:
          message.error(data?.msg || `请求失败: ${status}`);
      }
    } else if (axiosError.request) {
      // 请求已发出但没有收到响应
      message.error("网络错误，请检查网络连接");
    } else {
      // 其他错误
      message.error(axiosError.message || "请求配置错误");
    }

    throw axiosError;
  },
);

// 导出常用请求方法
export const http = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config);
  },

  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.post(url, data, config);
  },

  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.put(url, data, config);
  },

  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config);
  },

  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return request.patch(url, data, config);
  },
};

// 导出 axios 实例（用于需要自定义配置的场景）
export default request;
