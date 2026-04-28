// 布局
import { Outlet } from "react-router-dom";
import styled from "styled-components"; // 引入 styled-components
import Header from "./components/Header";
import Sider from "./components/Sider";

const AdminLayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
  background-color: #ffffff;
`;

const AdminLayout = () => {
  return (
    <AdminLayoutWrapper>
      <Header />

      <MainContent>
        <Sider />
        <Outlet />
      </MainContent>
    </AdminLayoutWrapper>
  );
};
export default AdminLayout;
