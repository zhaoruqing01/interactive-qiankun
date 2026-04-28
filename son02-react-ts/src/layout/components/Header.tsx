import styled from "styled-components"; // 引入
const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
  background-color: #pink;
`;

const Header = () => {
  return <HeaderWrapper>Header</HeaderWrapper>;
};
export default Header;
