import request from "@/utils/request";

/**
 * 登录
 * @param params
 * @returns
 */
export const loginAPI = (params: any) => {
  return request.post("/user/login", params);
};

/**
 * 注册
 * @param params
 * @returns
 */
export const registerAPI = (params: any) => {
  return request.post("/user/reguser", params);
};

/**
 * 获取用户信息
 * @param
 * @returns
 */
export const getUserInfoAPI = () => {
  return request.get("/my/userinfo");
};
