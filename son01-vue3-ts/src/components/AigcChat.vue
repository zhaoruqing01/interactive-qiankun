<template>
  <div class="aigc-chat">
    <div class="chat-header">
      <span>AI 助手</span>
      <span class="close-btn" @click="$emit('close')">×</span>
    </div>

    <div class="chat-body" ref="chatBodyRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', `message-${msg.role}`]"
      >
        <div class="avatar">{{ msg.role === "user" ? "我" : "AI" }}</div>
        <div class="content">
          <span>{{ msg.content }}</span>

          <span
            v-if="
              msg.role === 'ai' && isGenerating && index === messages.length - 1
            "
            class="blinking-cursor"
          ></span>
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <el-input
        v-model="inputMessage"
        placeholder="请输入您的问题..."
        @keyup.enter="sendMessage"
        :disabled="isGenerating"
      >
        <template #append>
          <el-button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isGenerating"
          >
            发送
          </el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";

defineEmits(["close"]);

interface Message {
  role: "user" | "ai";
  content: string;
}

const messages = ref<Message[]>([
  { role: "ai", content: "你好！我是 AI 助手，有什么可以帮你的吗？" },
]);
const inputMessage = ref("");
const isGenerating = ref(false);
const chatBodyRef = ref<HTMLElement | null>(null);

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
};

const sendMessage = async () => {
  const text = inputMessage.value.trim();
  if (!text || isGenerating.value) return;

  // 添加用户消息
  messages.value.push({ role: "user", content: text });
  inputMessage.value = "";

  // 创建本次对话的 AI 占位消息
  const currentAiMessage = { role: "ai", content: "" } as Message;
  messages.value.push(currentAiMessage);

  isGenerating.value = true;
  scrollToBottom();

  try {
    const response = await fetch(
      `http://localhost:8080/api/chat?message=${encodeURIComponent(text)}`,
      {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    if (!reader) throw new Error("Failed to get reader from response");

    // 🔥 关键修复：增加一个 buffer 来存储不完整的字符串
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 每次读取到的 chunk 拼接到 buffer 中
      buffer += decoder.decode(value, { stream: true });

      // 按换行符分割
      const lines = buffer.split("\n");

      // 🔥 关键修复：把最后一行（可能是不完整的 JSON）弹出，留到下一次循环拼接
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("data: ")) {
          const dataStr = trimmedLine.substring(6).trim();

          // 处理流结束的特殊标记（很多后端会发 data: [DONE]）
          if (dataStr === "[DONE]") {
            isGenerating.value = false;
            scrollToBottom();
            return;
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);

              if (data.error) {
                currentAiMessage.content = data.error;
                isGenerating.value = false;
                return;
              } else if (data.done) {
                isGenerating.value = false;
                scrollToBottom();
                return;
              } else if (data.text) {
                // 成功解析，拼接到前端并触发打字机效果
                currentAiMessage.content += data.text;
                requestAnimationFrame(() => scrollToBottom());
              }
            } catch (error) {
              // 如果遇到极端的 JSON 截断，打印出来方便调试
              console.warn("JSON Parse Error on chunk:", dataStr);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Chat error:", error);
    currentAiMessage.content = "抱歉，服务出现异常，请稍后再试。";
  } finally {
    isGenerating.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
.aigc-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #fff;
}

.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  background: #f8f9fa;
}

.close-btn {
  cursor: pointer;
  font-size: 20px;
  color: #999;
  line-height: 1;
  padding: 0 4px;
}

.close-btn:hover {
  color: #333;
}

.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f5f7fa;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 85%;
}

.message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-ai {
  align-self: flex-start;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.message-user .avatar {
  background: #67c23a;
}

.content {
  padding: 10px 14px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  word-break: break-word;
  line-height: 1.5;
  font-size: 14px;
  /* 确保换行符能够正常显示 */
  white-space: pre-wrap;
}

.message-user .content {
  background: #e1f3d8;
}

.chat-footer {
  padding: 12px;
  border-top: 1px solid #eee;
  background: #fff;
}

/* 闪烁光标样式 */
.blinking-cursor {
  display: inline-block;
  width: 6px;
  height: 1em;
  background-color: #333;
  vertical-align: text-bottom;
  margin-left: 2px;
  animation: cursor-blink 1s step-end infinite;
}

/* 光标闪烁动画关键帧 */
@keyframes cursor-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
