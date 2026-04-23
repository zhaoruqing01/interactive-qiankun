<template>
  <div class="chat-container">
    <h1>全体公共聊天室</h1>

    <div class="message-list" ref="messageListRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message-item', msg.isSelf ? 'self' : 'other']"
      >
        <div class="message-content">
          <span class="sender" v-if="!msg.isSelf">{{ msg.sender }}</span>
          <!-- 加了 marked.parse阻塞了浏览器主线程，SSE 卡住、不推送、最后一次性爆发 -->
          <!-- 但是阻塞的是浏览器主线程而不是网络线程,其实数据早就到浏览器了,只是解析了html,导致了阻塞,无法执行onMessage -->
          <!-- 执行干完所有的同步,微任务,执行完页面渲染,才会执行sse渲染 -->
          <!-- marked.parse是（CPU 密集同步任务） -->
          <p
            class="text"
            :class="{ streaming: msg.isStreaming }"
            v-html="msg.user_id === -1 ? marked.parse(msg.text) : msg.text"
          ></p>
        </div>
      </div>
    </div>

    <div v-if="showRobotList" class="robot-list-popup">
      <div
        v-for="robot in robotList"
        :key="robot.id"
        class="robot-item"
        @click="selectRobot(robot)"
      >
        {{ robot.name }}
      </div>
    </div>

    <div class="input-area">
      <div class="input-wrapper">
        <QuillEditor
          ref="quillRef"
          :options="editorOptions"
          @textChange="handleTextChange"
          class="my-quill-editor"
        />
      </div>
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getGroupMsgAPI } from "@/api/group";
import { useUserStore } from "@/store/user";
import getSocket from "@/utils/socket";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { marked } from "marked";
import { nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import "./index.scss";

// 配置 marked 解析 + 代码高亮 (适配 v18)
const renderer = new marked.Renderer();
renderer.code = ({ text, lang }) => {
  const validLanguage = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(text, { language: validLanguage }).value;
  return `<pre><code class="hljs ${validLanguage}">${highlighted}</code></pre>`;
};

marked.setOptions({
  renderer,
  gfm: true, // 支持表格、删除线等
});
const userStore = useUserStore();
const socket = getSocket();

interface Message {
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
  isStreaming: boolean;
  user_id: number;
  msgId?: string;
}

const messages = ref<Message[]>([
  {
    sender: "系统",
    text: "欢迎进入公共聊天室！",
    time: new Date().toLocaleTimeString(),
    isSelf: false,
    isStreaming: false,
    user_id: -1,
  },
]);

const messageListRef = ref<HTMLElement | null>(null);

let currentSSE = ref<EventSource | null>(null);
// msgId
let msgId = ref();

// ==============================
// Quill 编辑器相关配置
// ==============================
const quillRef = ref<any>(null);
const editorOptions = {
  theme: "snow",
  modules: {
    toolbar: false, // 隐藏顶部的工具栏
    keyboard: {
      bindings: {
        // 拦截回车键发送消息，Shift+Enter 则换行
        enter: {
          key: 13,
          shiftKey: false,
          handler: () => {
            sendMessage();
            return false;
          },
        },
      },
    },
  },
  placeholder: "请输入消息",
};

// 机器人相关状态
const showRobotList = ref(false);
const robotList = [{ id: 1, name: "小艺" }];
const pendingAIPrompt = ref("");

// 监听 Quill 的输入变化
const handleTextChange = () => {
  if (!quillRef.value) return;
  const quill = quillRef.value.getQuill();
  const cursor = quill.getSelection()?.index;

  if (cursor) {
    const text = quill.getText();
    // 检查光标前一个字符是否是 @
    if (text.charAt(cursor - 1) === "@") {
      showRobotList.value = true;
    } else {
      // 如果全文都没有 @，则关闭弹窗
      if (!text.includes("@")) showRobotList.value = false;
    }
  }
};

const selectRobot = (robot: any) => {
  if (!quillRef.value) return;
  const quill = quillRef.value.getQuill();
  let cursorPosition = quill.getSelection()?.index;

  if (cursorPosition === undefined || cursorPosition === null) {
    cursorPosition = quill.getLength() - 1;
  }

  // 找到光标前最近的一个 @ 进行替换
  const textBeforeCursor = quill.getText(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

  const mentionText = `@${robot.name}`;

  if (lastAtIndex !== -1) {
    quill.deleteText(lastAtIndex, cursorPosition - lastAtIndex);

    // 1. 插入带颜色的艾特标签
    quill.insertText(lastAtIndex, mentionText, {
      color: "#67c23a",
      bold: true,
    });

    // 核心修复：2. 强制插入一个去除了所有格式的普通空格，截断颜色继承
    quill.insertText(lastAtIndex + mentionText.length, " ", {
      color: false, // false 表示清除该格式
      bold: false,
    });

    // 3. 将光标移到这个普通空格之后
    quill.setSelection(lastAtIndex + mentionText.length + 1);
  } else {
    // 兜底插入
    quill.insertText(cursorPosition, mentionText, {
      color: "#67c23a",
      bold: true,
    });
    quill.insertText(cursorPosition + mentionText.length, " ", {
      color: false,
      bold: false,
    });
    quill.setSelection(cursorPosition + mentionText.length + 1);
  }

  showRobotList.value = false;
  // 重新聚焦
  nextTick(() => {
    quill.focus();
  });
};

const receivePublicMsg = (msg: any) => {
  const isSelf = msg.userId === userStore.userInfo.userId;

  if (msg.userId === -1) {
    if (msgId.value === msg.msgId) {
      return;
    }
    if (!msg.content || msg.content.trim() === "") {
      return;
    }
    const lastMessage = messages.value[messages.value.length - 1];

    if (lastMessage && lastMessage.msgId === msg.msgId) {
      // 同一条消息：拼接内容
      lastMessage.text += msg.content;
    } else {
      // 新消息：push
      messages.value.push({
        sender: msg.username,
        text: msg.content,
        time: new Date(msg.sendTime).toLocaleTimeString(),
        isSelf: false, // AI 永远不是自己
        isStreaming: false,
        user_id: msg.user_id,
        msgId: msg.msgId,
      });
    }

    scrollToBottom();
    return; // 关键：处理完直接返回
  }
  messages.value.push({
    sender: msg.username,
    text: msg.content,
    time: new Date(msg.sendTime).toLocaleTimeString(),
    isSelf,
    isStreaming: false,
    user_id: msg.user_id,
    msgId: msg.msgId || Date.now().toString(),
  });

  scrollToBottom();

  // 自己发消息 → 触发AI回复
  if (isSelf && pendingAIPrompt.value) {
    startRobotStream(pendingAIPrompt.value);
    pendingAIPrompt.value = "";
  }
};

onMounted(() => {
  socket.on("receivePublicMsg", receivePublicMsg);
  getPublicChatRecord().then(() => {
    scrollToBottom();
  });
});

onUnmounted(() => {
  socket.off("receivePublicMsg", receivePublicMsg);
});

const getPublicChatRecord = async () => {
  const res = await getGroupMsgAPI(0);
  if (res.code === 200) {
    messages.value = res.data.map((item: any) => {
      return {
        sender: item.username,
        text: item.content,
        time: new Date(item.send_time).toLocaleTimeString(),
        isSelf: item.user_id === userStore.userInfo.userId,
        isStreaming: false,
        user_id: item.user_id,
      };
    });
  }
};

const sendMessage = () => {
  if (!quillRef.value) return;
  const quill = quillRef.value.getQuill();

  // 获取纯文本（发送给后端的仍然是纯文本，很安全）
  const text = quill.getText().trim();
  if (!text) return;

  const msgData = {
    userId: userStore.userInfo.userId,
    username: userStore.userInfo.username || "匿名用户",
    content: text,
  };

  if (text.includes("@小艺")) {
    const cleanPrompt = text.replace(/@小艺\s*/g, "").trim();
    pendingAIPrompt.value = cleanPrompt;
  }

  socket.emit("sendPublicMsg", msgData);

  // 清空编辑器
  quill.setText("");
  showRobotList.value = false;
};

const startRobotStream = (prompt: string) => {
  if (currentSSE.value) {
    currentSSE.value.close();
    currentSSE.value = null;
  }

  const aiMsg = reactive({
    sender: "小艺",
    text: "",
    time: new Date().toLocaleTimeString(),
    isSelf: false,
    isStreaming: true,
    user_id: -1,
    msgId: undefined,
  });
  messages.value.push(aiMsg);
  scrollToBottom();

  const sse = new EventSource(
    `${import.meta.env.VITE_BASE_URL}/ai/robotChat?prompt=${encodeURIComponent(
      prompt,
    )}`,
  );
  currentSSE.value = sse;
  // 后端每推送一次流式数据,自动触发该回调函数并执行该回调函数中的所有操作
  // SSE 收到字 → 宏任务(onmessage) → 执行同步代码：msg.text += 字
  // → Vue 触发渲染 → 执行 **同步的 marked.parse(全文)**
  // → 主线程被同步任务占死
  // 同步的 marked.parse是一个耗时任务,导致主线程被阻塞,SSE的消息都堆积的在门口不能执行宏任务onMessage,导致页面卡死
  sse.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.done) {
        aiMsg.isStreaming = false;
        msgId.value = data.msgId; // 存储当前sse的msgId
        sse.close();
        currentSSE.value = null;
        return;
      }

      aiMsg.text += data.content || "";

      scrollToBottom();
    } catch (e) {
      console.log("消息解析异常", e);
    }
  };

  sse.onerror = (err) => {
    console.log("SSE 错误", err);
    aiMsg.isStreaming = false;
    sse.close();
    currentSSE.value = null;
  };
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};
</script>
