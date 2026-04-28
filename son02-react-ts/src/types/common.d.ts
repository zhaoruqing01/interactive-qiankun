// 通用类型定义
export interface CommonResponse<T = unknown> {
  code?: number;
  status?: number;
  message?: string;
  msg?: string;
  data: T;
}
