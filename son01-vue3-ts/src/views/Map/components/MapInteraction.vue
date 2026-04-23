<template>
    <div class="map-intteraction">
        <div class="operation-area">
            <el-button type="primary" @click="zoomIn">放大</el-button>
            <el-button type="primary" @click="zoomOut">缩小</el-button>
            <el-button type="primary" @click="showTrack">显示物流轨迹</el-button>
            <el-button type="primary" @click="playTrackAnimation">播放轨迹动画</el-button>
        </div>
        
        <div id="map" style="height: 500px;"></div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const map = ref(null)
const mapKey = '75e7e73e950401aa1362427451d2cc69' // 高德地图官方的key
let trackLine = null // 轨迹线实例
let trackMarkers = [] // 轨迹节点标注数组
let animationMarker = null // 动画标记（模拟运输车辆）

// 模拟物流轨迹数据（真实场景从后端接口获取）
const logisticsTrackData = {
  // 轨迹点：按时间排序的经纬度（示例：北京→廊坊→天津）
  path: [
    [116.481028, 39.921983], // 起点：北京朝阳区（揽收）
    [116.707507, 39.536073], // 中转：廊坊（中转中心）
    [117.200983, 39.084158]  // 终点：天津和平区（签收）
  ],
  // 节点信息：对应path的每个点
  nodes: [
    { name: '北京朝阳区', status: '揽收', time: '2026-03-24 08:00' },
    { name: '廊坊中转中心', status: '中转', time: '2026-03-24 12:00' },
    { name: '天津和平区', status: '派送', time: '2026-03-24 18:00' }
  ]
}

// 显示物流轨迹
const showTrack = ()=>{
    if(!map.value || !logisticsTrackData.path.length){
        return
    }
    // 步骤1: 绘制物流轨迹
    trackLine = new window.AMap.Polyline({
        path: logisticsTrackData.path,
        strokeColor: '#3366FF', // 线颜色
        strokeOpacity: 0.8, // 线透明度
        strokeWeight: 6, // 线粗细
        strokeStyle: 'solid' // 线样式
    })
    // 地图挂载轨迹线
    map.value.add(trackLine)

    // 步骤2：标注轨迹节点（起点/中转/终点）
    logisticsTrackData.path.forEach((point, index) => {
      const node = logisticsTrackData.nodes[index]
      // 不同节点用不同图标/颜色
      let iconUrl = ''
      let markerTitle = `${node!.name} - ${node!.status}（${node!.time}）`
      // 起点：绿色图标
      if (index === 0) {
        iconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_g.png'
      }
      // 中转：黄色图标
      else if (index === logisticsTrackData.path.length - 2) {
        iconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_y.png'
      }
      // 终点：红色图标
      else if (index === logisticsTrackData.path.length - 1) {
        iconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
      }
      // 创建节点标注
      const marker = new window.AMap.Marker({
        position: point,
        title: markerTitle,
        icon: iconUrl,
        offset: new window.AMap.Pixel(-13, -30)
      })
      map.value.add(marker)
      trackMarkers.push(marker) // 存入数组，方便后续清空
          // 节点点击弹窗：显示物流节点详情
    marker.on('click', () => {
      const infoWindow = new window.AMap.InfoWindow({
        content: `
          <div style="padding:10px;min-width:200px;">
            <h4 style="margin:0 0 5px 0;color:#333;">${node!.name}</h4>
            <p style="margin:0 0 3px 0;">状态：${node!.status}</p>
            <p style="margin:0;color:#999;">时间：${node!.time}</p>
          </div>
        `,
        offset: new window.AMap.Pixel(0, -30)
      })
      infoWindow.open(map, point)
    })
  })
}

const loadAmapSDK = () => {
  return new Promise((resolve) => {
    if (window.AMap) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${mapKey}` // 替换成你的Key
    script.type = 'text/javascript'
    script.onload = () => {
      resolve()
    }
    document.body.appendChild(script)
  })
}

// 获取当前位置
const getCurrentPosition = () => {
  if(!map.value) {
    return
  }
  map.value.plugin(['AMap.Geolocation'], () => {
    // 配置属性
    const geolocation = new window.AMap.Geolocation({
      enableHighAccuracy: true, // 是否使用高精度定位，默认:true
      timeout: 10000, // 定位超时时间，默认：无穷大
      maximumAge: 0, // 定位结果缓存0毫秒，默认：0
      convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
      showButton: true, // 显示定位按钮，默认：true
      buttonPosition: 'LB', // 定位按钮停靠位置，默认：'LB'，左下角
      buttonOffset: new window.AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
      showMarker: true, // 定位成功后在定位到的位置显示点标记，默认：true
      showCircle: true, // 定位成功后用圆圈表示定位精度范围，默认：true
      panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
      zoomToAccuracy: true // 定位成功后调整地图视野范围使定位精度范围可见，默认：false
    })
    // 挂载属性
    map.value.addControl(geolocation)
    geolocation.getCurrentPosition((status, result) => {
      if(status === 'complete') {
        map.value.setCenter(result.position)
        // 定位成功后，将定位到的位置作为地图中心点
        map.value.setZoom(13)
      }
    })
  })
}

// 初始化地图
const initMap = () => {
  map.value = new window.AMap.Map('map', {
    center: [116.397428, 30.90923],
    zoom: 13
  })
}
// 放大地图
const zoomIn = () => {
  map.value.zoomIn()
}
// 缩小地图
const zoomOut = () => {
  map.value.zoomOut()
}

// 5. 轨迹动画（模拟物流运输）
const playTrackAnimation = () => {
  if (!map || !logisticsTrackData.path.length) return
  // 先清空原有动画标记
  if (animationMarker) map.remove(animationMarker)

  // 创建动画标记（模拟物流车）
  animationMarker = new window.AMap.Marker({
    position: logisticsTrackData.path[0], // 从起点开始
    icon: 'https://webapi.amap.com/theme/v1.3/markers/car.png', // 车辆图标
    offset: new window.AMap.Pixel(-15, -15)
  })
  map.add(animationMarker)

  // 逐点移动动画（模拟运输过程）
  let currentIndex = 0
  const moveInterval = setInterval(() => {
    currentIndex++
    // 到达终点停止动画
    if (currentIndex >= logisticsTrackData.path.length) {
      clearInterval(moveInterval)
      alert('物流运输完成！已到达终点')
      return
    }
    // 移动到下一个轨迹点
    animationMarker.setPosition(logisticsTrackData.path[currentIndex])
    // 地图跟随移动
    map.setCenter(logisticsTrackData.path[currentIndex])
  }, 1000) // 1秒移动一个点，可调整速度
}
onMounted(() => {
  loadAmapSDK().then(() => {
    initMap()
    getCurrentPosition()
  })
})
onUnmounted(() => {
  map.value = null
})
</script>
<style scoped>
.map-interaction {
  height: 500px;
}
.map-interaction #map {
  height: 300px;
}
</style>
