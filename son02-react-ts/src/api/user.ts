// user相关的api操作

import type {
  GetUserInfoResponse,
  LoginParams,
  LoginResponse,
  RegisterParams,
  RegisterResponse,
} from "@/types/userAPI";
import request from "@/utils/request";

/**
 * 登录
 * @param data
 * @returns
 */
export const loginAPI = (params: LoginParams) => {
  return request.post<LoginResponse>("/user/login", params);
};

/**
 * 注册
 * @param params
 * @returns
 */
export const registerAPI = (params: RegisterParams) => {
  return request.post<RegisterResponse>("/user/reguser", params);
};

/**
 * 获取用户信息
 * @param
 * @returns
 */
export const getUserInfoAPI = () => {
  return request.get<GetUserInfoResponse>("/my/userinfo");
};
