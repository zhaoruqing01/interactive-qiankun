import { getUserInfoAPI, loginAPI, registerAPI } from "@/api/user";
import { useUserStore } from "@/stores";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
`;
const LoginMain = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const ButtonWrapepr = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
`;

const Login = () => {
  const userStore = useUserStore();
  type LoginProps = {
    username: string;
    password: string;
  };
  const [username, setUsername] = useState<LoginProps["username"]>("");
  const [password, setPassword] = useState<LoginProps["password"]>("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await loginAPI({ username, password });

    userStore.setToken(res.token);
    if (res.status === 0) {
      const userInfo = await getUserInfoAPI();
      if (userInfo.status === 0) {
        userStore.setUserInfo(userInfo.data);
        message.success("Login successful!");
        navigate("/home");
      } else {
        message.error(userInfo.message || "Login failed!");
      }
    } else {
      message.error(res.message || "Login failed!");
    }
  };

  const register = async () => {
    await registerAPI({ username, password });
    message.success("Register successful!");
    navigate("/home");
  };
  return (
    <LoginWrapper>
      <h1>React login</h1>
      <LoginMain>
        <Form>
          <Form.Item label="Username">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
        </Form>
        <ButtonWrapepr>
          <Button type="primary" onClick={handleLogin}>
            Login
          </Button>
          <Button onClick={register}>Register</Button>
        </ButtonWrapepr>
      </LoginMain>
    </LoginWrapper>
  );
};
export default Login;
