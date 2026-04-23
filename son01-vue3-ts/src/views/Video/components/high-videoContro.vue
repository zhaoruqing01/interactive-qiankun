<template>
  <el-dialog title="视频播放" v-model="visible" width="80%" top="20px">
    <div class="video-wrap">
      <div class="player-container" ref="containerRef">
        <!-- 原生 video -->
        <video ref="videoRef" class="video-player" controls>
          <source src="@/assets/interAct-video.mp4" type="video/mp4" />
        </video>

        <!-- 弹幕容器 -->
        <div ref="danmakuContainerRef" class="danmaku-container"></div>
      </div>

      <!-- 发送弹幕 -->
      <div class="send-bar">
        <input
          v-model="inputText"
          placeholder="输入弹幕，按回车发送"
          @keyup.enter="sendDanmu"
        />
        <button @click="sendDanmu">发送</button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import Danmaku from "danmaku";
import { onBeforeUnmount, ref } from "vue";

const videoRef = ref(null);
const danmakuContainerRef = ref(null);
const inputText = ref("");
const visible = ref(false);

let danmaku = null;
let isMounted = true;

const initVideo = () => {
  console.log("执行了");

  if (!danmakuContainerRef.value || !videoRef.value) return;

  // 初始化弹幕引擎
  danmaku = new Danmaku({
    container: danmakuContainerRef.value,
    media: videoRef.value,
    engine: "dom",
  });

  // 初始弹幕 - 确保颜色格式正确
  danmaku.danmaku = [
    { time: 1, text: "终于不报错啦", color: "#ffffff", type: 0 },
    { time: 2, text: "666666", color: "#ffff00", type: 0 },
    { time: 3, text: "原生 video 完美", color: "#00ff00", type: 1 },
  ];

  // 自动绑定播放/暂停（正确写法）
  danmaku.media = videoRef.value;
  danmaku.resize();
};

// 发送弹幕
const sendDanmu = () => {
  const text = inputText.value.trim();
  if (!text || !danmaku) return;

  // 显式传入颜色对象，确保格式无误
  danmaku.emit({
    text,
    color: "#e74032", // 红色
    type: 0,
  });

  inputText.value = "";
};

const showDialog = () => {
  visible.value = true;
  setTimeout(() => {
    initVideo();
  }, 0);
};

defineExpose({
  showDialog,
});

// 销毁
onBeforeUnmount(() => {
  isMounted = false;
  if (danmaku) {
    danmaku.clear();
    danmaku.destroy();
    danmaku = null;
  }
});
</script>

<style scoped>
.video-wrap {
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
}
.player-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
.video-player {
  width: 100%;
  display: block;
}
.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 85%;
  pointer-events: none;
  overflow: hidden;
  /* 新增：防止全局样式将弹幕文字强制设为黑色 */
  /* color: initial !important; */
}

/* 新增：确保弹幕容器内的所有元素继承颜色或使用自身定义的颜色 */
.danmaku-container * {
  color: inherit;
}

.send-bar {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  padding: 8px 16px;
  background: #0099ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
