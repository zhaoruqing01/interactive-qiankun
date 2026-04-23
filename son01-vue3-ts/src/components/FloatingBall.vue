<template>
  <Teleport to="body">
    <div
      ref="ballRef"
      class="floating-container"
      :class="{ 'is-expanded': isExpanded }"
      :style="{
        transform: `translate(${x}px, ${y}px)`, // 核心：GPU 加速位移，最丝滑，无重排
        zIndex: 9999,
        transition: isDragging
          ? 'none'
          : 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }"
      @click="toggleExpand"
    >
      <div class="ball-content" :class="{ 'fade-out': isExpanded }">
        <slot>⚡</slot>
      </div>

      <div class="panel-content" :class="{ 'fade-in': isExpanded }" @click.stop>
        <AigcChat v-if="isExpanded" @close="toggleExpand" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useDraggable } from "@vueuse/core";
import { ref, watch } from "vue";
import AigcChat from "./AigcChat.vue";

const ballRef = ref(null);
const ballSize = 50; // 悬浮球宽高
const panelWidth = 300; // 展开后面板宽
const panelHeight = 400; // 展开后面板高

// 展开状态
const isExpanded = ref(false);

// 记录鼠标按下时的时间和位置，用于区分点击和拖拽
let mouseDownTime = 0;
let mouseDownPos = { x: 0, y: 0 };

// 🔥 丝滑拖拽 + 严格屏幕边界限制
const { x, y, isDragging } = useDraggable(ballRef, {
  // 初始位置：右下角
  initialValue: {
    x: window.innerWidth - ballSize - 20,
    y: window.innerHeight - ballSize - 20,
  },
  // 仅在未展开时允许拖拽
  disabled: isExpanded,
  // 记录开始信息以判断是否为点击
  onStart: (pos, event) => {
    mouseDownTime = Date.now();

    // 🔧 修复 1：兼容移动端触摸事件 (TouchEvent) 和电脑端鼠标/指针事件 (MouseEvent/PointerEvent)
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    mouseDownPos = { x: clientX, y: clientY };
  },
  // ✅ 核心：精确边界计算，永远拖不出屏幕
  bounds: ({ width, height }) => ({
    top: 0,
    left: 0,
    right: window.innerWidth - width,
    bottom: window.innerHeight - height,
  }),
});

// 切换展开/收起
const toggleExpand = (event) => {
  // 阻止事件冒泡，防止触发两次
  if (event) {
    event.stopPropagation();
  }

  // 如果是拖拽导致的 mouseup，不视为点击
  const timeDiff = Date.now() - mouseDownTime;
  // 对于展开状态点击关闭按钮，不需要判断拖拽时间差
  if (!isExpanded.value && (timeDiff > 200 || isDragging.value)) return;

  isExpanded.value = !isExpanded.value;

  // 处理展开时的位置修正，防止超出屏幕
  if (isExpanded.value) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let newX = x.value;
    let newY = y.value;

    if (newX + panelWidth > screenWidth) {
      newX = screenWidth - panelWidth - 20;
    }
    if (newY + panelHeight > screenHeight) {
      newY = screenHeight - panelHeight - 20;
    }

    x.value = newX;
    y.value = newY;
  } else {
    // 收起时重新吸边
    snapToEdge();
  }
};

// 吸边逻辑抽取
const snapToEdge = () => {
  const screenWidth = window.innerWidth;
  if (x.value > screenWidth / 2) {
    x.value = screenWidth - ballSize - 20;
  } else {
    x.value = 20;
  }
};

// ✅ 核心：安全自动吸边（拖拽结束后执行，绝不抽搐）
watch(isDragging, (dragging) => {
  // 只有拖拽结束时，且未展开，才触发吸边
  if (!dragging && !isExpanded.value) {
    snapToEdge();
  }
});
</script>

<style scoped>
.floating-container {
  /* 固定定位，初始坐标 0,0，完全靠 transform 位移 */
  position: fixed;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  cursor: pointer; /* 默认鼠标指针为可点击 */
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  /* 🔧 修复 2：阻止移动端浏览器默认手势（如滚动、缩放），防止拖拽被强行中断 */
  touch-action: none;

  /* 丝滑的宽高和圆角过渡动画 */
  transition:
    width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
    height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
    border-radius 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
    background-color 0.4s ease;

  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 未展开时（悬浮球状态），可拖拽 */
.floating-container:not(.is-expanded) {
  cursor: grab;
}

.floating-container:not(.is-expanded):active {
  cursor: grabbing;
}

/* 展开后的长方形面板状态 */
.floating-container.is-expanded {
  width: 300px;
  height: 400px;
  border-radius: 12px;
  background: white;
  color: #333;
  cursor: default;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);

  /* 🔧 修复 2 的延续：展开后面板恢复触摸默认行为，确保面板内部的聊天记录等内容可以正常滚动 */
  touch-action: auto;
}

/* 小球内部内容 */
.ball-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity 0.2s ease,
    transform 0.3s ease;
}

.ball-content.fade-out {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.5);
}

/* 面板内部内容 */
.panel-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease 0.1s; /* 延迟出现，让外部先变大 */
  display: flex;
  flex-direction: column;
}

.panel-content.fade-in {
  opacity: 1;
  pointer-events: auto;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
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

.panel-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}
</style>
