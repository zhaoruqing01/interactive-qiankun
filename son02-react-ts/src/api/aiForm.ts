import request from "@/utils/request";

/**
 * AI表单文本优化
 */
export const getAIFormTextOptimizationAPI = () => {
  return request.get("/ai/aiForm/textOptimization");
};
