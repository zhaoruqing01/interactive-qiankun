// 布局
import { Outlet } from "react-router-dom";
import styled from "styled-components"; // 引入 styled-components
import { isQiankunMicroFrontend } from "../utils/qiankun";
import Header from "./components/Header";
import Sider from "./components/Sider";

const AdminLayoutWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f0f2f5;
  overflow: hidden;
  box-sizing: border-box;
`;

const LayoutBody = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  box-sizing: border-box;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f0f2f5;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 15px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 15px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

const AdminLayout = () => {
  const isQiankun = isQiankunMicroFrontend();

  return (
    <AdminLayoutWrapper>
      <Sider />
      <LayoutBody>
        <MainContent>
          {!isQiankun && <Header />}
          <ContentWrapper>
            <Content>
              <Outlet />
            </Content>
          </ContentWrapper>
        </MainContent>
      </LayoutBody>
    </AdminLayoutWrapper>
  );
};
export default AdminLayout;
