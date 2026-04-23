<template>
  <div>
    <div class="img-container">
      <img
        :src="prop.lazyImage"
        ref="lazyRef"
        @load="handleLazyImageLoad"
        class="lazyImage"
      />
      <img
        ref="hdRef"
        class="hdImage"
        :src="hdSrc"
        :style="{ opacity: hdLoad ? 1 : 0 }"
        @load="handleHdImageLoad"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
const prop = defineProps<{
  lazyImage: string;
  hdImage: string;
}>();
const lazyRef = ref();
const hdRef = ref();
// 加载成功状态
const isLazyLoad = ref(false);
const hdLoad = ref(false);
// 高清图src，只有在需要时才设置
const hdSrc = ref("");
// 是否已开始加载高清图
const isHdLoading = ref(false);

// 观察者实例
const observer = ref();

// 监听模糊图加载事件
const handleLazyImageLoad = () => {
  isLazyLoad.value = true;
  initObserver();
};

const handleHdImageLoad = () => {
  hdLoad.value = true;
};

// 初始化观察者
const initObserver = () => {
  if (!lazyRef.value || hdLoad.value || isHdLoading.value) return;

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isHdLoading.value && !hdLoad.value) {
          // 开始加载高清图
          isHdLoading.value = true;
          hdSrc.value = prop.hdImage;
          // 断开观察者
          observer.value?.unobserve(entry.target);
          observer.value?.disconnect();
        }
      });
    },
    {
      threshold: 0.1, // 降低阈值，让用户体验更好
      rootMargin: "10px 0px", // 增加预加载区域
    },
  );

  observer.value.observe(lazyRef.value); // 挂载监听元素
};

// 组件卸载时清理
import { onUnmounted } from "vue";
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});
</script>
<style lang="scss" scoped>
.img-container {
  position: relative;
  width: 200px;
  height: 200px;
}
.lazyImage {
  position: absolute;
  filter: blur(5px);
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hdImage {
  position: absolute;
  z-index: 100;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease-in-out;
}
</style>
