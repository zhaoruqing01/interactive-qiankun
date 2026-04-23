<template>
  <div>
    <h1>拖拽练习</h1>
    <div class="drag-box-container">
      <div class="box1">
        <!-- h2 保留，不影响拖拽 -->
        <h2>鼠标事件实现拖拽</h2>
        <div 
          class="drag-box01" 
          ref="dragBox" 
          @mousedown="handleMouseDown"
        >
        </div>
      </div>
      <div class="box2">
        <h2>第三方库实现拖拽</h2>
        <ul ref="listUlRef">
          <li v-for="item in listArr" :key="item.id">
            <div>{{ item.name }}</div>
            <el-icon class="drag-handle"><Rank /></el-icon>
          </li>
        </ul>
        <div class="share-drag-box">
          <h3>两个表单之间拖拽元素</h3>
          <div class="box2-dragBox-container">
                      <ul ref="firstListUlRef" class="first-list">
            <li v-for="item in firstListArr" :key="item.id">
              <div>{{ item.name }}</div>
              <el-icon class="drag-handle"><Rank /></el-icon>
            </li>
          </ul>
               <ul ref="secondListUlRef" class="second-list">
            <li v-for="item in seconedListArr" :key="item.id">
              <div>{{ item?.name || '无' }}</div>
              <el-icon class="drag-handle"><Rank /></el-icon>
            </li>
          </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Rank } from '@element-plus/icons-vue'

//===========
// 鼠标事件实现拖拽
//===========

const dragBox = ref<HTMLDivElement>()
const isDragging = ref(false)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
// 存储 h2 高度，用于计算拖拽范围
const titleHeight = ref(0)

// 页面挂载：获取h2高度，绑定全局事件
onMounted(() => {
  const title = document.querySelector('.box1 h2') as HTMLHeadingElement
  titleHeight.value = title.offsetHeight
  // 全局绑定鼠标事件
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('mousemove', handleMouseMove)
})

// 页面卸载：清除事件（防止内存泄漏）
onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousemove', handleMouseMove)
})

// 鼠标按下
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  // 计算鼠标相对于元素左上角的偏移
  dragOffsetX.value = e.clientX - dragBox.value!.offsetLeft
  dragOffsetY.value = e.clientY - dragBox.value!.offsetTop
  dragBox.value!.classList.add('move-active')
}

// 鼠标松开
const handleMouseUp = () => {
  isDragging.value = false
  dragBox.value?.classList.remove('move-active')
}

// 鼠标移动（全局监听）
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  const box = dragBox.value!
  const parent = box.parentElement!

  // 计算最大拖拽范围
  const maxX = parent.offsetWidth - box.offsetWidth
  // 关键：扣除 h2 的高度！
  const maxY = parent.offsetHeight - titleHeight.value - box.offsetHeight

  // 计算新位置（限制在父容器内）
  const newX = Math.max(0, Math.min(maxX, e.clientX - dragOffsetX.value))
  const newY = Math.max(titleHeight.value, Math.min(maxY + titleHeight.value, e.clientY - dragOffsetY.value))

  // 设置位置
  box.style.left = `${newX}px`
  box.style.top = `${newY}px`
}


// ==============
// 第三方库实现拖拽
// ==============
import Sortable from 'sortablejs'

const listArr = ref([
  {
    id: 1,
    name: '1'
  },
  {
    id: 2,
    name: '2'
  },
  {
    id: 3,
    name: '3'
  },
])
// 获取实例
const listUlRef = ref<HTMLUListElement>()
// 存储实例,用于销毁
let sortableInstance: any = null

// 单个表单之间的拖拽
const initListArr = ()=>{
// 初始化 Sortable.js
  sortableInstance = Sortable.create(listUlRef.value!, {
    animation: 150, // 拖拽动画(毫秒)
    handle: '.drag-handle', // 自定义手柄选择器
    // ghostClass: 'sortable-ghost', // 拖拽元素的类名
    // chosenClass: 'sortable-chosen', // 选中元素的类名

    // [核心] 拖拽结束后同步更新响应式数据
    onEnd: (evt) => {
      // 元素交换后，更新数组顺序,原索引/新索引
      const { oldIndex, newIndex } = evt
      const movedItem = listArr.value.splice(oldIndex, 1)[0]
      listArr.value.splice(newIndex, 0, movedItem)
    }
  })
}

// 两个表单之间的元素拖拽
const firstListArr = ref([
  {
    id: 1,
    name: '1'
  },
  {
    id: 2,
    name: '2'
  },
  {
    id: 3,  
    name: '3'
  },
])
// 拖拽新增的列表,数据由第一个列表拖拽进入
const seconedListArr = ref([])
// 获取实例
const firstListUlRef = ref<HTMLUListElement>()
const secondListUlRef = ref<HTMLUListElement>()
// 存储实例,用于销毁
let firstSortableInstance: any = null
let secondSortableInstance: any = null

const initFirstListArr = () => {
  firstSortableInstance = Sortable.create(firstListUlRef.value!, {
    animation: 150,
    handle: '.drag-handle',
    group: 'shared',
    onEnd: (evt) => {
      console.log(evt);
      
      
      const { oldIndex, newIndex, from, to } = evt
      // 如果是在同一个列表内排序
      if (from === to) {
        if (oldIndex !== undefined && newIndex !== undefined) {
          const movedItem = firstListArr.value.splice(oldIndex, 1)[0]
          firstListArr.value.splice(newIndex, 0, movedItem)
        }
      } else {
        // 如果是跨列表移动（从第一个列表移出）
        if (oldIndex !== undefined && newIndex !== undefined) {
          const movedItem = firstListArr.value.splice(oldIndex, 1)[0]
          seconedListArr.value.splice(newIndex, 0, movedItem)
        }
      }
    }
  })
}
const initSecondListArr = () => {
  secondSortableInstance = Sortable.create(secondListUlRef.value!, {
    animation: 150,
    handle: '.drag-handle',
    group: 'shared',
    onEnd: (evt) => {
      const { oldIndex, newIndex, from, to } = evt
      // 如果是在同一个列表内排序
      if (from === to) {
        if (oldIndex !== undefined && newIndex !== undefined) {
          const movedItem = seconedListArr.value.splice(oldIndex, 1)[0]
          seconedListArr.value.splice(newIndex, 0, movedItem)
        }
      } else {
        // 如果是跨列表移动（从第二个列表移出）
        if (oldIndex !== undefined && newIndex !== undefined) {
          const movedItem = seconedListArr.value.splice(oldIndex, 1)[0]
          firstListArr.value.splice(newIndex, 0, movedItem)
        }
      }
    }
  })
}
onMounted(()=>{
  initListArr()
  initFirstListArr()
  initSecondListArr()
})

// 页面卸载：销毁实例（防止内存泄漏）
onUnmounted(() => {
  sortableInstance.destroy()
  firstSortableInstance.destroy()
  secondSortableInstance.destroy()
})
</script>

<style scoped>
.drag-box-container {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 500px;
  border: 1px solid #ccc;
}

.box1 {
  flex: 0.5;
  position: relative;
  border: 1px solid #ccc;
}

/* 修复：移除 transform，纯绝对定位，不干扰 offset 计算 */
.drag-box01 {
  position: absolute;
  left: 100px; /* 初始位置 */
  top: 100px;
  width: 200px;
  height: 200px;
  background-color: #ff7a7a;
  cursor: grab;
}

.move-active {
  opacity: 0.8;
  cursor: grabbing;
}
.box2 {
  flex: 0.5;
  position: relative;
  border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 0.5;
}
li {
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.el-icon {
  cursor: grabbing;
}
.share-drag-box {
  flex: 0.5;
  position: relative;
  border: 1px solid #534848;
}
.box2-dragBox-container {
  display: flex;
  gap: 20px;
  width: 100%;
  border: 1px solid #ccc;
}
.first-list {
  background-color: pink;
}
.second-list {
  background-color: lightblue;
}
</style>