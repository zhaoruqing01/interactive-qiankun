<template>
  <div class="socket-room-container" :class="{ 'is-mobile': isMobile }">
    <div class="sidebar" v-if="!isMobile || !showChatOnMobile">
      <div class="sidebar-header">
        <h2>群聊列表</h2>
        <div class="header-actions">
          <button
            @click="showCreateModal = true"
            class="btn-create"
            title="新建群聊"
          >
            +
          </button>
          <button
            @click="toggleSearch"
            class="btn-search-toggle"
            :class="{ active: isSearchVisible }"
            title="搜索群聊"
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
            @keyup.enter="searchRooms"
            placeholder="搜索公共群组..."
            class="search-input"
          />
          <button @click="searchRooms" class="btn-search-exec">Go</button>
        </div>
      </transition>

      <div
        v-if="searchKeyword && searchResults.length > 0"
        class="search-results"
      >
        <div class="result-title">搜索结果</div>
        <div
          v-for="room in searchResults"
          :key="room.group_id"
          class="room-item search-result-item"
          @click="joinSearchedRoom(room)"
        >
          <span class="room-name">{{ room.group_name }}</span>
          <span class="join-tip">点击加入</span>
        </div>
      </div>

      <div v-else class="room-list">
        <div
          v-for="room in rooms"
          :key="room.group_id"
          :class="[
            'room-item',
            { active: currentRoom?.group_id === room.group_id },
          ]"
          @click="switchRoom(room)"
        >
          <span class="room-name">{{ room.group_name }}</span>
          <button
            class="btn-delete"
            @click.stop="deleteRoom(room.group_id)"
            title="删除/退出"
          >
            ×
          </button>
        </div>
        <div v-if="rooms.length === 0" class="empty-tip">
          暂无群聊，请创建或搜索
        </div>
      </div>
    </div>

    <div
      class="chat-area"
      v-if="currentRoom && (!isMobile || showChatOnMobile)"
    >
      <div class="chat-header">
        <div class="header-left">
          <button v-if="isMobile" class="btn-back" @click="backToList">
            <span class="back-icon">〈</span> 列表
          </button>
          <h3>{{ currentRoom.group_name }}</h3>
        </div>
        <span class="room-id" v-if="!isMobile"
          >ID: {{ currentRoom.group_id }}</span
        >
      </div>

      <div class="message-list" ref="messageListRef">
        <div
          v-for="(msg, index) in currentMessages"
          :key="index"
          :class="['message-item', msg.isSelf ? 'self' : 'other']"
        >
          <div class="message-content">
            <span class="sender" v-if="!msg.isSelf">
              {{ msg.sender }}
              <span v-if="msg.isOwner" class="owner-badge">群主</span>
            </span>
            <p class="text">{{ msg.text }}</p>
          </div>
        </div>
        <div v-if="currentMessages.length === 0" class="empty-chat">
          开始聊点什么吧~
        </div>
      </div>

      <div class="input-area">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          placeholder="请输入消息..."
          type="text"
        />
        <button @click="sendMessage">发送</button>
      </div>
    </div>

    <div class="chat-area empty-state" v-else-if="!isMobile">
      <p>选择一个群聊开始对话</p>
    </div>

    <div v-if="showCreateModal" class="modal-overlay">
      <div class="modal">
        <h3>创建新群聊</h3>
        <input
          v-model="newRoomName"
          placeholder="群聊名称"
          @keyup.enter="createRoom"
        />
        <div class="modal-actions">
          <button @click="showCreateModal = false">取消</button>
          <button @click="createRoom" class="btn-confirm">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  createGroupAPI,
  deleteGroupAPI,
  exitGroupAPI,
  getGroupListAPI,
  getGroupMsgAPI,
  getJoinedGroupListAPI,
  joinGroupAPI,
} from "@/api/group";
import { useUserStore } from "@/store/user";
import getSocket from "@/utils/socket";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { Socket } from "socket.io-client";
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";

// 类型定义
interface Room {
  create_time: string;
  group_id: number;
  group_name: string;
  is_deleted: number;
  owner_id: number;
}
interface Message {
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
  isOwner?: boolean;
}

const userStore = useUserStore();
const socket = ref<Socket | null>(null);

// 状态
const rooms = ref<Room[]>([]);
const currentRoom = ref<Room | null>(null);
const showCreateModal = ref(false);
const newRoomName = ref("");
const searchKeyword = ref("");
const searchResults = ref<Room[]>([]);
const isSearchVisible = ref(false);
const messagesMap = ref<Record<string, Message[]>>({});
const inputMessage = ref("");
const messageListRef = ref<HTMLElement | null>(null);

// --- 移动端适配逻辑 ---
const isMobile = ref(false);
const showChatOnMobile = ref(false);

const checkIsMobile = () => {
  isMobile.value = window.matchMedia("(max-width: 768px)").matches;
};

const backToList = () => {
  showChatOnMobile.value = false;
};
// --------------------

const currentMessages = computed(() => {
  if (!currentRoom.value) return [];
  return messagesMap.value[currentRoom.value.group_id] || [];
});

const getJoinedGroupList = async () => {
  try {
    const res = await getJoinedGroupListAPI();
    if (res.code === 200) rooms.value = res.data;
  } catch (error: any) {
    ElMessage.error("获取群聊列表失败");
  }
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener("resize", checkIsMobile);
  getJoinedGroupList();

  socket.value = getSocket();

  // 监听群消息
  socket.value.on("receiveGroupMsg", handleReceiveGroupMsg);
  socket.value.on("systemMsg", handleSystemMsg);
});

const handleReceiveGroupMsg = (msg: any) => {
  const groupId = msg.groupId;
  const isSelf = msg.userId === userStore.userInfo.userId;
  const message = {
    sender: msg.username,
    text: msg.content,
    time: dayjs(msg.sendTime).format("HH:mm:ss"),
    isSelf,
    isOwner: msg.userId === currentRoom.value?.owner_id,
  };

  if (!messagesMap.value[groupId]) messagesMap.value[groupId] = [];
  messagesMap.value[groupId].push(message);

  if (currentRoom.value?.group_id === groupId) {
    scrollToBottom();
  }
};

const handleSystemMsg = (msg: any) => ElMessage.success(msg.content);

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
  if (socket.value) {
    socket.value.off("receiveGroupMsg", handleReceiveGroupMsg);
    socket.value.off("systemMsg", handleSystemMsg);
  }
});

// 切换群聊
const switchRoom = async (room: Room) => {
  if (currentRoom.value?.group_id === room.group_id) {
    if (isMobile.value) showChatOnMobile.value = true;
    return;
  }

  if (currentRoom.value) {
    socket.value?.emit("quitGroup", currentRoom.value.group_id);
  }

  currentRoom.value = room;
  // 移动端切换视图
  if (isMobile.value) showChatOnMobile.value = true;

  socket.value?.emit("joinGroup", room.group_id, userStore.userInfo.userId);

  // 加载历史消息
  const res = await getGroupMsgAPI(room.group_id);
  if (res?.code === 200) {
    messagesMap.value[room.group_id] = res.data.map((item: any) => ({
      sender: item.username,
      text: item.content,
      time: dayjs(item.send_time).format("HH:mm:ss"),
      isSelf: item.user_id === userStore.userInfo.userId,
      isOwner: item.user_id === room.owner_id,
    }));
  }
  nextTick(() => scrollToBottom());
};

const sendMessage = () => {
  if (!inputMessage.value.trim() || !currentRoom.value || !socket.value) return;
  const msgData = {
    groupId: currentRoom.value.group_id,
    userId: userStore.userInfo.userId,
    username: userStore.userInfo.username,
    content: inputMessage.value,
  };
  socket.value.emit("sendGroupMsg", msgData);
  inputMessage.value = "";
  scrollToBottom();
};

const createRoom = async () => {
  if (!newRoomName.value.trim()) return;
  try {
    const res = await createGroupAPI({
      group_name: newRoomName.value,
      owner_id: userStore.userInfo.userId,
      is_deleted: false,
      create_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
    if (res.code === 200) {
      showCreateModal.value = false;
      newRoomName.value = "";
      getJoinedGroupList();
      ElMessage.success("群聊创建成功");
    }
  } catch (err) {
    ElMessage.error("创建失败");
  }
};

const deleteRoom = (roomId: number) => {
  const room = rooms.value.find((r) => r.group_id === roomId);
  if (!room) return;
  const isOwner = room.owner_id === userStore.userInfo.userId;
  ElMessageBox.confirm(
    isOwner ? "确定解散该群聊吗？" : "确定退出该群聊吗？",
    "提示",
  )
    .then(() => (isOwner ? deleteGroupAPI(roomId) : exitGroupAPI(roomId)))
    .then(() => {
      ElMessage.success("操作成功");
      getJoinedGroupList();
      if (currentRoom.value?.group_id === roomId) {
        currentRoom.value = null;
        showChatOnMobile.value = false;
      }
    });
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
const searchRooms = () => {
  if (!searchKeyword.value.trim()) return;
  getGroupListAPI(searchKeyword.value).then((res) => {
    searchResults.value = res.data;
  });
};
const joinSearchedRoom = (room: Room) => {
  joinGroupAPI(room.group_id).then(() => {
    ElMessage.success("已加入群聊");
    getJoinedGroupList();
    switchRoom(room);
  });
  searchKeyword.value = "";
  searchResults.value = [];
};

const searchInputRef = ref<HTMLInputElement | null>(null);
</script>

<style scoped>
.socket-room-container {
  display: flex;
  height: 100%; /* 由外部 Layout 决定高度 */
  width: 100%;
  background-color: #fff;
  overflow: hidden;
}

/* 列表侧边栏 */
.sidebar {
  width: 280px;
  background-color: #f7f7f7;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px 15px;
  background-color: #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-create,
.btn-search-toggle {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 14px;
}

.btn-create:hover {
  color: #409eff;
  border-color: #409eff;
}

.search-area {
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 5px;
}

.search-input {
  flex: 1;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

/* 列表项样式 */
.room-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.room-item:hover {
  background-color: #eee;
}
.room-item.active {
  background-color: #e2e2e2;
}

.room-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.btn-delete {
  border: none;
  background: transparent;
  color: #ccc;
  font-size: 18px;
  cursor: pointer;
}
.btn-delete:hover {
  color: #f56c6c;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-header {
  padding: 15px 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-back {
  border: none;
  background: transparent;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.back-icon {
  margin-right: 4px;
  font-weight: bold;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  width: 100%;
}
.message-item.self {
  justify-content: flex-end;
}

.message-content {
  max-width: 75%;
  padding: 10px;
  border-radius: 6px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.self .message-content {
  background-color: #95ec69; /* 微信绿 */
  color: #000;
}

.other .message-content {
  background-color: #fff;
  border: 1px solid #ddd;
  color: #333;
}

.sender {
  font-size: 11px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.owner-badge {
  background: #f56c6c;
  color: #fff;
  font-size: 10px;
  padding: 0 4px;
  border-radius: 2px;
}

.text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}
.time {
  font-size: 10px;
  color: #999;
  display: block;
  text-align: right;
  margin-top: 4px;
}

.input-area {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
  margin-bottom: 60px;
}

.input-area input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.input-area button {
  padding: 0 20px;
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}
.modal input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ddd;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 移动端覆盖 */
@media (max-width: 768px) {
  .socket-room-container {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    z-index: 1000;
  }
  .sidebar {
    width: 100%;
    border-right: none;
  }
  .chat-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
}

.empty-state {
  justify-content: center;
  align-items: center;
  color: #999;
}
</style>
