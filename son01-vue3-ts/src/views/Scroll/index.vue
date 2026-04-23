<!-- 滚动交互练习 -->
<template>
  <div class="scroll-container" ref="scrollContainerRef">
    <!-- 回到顶部按钮 -->
    <div class="back-top" @click="backToTop">
      <el-icon><ArrowUpBold /></el-icon>
    </div>
    <!-- nav-bar -->
    <div class="search-area"></div>
    <!-- 占位元素，防止吸顶后内容上跳 -->
    <div class="nav-placeholder" v-show="scrollY > 160"></div>

    <div class="nav-bar" :class="{ fixed: scrollY > 80 }">
      nav-bar
    </div>
    <div class="scroll-content">
        <!-- 点击跳转到某一个元素的位置 -->
         <el-button @click="scrollToElement">点击跳转</el-button>
         <el-button @click="goToOfficialWebsite">到官网</el-button>
        <div v-for="i in 200" :key="i">
            内容{{ i }}
        </div>
        <!-- 点击跳转到某一个元素的位置 -->
        <div class="target-element" ref="targetElementRef">目标元素</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useScroll } from '@vueuse/core'
import { ArrowUpBold } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const scrollContainerRef = ref(null)
const targetElementRef = ref(null)

const { y: scrollY } = useScroll(scrollContainerRef)

// 回到顶部
const backToTop = () => {
  scrollContainerRef.value.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 点击跳转到某个元素的位置
const scrollToElement = () => {
    scrollContainerRef.value.scrollTo({
        top: targetElementRef.value.offsetTop,
        behavior: 'smooth'
    })
}

// 点击跳转到官网
const goToOfficialWebsite = () => {
    router.push({ name: 'Official' })
}
</script>

<style scoped lang="scss">
.scroll-container {
    height: 100%;
  overflow: auto;
  background-color: rgb(242, 214, 219);
  position: relative;
   scroll-behavior: smooth;
}

.back-top {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  z-index: 99;
}

.search-area {
  height: 80px;
  line-height: 80px;
  text-align: center;
  background-color: rgb(168, 125, 255);
}

.nav-bar {
  height: 80px;
  line-height: 80px;
  text-align: center;
  background-color: rgb(112, 196, 241);
  width: 100%;
  box-sizing: border-box;
}

/* 吸顶样式 */
.fixed {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 999;
}

/* 占位，防止内容跳动 */
.nav-placeholder {
  height: 80px;
}
.scroll-content{
    height: 3000px;
}
.target-element{
    width: 100px;
    height: 100px;
    background-color: lightblue;
}
</style>