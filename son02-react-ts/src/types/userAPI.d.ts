// 用户登录API相关的类型定义
import { CommonResponse } from "./common";

// 登录传参
export interface LoginParams {
  username: string;
  password: string;
}

// 注册传参
export interface RegisterParams {
  username: string;
  password: string;
}

// 登录返回结果
export interface LoginResponse extends CommonResponse {
  message?: string;
  status?: number;
  token: string;
}
// 注册返回结果
export interface RegisterResponse extends CommonResponse {
  message?: string;
  status?: number;
  token: string;
}
// 获取用户信息返回结果
export interface GetUserInfoResponse extends CommonResponse {
  email: string | null;
  nickname: string | null;
  userId: number;
  user_pic: string | null;
  username: string;
}
