import { Navigate, useRoutes } from "react-router-dom";
import AdminLayout from "./layout";
import Home from "./pages/Home";

// 路由守卫
// const AuthRoute = ({ children }: { children: React.ReactNode }) => {
//   return isLogin() ? children : <Navigate to="/login" />;
// };

export default function App() {
  // 等价于router-view
  return useRoutes([
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
        { index: true, element: <Navigate to="/home" /> },
        { path: "home", element: <Home /> },
      ],
    },
  ]);
}
