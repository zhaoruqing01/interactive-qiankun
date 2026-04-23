/**
 * 请求工具
 */
import router from "@/router";
import axios from "axios";
import { ElMessage } from "element-plus";

const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token;
    const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
    if (userInfo.token) {
      config.headers.Authorization = userInfo.token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

interface Response<T> {
  code?: number;
  status?: number;
  msg: string;
  data: T;
}

// 响应拦截器
request.interceptors.response.use<any>(
  (response) => {
    const res: Response<any> = response.data;
    if (res.status === 401) {
      router.push("/login");
      ElMessage.error("登录过期，请重新登录");
      return Promise.reject(new Error("登录过期"));
    }
    // 如果业务状态码不为 200 并且不是 401，通常也可能代表业务错误
    // 如果你需要所有非 200 的都走到 catch，可以放开这里的注释
    // if (res.code !== 200) {
    //   return Promise.reject(res);
    // }
    return res;
  },
  (error) => {
    // 处理 HTTP 状态码不为 2xx 的情况 (如 400, 500 等)
    // 这样 400 错误的 response.data 就可以作为 reject 的内容传递给 catch
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  },
);
export default request;
