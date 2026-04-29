import { styled } from "styled-components";
import InputArea from "./components/input-area";

// 添加一个外层容器样式，确保占据完整高度
const AIFormContainer = styled.div`
  width: 100%;
  height: 100%;
`;
AIFormContainer.displayName = "AIFormContainer";
const AIFormWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 16px;

  .left {
    width: 50%;
    height: 100%;
    border: 2px solid #000;
    border-radius: 4px;
  }
  .right {
    width: 50%;
    height: 100%;
    border: 2px solid #000;
    border-radius: 4px;
  }
`;
AIFormWrapper.displayName = "AIFormWrapper";

const AIForm = () => {
  return (
    <AIFormContainer data-component="AIFormContainer">
      <AIFormWrapper data-component="AIFormWrapper">
        <div className="left">
          <InputArea />
        </div>

        <div className="right">Right</div>
      </AIFormWrapper>
    </AIFormContainer>
  );
};
export default AIForm;
