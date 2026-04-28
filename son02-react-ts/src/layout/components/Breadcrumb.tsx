import type { RouteConfig } from "@/router/routes";
import { routes } from "@/router/routes";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const BreadcrumbWrapper = styled.div``;

/**
 * 根据路径查找路由名称
 */
const findRouteName = (path: string): string => {
  const findInRoutes = (
    routesList: RouteConfig[],
    targetPath: string,
  ): string | null => {
    for (const route of routesList) {
      if (route.path === targetPath) {
        return route.name;
      }
      if (route.children) {
        const found = findInRoutes(route.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  return findInRoutes(routes, path) || "未知页面";
};

/**
 * 将路径拆分为面包屑项
 */
const getPathItems = (pathname: string) => {
  const paths = pathname.split("/").filter(Boolean);
  const items = [];

  // 添加首页
  items.push({
    title: (
      <Link to="/home">
        <HomeOutlined /> 首页
      </Link>
    ),
  });

  // 逐级构建路径
  let currentPath = "";
  paths.forEach((path, index) => {
    currentPath += `/${path}`;

    // 跳过首页（已经添加）
    if (currentPath === "/home") return;

    const routeName = findRouteName(currentPath);

    // 如果是最后一级，显示为文本；否则显示为链接
    if (index === paths.length - 1) {
      items.push({
        title: routeName,
      });
    } else {
      items.push({
        title: <Link to={currentPath}>{routeName}</Link>,
      });
    }
  });

  return items;
};

const BreadcrumbNav = () => {
  const location = useLocation();
  const items = getPathItems(location.pathname);

  return (
    <BreadcrumbWrapper>
      <Breadcrumb items={items} />
    </BreadcrumbWrapper>
  );
};

export default BreadcrumbNav;
