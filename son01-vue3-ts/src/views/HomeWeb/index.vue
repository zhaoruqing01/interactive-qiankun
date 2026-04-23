<template>
  <!-- 改用 wheel 监听滚轮，删除错误的 scroll 事件 -->
  <div class="container" ref="containerRef" @wheel="onPageWheel">
    <div class="section page1">第一屏 🎬</div>
    <div class="section page2" ref="page2Ref">
      <span>第二屏 ✨</span>
      <div
        ref="horizontalScrollRef"
        class="horizontal-scroll-area"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
        @wheel="onHorizontalWheel"
      >
        <div class="scroll-item">横向第一个方块</div>
        <div class="scroll-item">横向第二个方块</div>
        <div class="scroll-item">横向第三个方块</div>
        <div class="scroll-item">横向第四个方块</div>
        <div class="scroll-item">横向第五个方块</div>
        <div class="scroll-item">横向第六个方块</div>
        <div class="scroll-item">横向第七个方块</div>
      </div>
    </div>
    <div
      ref="page3Ref"
      class="section page3"
      :style="page3StyleVars"
      @mousemove="onPage3PointerMove"
      @mouseleave="onPage3PointerLeave"
    >
      <div class="page3-scene">
        <div class="scene-glow"></div>
        <div class="scene-aurora"></div>
        <div class="scene-layer scene-layer-far"></div>
        <div class="scene-layer scene-layer-mid"></div>
        <div class="scene-layer scene-layer-near"></div>
        <div class="scene-ring"></div>
        <div class="scene-card scene-card-a">VUE</div>
        <div class="scene-card scene-card-b">PARALLAX</div>
        <div class="scene-card scene-card-c">3D</div>
        <span
          v-for="index in starList"
          :key="index"
          class="scene-star"
          :style="getStarStyle(index)"
        ></span>
        <h2 class="scene-title">第三屏 🚀</h2>
        <p class="scene-subtitle">沉浸式视差空间</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const horizontalScrollRef = ref(null)
const containerRef = ref(null)
const page2Ref = ref(null)
const page3Ref = ref(null)
const isHover = ref(false)
const isScrolling = ref(false)
const page3Progress = ref(0)
const pointerX = ref(0.5)
const pointerY = ref(0.5)
const glowX = ref(50)
const glowY = ref(50)
const starList = Array.from({ length: 22 }, (_, index) => index + 1)

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const page3StyleVars = computed(() => ({
  '--p': String(page3Progress.value),
  '--mx': String(pointerX.value),
  '--my': String(pointerY.value),
  '--gx': `${glowX.value}%`,
  '--gy': `${glowY.value}%`
}))

const getStarStyle = (index) => {
  const left = (index * 13.7) % 100
  const top = (index * 29.3) % 100
  const size = 2 + (index % 4)
  const duration = 4 + (index % 5)
  const delay = (index % 6) * 0.35
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

const updatePage3Progress = () => {
  const container = containerRef.value
  const page3 = page3Ref.value
  if (!container || !page3) return
  const viewportTop = container.scrollTop
  const viewportHeight = container.clientHeight
  const sectionTop = page3.offsetTop
  const sectionHeight = page3.clientHeight
  const start = sectionTop - viewportHeight
  const end = sectionTop + sectionHeight
  page3Progress.value = clamp((viewportTop - start) / (end - start), 0, 1)
}

const onPage3PointerMove = (event) => {
  const page3 = page3Ref.value
  if (!page3) return
  const rect = page3.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  pointerX.value = clamp(x, 0, 1)
  pointerY.value = clamp(y, 0, 1)
  glowX.value = pointerX.value * 100
  glowY.value = pointerY.value * 100
}

const onPage3PointerLeave = () => {
  pointerX.value = 0.5
  pointerY.value = 0.5
  glowX.value = 50
  glowY.value = 50
}

const onHorizontalWheel = (e) => {
  const el = horizontalScrollRef.value
  if (!isHover.value || !el) return

  const isLeftEdge = el.scrollLeft <= 2
  const isRightEdge = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
  const scrollUp = e.deltaY < 0
  const scrollDown = e.deltaY > 0

  if ((isLeftEdge && scrollUp) || (isRightEdge && scrollDown)) return

  e.preventDefault()
  el.scrollLeft += e.deltaY * 3
}

const onPageWheel = (e) => {
  if (isHover.value) return
  if (isScrolling.value) return

  const container = containerRef.value
  const scrollTop = container.scrollTop
  const page2Top = page2Ref.value.offsetTop
  const page3Top = page3Ref.value?.offsetTop ?? Number.MAX_SAFE_INTEGER
  const wheelDown = e.deltaY > 0
  const wheelUp = e.deltaY < 0

  if (scrollTop < 100 && wheelDown) {
    e.preventDefault()
    isScrolling.value = true
    container.scrollTo({ top: page2Top, behavior: 'smooth' })
    setTimeout(() => (isScrolling.value = false), 500)
  }

  // if (scrollTop >= page2Top - 100 && scrollTop < page3Top - 100 && wheelUp) {
  //   e.preventDefault()
  //   isScrolling.value = true
  //   container.scrollTo({ top: 0, behavior: 'smooth' })
  //   setTimeout(() => (isScrolling.value = false), 500)
  // }
}

onMounted(() => {
  const container = containerRef.value
  if (!container) return
  container.addEventListener('scroll', updatePage3Progress, { passive: true })
  updatePage3Progress()
})

onBeforeUnmount(() => {
  const container = containerRef.value
  if (!container) return
  container.removeEventListener('scroll', updatePage3Progress)
})
</script>

<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.container {
  height: 100vh;
  overflow: auto;
  background: rgb(242, 214, 219);
}
.section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #fff;
  gap: 20px;
}
.page1 { background: #1a1a1a; }
.page2 { background: #42b983; }
.page3 {
  position: relative;
  height: 100vh;
  justify-content: flex-start;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(116, 109, 255, 0.3), transparent 38%),
    radial-gradient(circle at 82% 18%, rgba(57, 219, 255, 0.25), transparent 35%),
    linear-gradient(180deg, #070d2b 0%, #0d1d48 42%, #1b3f5d 100%);
}
.page3-scene {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1200px;
}
.scene-glow {
  position: absolute;
  inset: -15%;
  background: radial-gradient(circle at var(--gx) var(--gy), rgba(116, 193, 255, 0.5), transparent 40%);
  transform: translate3d(0, calc(var(--p) * -120px), -40px);
}
.scene-aurora {
  position: absolute;
  inset: 0;
  background:
    conic-gradient(from 150deg at 60% 10%, rgba(125, 95, 255, 0.35), rgba(24, 215, 255, 0.3), rgba(125, 95, 255, 0.35));
  mix-blend-mode: screen;
  filter: blur(30px);
  opacity: 0.7;
  transform: translate3d(calc((var(--mx) - 0.5) * 80px), calc(var(--p) * -100px), -280px);
}
.scene-layer {
  position: absolute;
  left: -5%;
  width: 110%;
  border-radius: 40% 60% 0 0;
}
.scene-layer-far {
  bottom: -13%;
  height: 44%;
  background: linear-gradient(180deg, #20496d 0%, #0b274f 100%);
  transform: translate3d(calc((var(--mx) - 0.5) * 50px), calc(var(--p) * -70px), -280px);
}
.scene-layer-mid {
  bottom: -16%;
  height: 40%;
  background: linear-gradient(180deg, #1d5d71 0%, #12385f 90%);
  transform: translate3d(calc((var(--mx) - 0.5) * 90px), calc(var(--p) * -120px), -140px);
}
.scene-layer-near {
  bottom: -25%;
  height: 45%;
  background: linear-gradient(180deg, #2f8ca0 0%, #225080 100%);
  transform: translate3d(calc((var(--mx) - 0.5) * 140px), calc(var(--p) * -180px), -20px);
}
.scene-ring {
  position: absolute;
  top: 16%;
  right: 14%;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  border: 2px solid rgba(194, 242, 255, 0.8);
  box-shadow: 0 0 45px rgba(92, 190, 255, 0.6);
  transform: translate3d(calc((var(--mx) - 0.5) * 90px), calc(var(--p) * -150px), 100px) rotate(calc(var(--p) * 120deg));
}
.scene-card {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 100px;
  border-radius: 20px;
  color: #fff;
  font-size: 24px;
  letter-spacing: 2px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 18px 36px rgba(6, 26, 59, 0.4);
}
.scene-card-a {
  top: 22%;
  left: 12%;
  background: linear-gradient(130deg, rgba(132, 111, 255, 0.75), rgba(77, 202, 255, 0.45));
  transform: translate3d(calc((var(--mx) - 0.5) * 110px), calc(var(--p) * -160px), 220px);
}
.scene-card-b {
  top: 44%;
  right: 22%;
  background: linear-gradient(130deg, rgba(57, 219, 255, 0.65), rgba(70, 116, 255, 0.55));
  transform: translate3d(calc((var(--mx) - 0.5) * -95px), calc(var(--p) * -210px), 140px);
}
.scene-card-c {
  top: 62%;
  left: 24%;
  background: linear-gradient(130deg, rgba(255, 168, 105, 0.6), rgba(255, 95, 140, 0.55));
  transform: translate3d(calc((var(--mx) - 0.5) * 70px), calc(var(--p) * -230px), 60px);
}
.scene-star {
  position: absolute;
  border-radius: 999px;
  background: rgba(232, 250, 255, 0.95);
  box-shadow: 0 0 12px rgba(176, 248, 255, 0.8);
  animation-name: starPulse;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
.scene-title {
  position: absolute;
  top: 30%;
  left: 50%;
  margin: 0;
  color: #eaf9ff;
  font-size: 72px;
  letter-spacing: 6px;
  transform: translate3d(-50%, calc(var(--p) * -200px), 240px);
  text-shadow: 0 14px 36px rgba(5, 19, 48, 0.45);
}
.scene-subtitle {
  position: absolute;
  top: 42%;
  left: 50%;
  margin: 0;
  color: rgba(231, 248, 255, 0.95);
  font-size: 24px;
  letter-spacing: 8px;
  transform: translate3d(-50%, calc(var(--p) * -220px), 180px);
}
@keyframes starPulse {
  0%, 100% {
    opacity: 0.25;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.95;
    transform: scale(1.2);
  }
}

.horizontal-scroll-area {
  width: 100%;
  height: 800px;
  border: 2px solid #fff;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
}
.scroll-item {
  flex: 0 0 500px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  background: pink;
  margin: 0 10px;
}

.horizontal-scroll-area::-webkit-scrollbar {
  display: none;
}
</style>
