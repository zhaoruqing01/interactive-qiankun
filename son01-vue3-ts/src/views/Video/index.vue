<template>
  <div class="page-container">
    <div class="video-title">
      <h1>视频交互</h1>
      <el-button @click="showDialog">显示高级场景</el-button>
    </div>
    <div class="video-container">
      <div class="video-box1">
        <h2>原生交互</h2>
        <!-- 依次是视频地址、控制条、宽度、静音、自动播放、循环播放、封面图片 -->
        <video
          src="@/assets/interAct-video.mp4"
          controls
          width="500"
          muted
          autoplay
          loop
          poster="@/assets/poster.png"
        ></video>
      </div>
      <div class="video-box2">
        <h2>自定义交互</h2>
        <!-- 自定义视频播放器容器 -->
        <div class="custom-video-container">
          <!-- 视频元素，移除默认控制条 -->
          <video
            ref="customVideo"
            src="@/assets/interAct-video.mp4"
            width="600"
            poster="@/assets/poster.png"
          ></video>

          <!-- 自定义控制栏 -->
          <div class="custom-controls">
            <!-- 播放/暂停按钮 -->
            <button @click="togglePlay" class="control-btn">
              {{ isPlaying ? "暂停" : "播放" }}
            </button>

            <!-- 进度条容器 -->
            <div class="progress-container" @click="seekVideo">
              <!-- 已播放进度 -->
              <div
                class="progress-bar"
                :style="{ width: progress + '%' }"
              ></div>
              <!-- 可拖动滑块（视觉展示） -->
              <div
                class="progress-thumb"
                :style="{ left: progress + '%' }"
              ></div>
            </div>

            <!-- 时间显示 -->
            <span class="time-display">{{ currentTime }} / {{ duration }}</span>

            <!-- 音量控制 -->
            <div class="volume-control">
              <button @click="toggleMute" class="control-btn">
                {{ isMuted ? "取消静音" : "静音" }}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                v-model="volume"
                @input="changeVolume"
                class="volume-slider"
              />
            </div>

            <!-- 全屏按钮 -->
            <button @click="toggleFullscreen" class="control-btn">全屏</button>
          </div>
        </div>
      </div>
    </div>
    <high-videoContro ref="highVideoControRef" />
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import highVideoContro from "./components/high-videoContro.vue";

// 视频元素引用
const customVideo = ref(null);

// 状态变量
const isPlaying = ref(false); // 是否正在播放
const progress = ref(0); // 播放进度百分比
const currentTime = ref("00:00"); // 当前播放时间
const duration = ref("00:00"); // 视频总时长
const isMuted = ref(false); // 是否静音
const volume = ref(1); // 音量值 (0-1)

// 高级场景引用
const highVideoControRef = ref(null);

// 格式化时间为 mm:ss 格式
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 切换播放/暂停状态
const togglePlay = () => {
  if (!customVideo.value) return;

  if (isPlaying.value) {
    customVideo.value.pause();
  } else {
    customVideo.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

// 更新播放进度和时间显示
const updateProgress = () => {
  if (!customVideo.value) return;

  const current = customVideo.value.currentTime;
  const total = customVideo.value.duration;

  // 计算进度百分比
  progress.value = (current / total) * 100;

  // 更新时间显示
  currentTime.value = formatTime(current);
  duration.value = formatTime(total);
};

// 点击进度条跳转视频位置
const seekVideo = (e) => {
  if (!customVideo.value) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  customVideo.value.currentTime = pos * customVideo.value.duration;
};

// 切换静音状态
const toggleMute = () => {
  if (!customVideo.value) return;

  isMuted.value = !isMuted.value;
  customVideo.value.muted = isMuted.value;
};

// 改变音量
const changeVolume = () => {
  if (!customVideo.value) return;

  customVideo.value.volume = volume.value;
  isMuted.value = volume.value === 0;
};

// 切换全屏模式
const toggleFullscreen = () => {
  const container = document.querySelector(".custom-video-container");

  if (!document.fullscreenElement) {
    container.requestFullscreen().catch((err) => {
      console.log(`全屏启动失败: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};

// 显示高级场景
const showDialog = () => {
  if (!highVideoControRef.value) return;

  highVideoControRef.value.showDialog();
};

// 监听视频事件
onMounted(() => {
  if (!customVideo.value) return;

  // 监听播放和暂停事件以更新状态
  customVideo.value.addEventListener("play", () => {
    isPlaying.value = true;
  });

  customVideo.value.addEventListener("pause", () => {
    isPlaying.value = false;
  });

  // 监听时间更新以刷新进度条
  customVideo.value.addEventListener("timeupdate", updateProgress);

  // 监听加载元数据以获取视频时长
  customVideo.value.addEventListener("loadedmetadata", () => {
    duration.value = formatTime(customVideo.value.duration);
  });
});

// 清理事件监听器
onBeforeUnmount(() => {
  if (!customVideo.value) return;

  customVideo.value.removeEventListener("play", () => {});
  customVideo.value.removeEventListener("pause", () => {});
  customVideo.value.removeEventListener("timeupdate", updateProgress);
  customVideo.value.removeEventListener("loadedmetadata", () => {});
});
</script>
<style scoped lang="scss">
.page-container {
  width: 100%;
  height: 80vh;
}
h1 {
  color: rgb(0, 0, 0);
}
.video-title {
  width: 100%;
  display: flex;
  align-items: center;
}
.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
  height: 100%;
}
.video-box1 {
  flex: 0.5;
  height: 100%;
  border: 1px solid #000;
}
.video-box2 {
  flex: 0.5;
  height: 100%;
  border: 1px solid #000;
  display: flex;
  flex-direction: column;
}

.custom-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  flex-direction: column;
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.control-btn {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.progress-container {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  position: relative;

  &:hover .progress-thumb {
    opacity: 1;
  }
}

.progress-bar {
  height: 100%;
  background: #409eff;
  border-radius: 4px;
  transition: width 0.1s linear;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
}

.time-display {
  font-size: 12px;
  min-width: 80px;
  text-align: center;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.volume-slider {
  width: 80px;
  cursor: pointer;
}
</style>
