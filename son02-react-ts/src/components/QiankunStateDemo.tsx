import { useEffect, useState } from "react";
import {
  getBaseUrl,
  onGlobalStateChange,
  setGlobalState,
} from "../utils/qiankun";

/**
 * qiankun 全局状态演示组件
 * 展示如何在 React 组件中使用全局状态管理
 */
const QiankunStateDemo = () => {
  const [globalState, setGlobalStateLocal] = useState<Record<string, unknown>>(
    {},
  );
  const [baseUrl, setBaseUrlLocal] = useState<string>(getBaseUrl());
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    // 订阅全局状态变化
    onGlobalStateChange((state) => {
      console.log("🔄 全局状态已更新:", state);
      setGlobalStateLocal({ ...state });

      // 如果 BASE_URL 变化，更新本地状态
      if (state.BASE_URL) {
        setBaseUrlLocal(state.BASE_URL as string);
      }
    }, true); // true 表示立即执行一次，获取初始状态
  }, []);

  // 更新单个状态字段
  const handleUpdateState = () => {
    if (newKey && newValue) {
      setGlobalState({ [newKey]: newValue });
      setNewKey("");
      setNewValue("");
    }
  };

  // 更新 BASE_URL
  const handleUpdateBaseUrl = () => {
    const newUrl = prompt("请输入新的 BASE_URL:", baseUrl);
    if (newUrl) {
      setGlobalState({ BASE_URL: newUrl });
    }
  };

  // 设置用户信息示例
  const handleSetUserInfo = () => {
    setGlobalState({
      userInfo: {
        name: "张三",
        id: "001",
        role: "admin",
      },
    });
  };

  // 设置主题示例
  const handleToggleTheme = () => {
    const currentTheme = globalState.theme === "dark" ? "light" : "dark";
    setGlobalState({ theme: currentTheme });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🌍 qiankun 全局状态演示</h1>

      {/* 当前状态显示 */}
      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h2>📊 当前全局状态</h2>
        <pre
          style={{
            background: "#fff",
            padding: "10px",
            borderRadius: "4px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(globalState, null, 2)}
        </pre>
        <p>
          <strong>BASE_URL:</strong> <code>{baseUrl}</code>
        </p>
      </section>

      {/* BASE_URL 操作 */}
      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>🔗 BASE_URL 操作</h2>
        <button onClick={handleUpdateBaseUrl} style={buttonStyle}>
          修改 BASE_URL
        </button>
      </section>

      {/* 添加自定义状态 */}
      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>➕ 添加自定义状态</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="键名 (key)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="值 (value)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleUpdateState} style={buttonStyle}>
            添加/更新
          </button>
        </div>
      </section>

      {/* 快捷操作 */}
      <section
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>⚡ 快捷操作</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={handleSetUserInfo} style={buttonStyle}>
            👤 设置用户信息
          </button>
          <button onClick={handleToggleTheme} style={buttonStyle}>
            🎨 切换主题 ({(globalState.theme as string) || "light"})
          </button>
        </div>
      </section>

      {/* 使用说明 */}
      <section
        style={{ padding: "15px", background: "#e3f2fd", borderRadius: "8px" }}
      >
        <h2>📖 使用说明</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>所有状态变更都会同步到主应用和其他子应用</li>
          <li>
            可以在任意 React 组件中使用 <code>onGlobalStateChange</code>{" "}
            监听状态
          </li>
          <li>
            使用 <code>setGlobalState</code> 修改全局状态
          </li>
          <li>查看控制台日志了解状态变化详情</li>
        </ul>
      </section>
    </div>
  );
};

// 样式
const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: "14px",
  cursor: "pointer",
  background: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  transition: "background 0.3s",
};

const inputStyle: React.CSSProperties = {
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  flex: "1",
  minWidth: "150px",
};

export default QiankunStateDemo;
