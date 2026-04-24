import request from "@/utils/request";

/**
 * 获取BFF列表
 * @param params
 * @returns
 */
export const getBFFListAPI = (params?: any) => {
  return request.get("/bff/bff", { params });
};
