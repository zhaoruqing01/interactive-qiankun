import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

const app = express();
const PORT = 8080;

// 配置 CORS
app.use(cors());
// 解析 JSON 请求体
app.use(express.json());

// 定义 /api/chat 接口
app.get("/api/chat", async (req, res) => {
  try {
    const { message } = req.query;

    console.log("Received message:", message);

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // 设置 SSE 响应头给前端
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // 调用通义千问 API
    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
          // 告诉阿里云我们需要 SSE 流式返回
          "X-DashScope-SSE": "enable",
        },
        body: JSON.stringify({
          model: "qwen-turbo",
          input: {
            messages: [
              {
                role: "user",
                content: message,
              },
            ],
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 1024,
            // 开启流式输出，并且设置增量输出（每次只返回新生成的字，配合前端的 += 逻辑）
            stream: true,
            incremental_output: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = ""; // 这里的 buffer 只用来处理网络截断的半截字符串

    // 在 while 循环内部边收边发！
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Response ended");
        break;
      }

      // 将收到的二进制块解码为字符串并拼接
      buffer += decoder.decode(value, { stream: true });

      // 按换行符分割，处理 SSE 格式 (id: xx \n event: xx \n data: {...})
      const lines = buffer.split("\n");
      // 把最后可能不完整的一行弹出来，留到下一次循环继续拼
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        // 抓取包含有效数据的行
        if (trimmedLine.startsWith("data:")) {
          const dataStr = trimmedLine.substring(5).trim();

          if (dataStr === "" || dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            // 通义千问流式返回的数据格式通常在 data.output.text 里
            if (data.output && data.output.text) {
              // 立刻把这几个字通过 res.write 发给前端
              res.write(
                `data: ${JSON.stringify({ text: data.output.text })}\n\n`,
              );
            }
          } catch (error) {
            console.error("解析流式 JSON 出错（可能被截断）:", dataStr);
            // 忽略这条残缺数据继续读下一条即可
          }
        }
      }
    }

    // 所有流发送完毕，告诉前端关闭加载状态
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error:", error);
    // 发送错误信息给前端
    res.write(
      `data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`,
    );
    res.end();
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
