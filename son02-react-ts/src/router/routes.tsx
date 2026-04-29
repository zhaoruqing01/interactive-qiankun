import AIForm from "@/views/AI-Form";
import AIReport from "@/views/AI-Report";
import Home from "@/views/Home";
import type { ReactNode } from "react";

/**
 * 路由配置接口
 */
export interface RouteConfig {
  path: string;
  name: string;
  icon?: ReactNode;
  element?: ReactNode;
  children?: RouteConfig[];
  hideInMenu?: boolean; // 是否在菜单中隐藏
}

/**
 * 路由配置列表
 * 用于生成侧边栏菜单和路由
 */
export const routes: RouteConfig[] = [
  {
    path: "/home",
    name: "首页",
    element: <Home />,
  },
  {
    path: "/ai-form",
    name: "AI表单",
    element: <AIForm />,
  },
  {
    path: "/ai-report",
    name: "AI报表",
    element: <AIReport />,
  },
];

/**
 * 默认重定向路径（访问 / 时跳转的路径）
 */
export const DEFAULT_REDIRECT_PATH = "/home";

/**
 * 从路由配置中提取菜单项（过滤掉隐藏的路由）
 */
export const getMenuRoutes = (routes: RouteConfig[]): RouteConfig[] => {
  return routes.filter((route) => !route.hideInMenu);
};

/**
 * 将路由配置转换为 React Router 的路由对象
 * @param routes 路由配置数组
 * @returns React Router 路由对象数组
 */
export const generateRouterConfig = (routes: RouteConfig[]) => {
  return routes.map((route) => ({
    path: route.path.substring(1), // 移除开头的 /
    element: route.element,
  }));
};
