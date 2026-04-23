import { io, Socket } from "socket.io-client";

const URL = import.meta.env.VITE_BASE_URL;

// 创建 Socket 实例的工具函数
export const createSocket = (): Socket => {
  return io(URL, {
    path: "/socket.io/",
    transports: ["websocket"],
    secure: window.location.protocol === "https:",
    reconnection: true, // 开启断线重连
    reconnectionAttempts: 10, // 最多重试10次
    reconnectionDelay: 2000, // 初始延迟2秒
    reconnectionDelayMax: 10000, // 最大延迟10秒
    randomizationFactor: 0.3, // 随机增加0~30%延迟
  });
};

// 单例模式，如果整个应用只需要一个连接,只有关闭页签才会触发下线,切换页面不会触发
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = createSocket();

    socket.on("connect", () => {
      console.log("✅ Socket 连接成功:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket 连接失败:", error);
    });
  }
  return socket;
};

// 手动控制重连
getSocket().on("disconnect", (reason) => {
  if (reason === "io server disconnect") {
    // 服务器主动断开，需手动重连
    getSocket().connect();
  }
  // 其他情况（如网络错误）会自动重连
});
export default getSocket;
