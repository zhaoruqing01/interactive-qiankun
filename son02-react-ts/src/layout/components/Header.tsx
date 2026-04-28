import { useUserStore } from "@/stores";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"; // 引入

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  height: 64px;
  background-color: #ffffff;
`;
const UserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
`;
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-right: 20px;
`;
const LoginOut = styled.div`
  cursor: pointer;
`;

const Header = () => {
  const userStore = useUserStore();
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}").state;
  const navigate = useNavigate();
  // 退出登录
  const handleLogout = () => {
    userStore.reset();
    navigate("/login");
    message.success("退出登录成功！");
  };
  return (
    <HeaderWrapper>
      <UserInfoWrapper>
        <UserInfo>{userInfo.userInfo.username}</UserInfo>
        <LoginOut>
          <Button danger size="small" onClick={handleLogout}>
            退出登录
          </Button>
        </LoginOut>
      </UserInfoWrapper>
    </HeaderWrapper>
  );
};
export default Header;
