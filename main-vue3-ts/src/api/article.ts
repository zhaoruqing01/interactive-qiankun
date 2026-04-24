import request from "@/utils/request";

// 获取文章列表
export const getArticlesListAPI = (params?: any) => {
  return request.get("/api/articles", { params });
};

// 创建文章
export const createArticleAPI = (data: any) => {
  return request.post("/api/addArticle", data);
};

// 更新文章
export const updateArticleAPI = (data: any) => {
  return request.post(`/api/updateArticle`, data);
};

// 删除文章
export const deleteArticleAPI = (id: number) => {
  return request.post(`/api/delArticle`, { id });
};
