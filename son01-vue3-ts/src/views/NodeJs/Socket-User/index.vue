<template>
  <div class="socket-user-container" :class="{ 'is-mobile': isMobile }">
    <!-- 左侧：用户列表 -->
    <div
      class="sidebar"
      v-if="!isMobile || !showChatOnMobile"
      :style="{ pointerEvents: showChatOnMobile ? 'none' : 'auto' }"
    >
      <div class="sidebar-header">
        <h2>在线用户</h2>
        <div class="header-actions">
          <button
            @click="toggleSearch"
            class="btn-search-toggle"
            :class="{ active: isSearchVisible }"
            title="搜索用户"
          >
            🔍
          </button>
        </div>
      </div>

      <transition name="slide-down">
        <div v-if="isSearchVisible" class="search-area">
          <input
            ref="searchInputRef"
            v-model="searchKeyword"
            @keyup.enter="searchUsers"
            placeholder="输入用户名回车搜索..."
            class="search-input"
          />
          <button @click="searchUsers" class="btn-search-exec">Go</button>
        </div>
      </transition>

      <!-- 好友请求列表 -->
      <div v-if="friendRequests.length > 0" class="friend-requests-area">
        <div class="section-title" @click="toggleRequests">
          <span>好友申请 ({{ friendRequests.length }})</span>
          <span class="expand-icon">{{ isRequestsExpanded ? "▲" : "▼" }}</span>
        </div>

        <div v-show="isRequestsExpanded" class="request-list-content">
          <div
            v-for="req in friendRequests"
            :key="req.fromUserId"
            class="request-item"
          >
            <div class="request-info">
              <span class="requester-name">{{ req.fromUsername }}</span>
              <span class="request-msg">申请加为好友</span>
            </div>
            <div class="request-actions">
              <button @click="acceptFriendRequest(req)" class="btn-accept">
                同意
              </button>
              <button @click="rejectFriendRequest(req)" class="btn-reject">
                拒绝
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="searchKeyword && searchResults.length > 0"
        class="search-results"
      >
        <div class="result-title">搜索结果</div>
        <div
          v-for="user in searchResults"
          :key="user.id"
          class="user-item search-result-item"
        >
          <span class="user-name">{{ user.username }}</span>
          <span class="chat-tip" @click="addFriend(user)">添加好友</span>
        </div>
      </div>

      <div v-else class="user-list">
        <div
          v-for="user in users"
          :key="user.fromUserId"
          :class="[
            'user-item',
            {
              active: !isMobile && currentUser?.fromUserId === user.fromUserId,
            },
          ]"
          @click="switchUser(user)"
        >
          <span class="user-name">{{ user.fromUsername }}</span>
          <span v-if="user.isOnline" class="status-dot online"></span>
          <span v-else class="status-dot offline"></span>
        </div>
        <div v-if="users.length === 0" class="empty-tip">暂无用户列表</div>
      </div>
    </div>

    <!-- 右侧：聊天区域 -->
    <div
      class="chat-area"
      v-if="currentUser && (!isMobile || showChatOnMobile)"
      :style="{ pointerEvents: showChatOnMobile ? 'auto' : 'none' }"
    >
      <div class="chat-header">
        <div class="header-left">
          <button v-if="isMobile" class="btn-back" @click="backToList">
            <span class="back-icon">〈</span> 返回
          </button>
          <h3>{{ currentUser.fromUsername }}</h3>
        </div>
        <span class="user-id">ID: {{ currentUser.id }}</span>
      </div>

      <div class="message-list" ref="messageListRef">
        <div
          v-for="(msg, index) in currentMessages"
          :key="index"
          :class="['message-item', msg.isSelf ? 'self' : 'other']"
        >
          <div class="message-content">
            <p class="text">{{ msg.text }}</p>
          </div>
        </div>
        <div v-if="currentMessages.length === 0" class="empty-chat">
          开始新的对话吧~
        </div>
      </div>

      <div class="input-area">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          placeholder="请输入消息..."
          type="text"
        />
        <button @click="sendMessage" @touchstart.prevent="sendMessage">
          发送
        </button>
      </div>
    </div>

    <div class="chat-area empty-state" v-else-if="!isMobile">
      <p>请选择一个用户开始私聊</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getAllUsersAPI,
  getApplyHistoryAPI,
  getFriendChatHistoryAPI,
  getFriendListAPI,
} from "@/api/userFriends";
import { useUserStore } from "@/store/user";
import getSocket from "@/utils/socket";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { Socket } from "socket.io-client";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";

interface User {
  id: number;
  fromUserId: number;
  fromUsername: string;
  apply_msg: string;
  create_time: string;
  status: number;
  isOnline: boolean;
}

interface FriendRequest {
  fromUserId: number;
  fromUsername: string;
  create_time: string;
}

interface Message {
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
  targetUserId?: number;
}

const userStore = useUserStore();
const socket = ref<Socket | null>(null);

const users = ref<User[]>([]);
const currentUser = ref<User | null>(null);
const friendRequests = ref<FriendRequest[]>([]);

const searchKeyword = ref("");
const searchResults = ref<User[]>([]);
const isSearchVisible = ref(false);
const isRequestsExpanded = ref(false);

const messagesMap = ref<Record<number, Message[]>>({});
const inputMessage = ref("");
const messageListRef = ref<HTMLElement | null>(null);

// 移动端适配
const isMobile = ref(false);
const showChatOnMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.matchMedia("(max-width: 768px)").matches;
};
const backToList = () => {
  showChatOnMobile.value = false;
};

const currentMessages = computed(() => {
  if (!currentUser.value) return [];
  return messagesMap.value[currentUser.value.fromUserId] || [];
});

// 获取好友聊天记录
const getFriendChatHistory = async (friendUserId: number) => {
  try {
    const res = await getFriendChatHistoryAPI(
      userStore.userInfo.userId,
      friendUserId,
    );
    if (res.code === 200) {
      const historyMessages = (res.data || []).map((msg: any) => ({
        sender: msg.username || msg.fromUsername || "未知用户",
        text: msg.content,
        time: dayjs(msg.sendTime).format("YYYY-MM-DD HH:mm:ss"),
        isSelf: msg.fromUserId === userStore.userInfo.userId,
        targetUserId:
          msg.fromUserId === userStore.userInfo.userId
            ? msg.toUserId
            : msg.fromUserId,
      }));
      messagesMap.value[friendUserId] = historyMessages;
    }
  } catch (error: any) {
    ElMessage.error(error.message || "获取好友聊天记录失败");
  }
};

const getApplyHistory = async () => {
  try {
    const res = await getApplyHistoryAPI(userStore.userInfo.userId);
    if (res.code === 200) {
      friendRequests.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || "获取好友申请失败");
  }
};

const getFriendList = async () => {
  try {
    const res = await getFriendListAPI(userStore.userInfo.userId);
    if (res.code === 200) {
      users.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || "获取好友列表失败");
  }
};

const searchUsers = async () => {
  try {
    const res = await getAllUsersAPI(searchKeyword.value);
    if (res.code === 200) {
      searchResults.value = res.data;
    }
  } catch (error: any) {
    ElMessage.error(error.message || "搜索失败");
  }
};

const addFriend = (user: User) => {
  socket.value?.emit("friend_apply", {
    friendId: user.id,
    userId: userStore.userInfo.userId,
    username: userStore.userInfo.username,
    applyMsg: "申请加为好友",
  });
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener("resize", checkIsMobile);

  getApplyHistory();
  getFriendList();

  socket.value = getSocket();

  if (socket.value.connected) {
    handleConnect();
  }
  socket.value.on("connect", handleConnect);
  socket.value.on("friend:apply:receive", handleFriendApplyReceive);
  socket.value.on("friend:accept:success", handleFriendAcceptSuccess);
  socket.value.on("friend:refuse:success", handleFriendRefuseSuccess);
  socket.value.on("addFriendSuccess", handleAddFriendSuccess);
  socket.value.on("addFriendError", handleAddFriendError);
  socket.value.on("friend:status:change", handleFriendStatusChange);
  socket.value.on("receivePrivateMsg", handleReceivePrivateMsg);
  socket.value.on("systemMsg", handleSystemMsg);
});

const handleConnect = () => {
  console.log("✅ Socket 连接成功");
  socket.value?.emit("user:online", {
    userId: userStore.userInfo.userId,
    username: userStore.userInfo.username,
  });
};

const handleFriendApplyReceive = (data: any) => {
  const exists = friendRequests.value.some(
    (r) => r.fromUserId === data.fromUserId,
  );
  if (!exists) {
    friendRequests.value.unshift({
      fromUserId: data.fromUserId,
      fromUsername: data.fromUsername,
      create_time: data.createTime,
    });
  }
};

const handleFriendAcceptSuccess = (data: any) => {
  ElMessage.success(data.msg);
  getApplyHistory();
};

const handleFriendRefuseSuccess = (data: any) => {
  ElMessage.warning(data.msg);
  getApplyHistory();
};

const handleAddFriendSuccess = (data: any) => {
  ElMessage.success(data.msg);
  getApplyHistory();
};

const handleAddFriendError = (data: any) => {
  ElMessage.error(data.msg);
};

const handleFriendStatusChange = (data: any) => {
  const friend = users.value.find((u) => u.fromUserId === data.targetUserId);
  if (friend) {
    friend.isOnline = data.isOnline;
    if (data.isOnline) {
      ElMessage.success(`${friend.fromUsername}上线了`);
    } else {
      ElMessage.info(`${friend.fromUsername}下线了`);
    }
  }
};

const handleReceivePrivateMsg = (msg: any) => {
  const myId = userStore.userInfo.userId;
  const isSelf = msg.fromUserId === myId;
  const chatPartnerId = isSelf ? msg.toUserId : msg.fromUserId;

  const message = {
    sender: msg.fromUsername,
    text: msg.content,
    time: dayjs(msg.sendTime).format("YYYY-MM-DD HH:mm:ss"),
    isSelf: isSelf,
    targetUserId: chatPartnerId,
  };

  if (!messagesMap.value[chatPartnerId]) {
    messagesMap.value[chatPartnerId] = [];
  }
  messagesMap.value[chatPartnerId].push(message);

  if (currentUser.value?.fromUserId === chatPartnerId) {
    scrollToBottom();
  } else if (!isSelf) {
    ElMessage.info(`收到 ${msg.fromUsername} 的消息`);
  }
};

const handleSystemMsg = (msg: any) => ElMessage.success(msg.content);

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
  if (socket.value) {
    socket.value.off("connect", handleConnect);
    socket.value.off("friend:apply:receive", handleFriendApplyReceive);
    socket.value.off("friend:accept:success", handleFriendAcceptSuccess);
    socket.value.off("friend:refuse:success", handleFriendRefuseSuccess);
    socket.value.off("addFriendSuccess", handleAddFriendSuccess);
    socket.value.off("addFriendError", handleAddFriendError);
    socket.value.off("friend:status:change", handleFriendStatusChange);
    socket.value.off("receivePrivateMsg", handleReceivePrivateMsg);
    socket.value.off("systemMsg", handleSystemMsg);
  }
});

const acceptFriendRequest = (req: FriendRequest) => {
  socket.value?.emit("friend:accept", {
    userId: userStore.userInfo.userId,
    applyUserId: req.fromUserId,
    username: userStore.userInfo.username,
    applyUserName: req.fromUsername,
  });
  friendRequests.value = friendRequests.value.filter(
    (r) => r.fromUserId !== req.fromUserId,
  );
  getFriendList();
};

const rejectFriendRequest = (req: FriendRequest) => {
  socket.value?.emit("friend:refuse", {
    userId: userStore.userInfo.userId,
    applyUserId: req.fromUserId,
    username: userStore.userInfo.username,
    applyUserName: req.fromUsername,
  });
  friendRequests.value = friendRequests.value.filter(
    (r) => r.fromUserId !== req.fromUserId,
  );
};

const switchUser = (user: User) => {
  // 如果是同一用户，仅确保移动端聊天界面显示即可，无需重复加载数据
  if (currentUser.value?.fromUserId === user.fromUserId) {
    if (isMobile.value) {
      showChatOnMobile.value = true;
    }
    return;
  }

  currentUser.value = user;

  if (isMobile.value) {
    showChatOnMobile.value = true;
  }

  getFriendChatHistory(user.fromUserId);
  if (!messagesMap.value[user.fromUserId])
    messagesMap.value[user.fromUserId] = [];
  nextTick(scrollToBottom);
};

const sendMessage = () => {
  const content = inputMessage.value.trim();
  if (!content || !currentUser.value || !socket.value) return;

  const msgData = {
    toUserId: currentUser.value.fromUserId,
    fromUserId: userStore.userInfo.userId,
    fromUsername: userStore.userInfo.username,
    content: content,
    sendTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  };
  socket.value.emit("sendPrivateMsg", msgData);
  inputMessage.value = "";
};

const scrollToBottom = async () => {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
};

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
};

const toggleRequests = () => {
  isRequestsExpanded.value = !isRequestsExpanded.value;
};

const searchInputRef = ref<HTMLInputElement | null>(null);
</script>

<style scoped>
.socket-user-container {
  display: flex;
  height: calc(100vh - 120px);
  width: calc(100vw - 250px);
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background-color: #fff;
  position: relative;
}

.sidebar {
  width: 250px;
  background-color: #f0f2f5;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.friend-requests-area {
  border-bottom: 1px solid #e8e8e8;
  background-color: #fffbe6;
}

.section-title {
  padding: 8px 15px;
  font-size: 12px;
  font-weight: bold;
  color: #d48806;
  background-color: #fff1b8;
  border-bottom: 1px solid #ffe58f;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.section-title:hover {
  background-color: #ffe58f;
}

.expand-icon {
  font-size: 10px;
  margin-left: 8px;
}

.request-list-content {
  max-height: 200px;
  overflow-y: auto;
}

.request-item {
  padding: 10px 15px;
  border-bottom: 1px solid #ffe58f;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.requester-name {
  font-weight: bold;
  color: #333;
}

.request-msg {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.request-actions {
  display: flex;
  gap: 5px;
}

.btn-accept,
.btn-reject {
  padding: 2px 6px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  font-size: 10px;
}

.btn-accept {
  background-color: #52c41a;
  color: white;
}

.btn-accept:hover {
  background-color: #73d13d;
}

.btn-reject {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-reject:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.header-actions {
  display: flex;
  gap: 5px;
}

.btn-search-toggle {
  background-color: #f0f2f5;
  color: #999;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-search-toggle:hover {
  background-color: #e8e8e8;
}

.btn-search-toggle.active {
  background-color: #409eff;
  color: white;
}

.search-area {
  padding: 10px 15px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  gap: 5px;
  background-color: #fff;
}

.search-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}

.search-input:focus {
  border-color: #409eff;
}

.btn-search-exec {
  padding: 6px 10px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-search-exec:hover {
  background-color: #66b1ff;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
}

.result-title {
  padding: 8px 15px;
  font-size: 12px;
  color: #999;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
}

.search-result-item {
  cursor: pointer;
  background-color: #f9f9f9;
}

.search-result-item:hover {
  background-color: #e6f7ff;
}

.chat-tip {
  font-size: 10px;
  color: #409eff;
}

.user-list {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  padding: 12px 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
  border-bottom: 1px solid #ebeef5;
}

.user-item:hover {
  background-color: #e6f7ff;
}

.user-item.active {
  background-color: #bae7ff;
  border-left: 4px solid #409eff;
}

.user-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.online {
  background-color: #67c23a;
}

.status-dot.offline {
  background-color: #909399;
}

.empty-tip {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.chat-header {
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-back {
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #333;
}

.back-icon {
  font-weight: bold;
  margin-right: 4px;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-chat {
  text-align: center;
  color: #ccc;
  margin-top: 50px;
}

.message-item {
  display: flex;
  width: 100%;
}

.message-item.self {
  justify-content: flex-end;
}

.message-item.other {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-item.self .message-content {
  background-color: #95ec69;
  color: #000;
  border-top-right-radius: 2px;
}

.message-item.other .message-content {
  background-color: #fff;
  border: 1px solid #ddd;
  color: #333;
  border-top-left-radius: 2px;
}

.sender {
  font-size: 12px;
  color: #888;
  display: block;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.text {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.time {
  font-size: 10px;
  color: #aaa;
  display: block;
  text-align: right;
  margin-top: 4px;
}

.input-area {
  display: flex;
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
  flex-shrink: 0;
  margin-bottom: 60px;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  outline: none;
  transition: border-color 0.2s;
}

.input-area input:focus {
  border-color: #409eff;
}

.input-area button {
  padding: 0 20px;
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.input-area button:hover {
  background-color: #66b1ff;
}

.empty-state {
  justify-content: center;
  align-items: center;
  color: #999;
}

@media (max-width: 768px) {
  .socket-user-container {
    height: 100vh;
    width: 100vw;
    border: none;
    border-radius: 0;
    position: fixed;
    top: 0;
    left: 0;
  }

  .sidebar {
    width: 100%;
    height: 100%;
  }

  .chat-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background: #fafafa;
  }

  .message-content {
    max-width: 85%;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
