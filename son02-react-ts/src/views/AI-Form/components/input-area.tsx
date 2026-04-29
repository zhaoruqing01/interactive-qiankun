import { getBaseURL } from "@/utils/request";
import { OpenAIOutlined, RollbackOutlined } from "@ant-design/icons";
import { Button, message, Space } from "antd";
import TextArea, { type TextAreaRef } from "antd/es/input/TextArea";
import { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";

const InputAreaWrapper = styled.div`
  position: relative;
  background-color: #f5f5f5;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  .ant-input {
    height: 100%;
  }
  .oper-btn {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 999;
  }
`;
// ai表单的文本输入区域组件
const InputArea = () => {
  const [promptValue, setPromptValue] = useState("");
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null); // 新增：保存原始文本
  const [isLoading, setIsLoading] = useState(false);
  const textAreaRef = useRef<TextAreaRef>(null);

  // 清理SSE连接的函数
  const closeSSE = () => {
    setIsLoading(false);
  };

  // 组件卸载时清理SSE连接
  useEffect(() => {
    return () => {
      closeSSE();
    };
  }, []);

  // 恢复原有文本
  const handleRestore = () => {
    if (originalPrompt !== null) {
      setPromptValue(originalPrompt);
      setOriginalPrompt(null); // 恢复后清空备份，避免重复恢复
      setIsLoading(false); // 确保加载状态关闭
    }
  };

  // sse
  const handleAiSSE = async () => {
    if (!promptValue) {
      return message.warning("请输入文本");
    }

    // 获取选中范围
    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textArea) return;

    const start = textArea.selectionStart ?? 0;
    const end = textArea.selectionEnd ?? 0;

    // 如果有选中，则只处理选中的部分，否则处理全部
    const isSelection = start !== end;
    const textToProcess = isSelection
      ? promptValue.substring(start, end)
      : promptValue;

    // 记录前缀和后缀，以便精准覆盖
    const prefix = isSelection ? promptValue.substring(0, start) : "";
    const suffix = isSelection ? promptValue.substring(end) : "";

    // 如果已有连接，先关闭
    closeSSE();

    // 新增：在开始新的生成前，保存当前文本作为原始文本（如果还没有备份的话）
    if (originalPrompt === null) {
      setOriginalPrompt(promptValue);
    }

    setIsLoading(true);

    let accumulatedContent = ""; // 用于累加流式内容

    try {
      // 使用 fetch 替代 EventSource 以支持 POST 请求和更好的错误处理
      const response = await fetch(`${getBaseURL()}/ai/aiForm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: textToProcess }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 处理可能的多行 SSE 格式数据 (data: {...}\n\n)
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 保留最后一个不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith("data: ")) {
            const jsonStr = trimmedLine.substring(6);
            if (jsonStr === "[DONE]") {
              closeSSE();
              // 生成完成，可以选择保留或清除 originalPrompt，这里选择保留以便用户手动恢复
              return;
            }
            try {
              const data = JSON.parse(jsonStr);
              if (data.done) {
                closeSSE();
                return;
              }

              // 累加新内容
              if (data.content) {
                accumulatedContent += data.content;
                // 精准覆盖原有选中的位置
                setPromptValue(prefix + accumulatedContent + suffix);
              }
            } catch (e) {
              message.error(e || "AI生成失败");
              console.warn("Failed to parse SSE data:", jsonStr);
            }
          }
        }
      }

      // 确保最后的状态清理
      closeSSE();
    } catch (error) {
      console.error("SSE Error:", error);
      message.error(error instanceof Error ? error.message : "AI生成失败");
      closeSSE();
    }
  };

  return (
    <InputAreaWrapper>
      <div className="oper-btn">
        <Space>
          {/* 新增：恢复按钮 */}
          {originalPrompt !== null && (
            <Button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleRestore}
              icon={<RollbackOutlined />}
              disabled={isLoading} // 加载中禁止恢复，或者允许恢复即视为取消加载
            >
              恢复
            </Button>
          )}
          <Button
            onMouseDown={(e) => e.preventDefault()} // 防止点击按钮导致 textarea 失焦
            onClick={handleAiSSE}
            loading={isLoading}
            disabled={isLoading}
          >
            <OpenAIOutlined />
            {isLoading ? "生成中..." : "AI美化"}
          </Button>
        </Space>
      </div>
      <TextArea
        style={{ resize: "none" }}
        ref={textAreaRef}
        rows={4}
        placeholder="随便说点什么..."
        value={promptValue}
        onChange={(e) => setPromptValue(e.target.value)}
      />
    </InputAreaWrapper>
  );
};
export default InputArea;
