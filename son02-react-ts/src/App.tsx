import { Navigate, useRoutes } from "react-router-dom";
import AdminLayout from "./layout";
import Login from "./pages/Login";
import {
  DEFAULT_REDIRECT_PATH,
  generateRouterConfig,
  routes,
} from "./router/routes";

// 路由守卫
// const AuthRoute = ({ children }: { children: React.ReactNode }) => {
//   return isLogin() ? children : <Navigate to="/login" />;
// };

export default function App() {
  // 等价于router-view
  const element = useRoutes([
    // { path: "/login", element: <Login /> },
    {
      path: "/",
      element: (
        // 路由守卫,在渲染字内容之前进行身份验证检查
        // <AuthRoute>
        <AdminLayout />
        // </AuthRoute>
      ),
      children: [
        // 索引路由：访问 / 时重定向到默认路径
        {
          index: true,
          element: <Navigate to={DEFAULT_REDIRECT_PATH} replace />,
        },
        // 从路由配置中动态生成子路由
        ...generateRouterConfig(routes),
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);
  return element;
}
