import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getMenuRoutes, routes } from "../../router/routes";

const SiderWrapper = styled.aside`
  width: 250px;
  height: 100%;
  background-color: #001529;
  overflow-y: auto;
  color: #ffffff;
`;

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MenuItem = styled.li<{ $active: boolean }>`
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: ${(props) => (props.$active ? "#1890ff" : "transparent")};
  color: ${(props) =>
    props.$active ? "#ffffff" : "rgba(255, 255, 255, 0.65)"};

  &:hover {
    color: #ffffff;
    background-color: ${(props) =>
      props.$active ? "#1890ff" : "rgba(255, 255, 255, 0.08)"};
  }
`;

const Sider = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRoutes = getMenuRoutes(routes);

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <SiderWrapper>
      <div
        style={{ padding: "16px 24px", fontSize: "18px", fontWeight: "bold" }}
      >
        Logo
      </div>
      <MenuList>
        {menuRoutes.map((route) => (
          <MenuItem
            key={route.path}
            $active={location.pathname === route.path}
            onClick={() => handleMenuClick(route.path)}
          >
            {route.name}
          </MenuItem>
        ))}
      </MenuList>
    </SiderWrapper>
  );
};

export default Sider;
