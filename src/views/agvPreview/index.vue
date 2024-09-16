<template>
  <div class="agv-preview-page">
    <div class="agv-map-canvas">
      <canvas height="513" width="1160" ref="canvas"></canvas>
      <el-popover
        v-for="item in mapInfo.point"
        :key="item.code"
        placement="top-start"
        :title="item.code"
        :width="200"
        trigger="hover"
        :content="item.type"
      >
        <template #reference>
          <div
            class="agv-point"
            :class="{ 'agv-point-work': item.type === 'WORK_MARKER' }"
            :style="{
              bottom: handlePosition(item.y, -3) + 'px',
              left: handlePosition(item.x, -3) + 'px',
            }"
          ></div>
        </template>
      </el-popover>
      <svg-icon
        name="icon-agv"
        :size="30"
        color="#17c923"
        :style="{ ...handleAgvPos(), position: 'absolute' }"
        v-if="isConnected"
      ></svg-icon>
      <div class="map-line map-line-1"></div>
      <div class="map-line map-line-2"></div>
      <div class="map-line map-line-3"></div>
      <div class="map-line map-line-4"></div>
      <div class="map-line map-line-5"></div>
      <div class="map-line map-line-6"></div>
      <div class="map-line map-line-7"></div>
      <div
        v-for="item in svgIconList"
        :key="item.name + item.class"
        :class="item.class"
        class="icon-box"
      >
        <svg-icon
          :name="item.name"
          :size="item.size"
          :color="item.color"
        ></svg-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { MapInfo, RobotPositionInfo } from ".";
import useMqtt from "@/utils/useMqtt";

const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
  useMqtt();

// 模拟地图信息
const mapInfo: MapInfo = {
  point: [
    {
      code: "1",
      angle: 92.57369821346488,
      type: "WORK_MARKER",
      x: 56.82500250538319,
      y: 2.488489948829137,
    },
    {
      code: "2",
      angle: 86.86752393878264,
      type: "NAVIGATION_MARKER",
      x: 57.14381219639125,
      y: 27.920829711059316,
    },
    {
      code: "3",
      angle: 177.6836978336082,
      type: "NAVIGATION_MARKER",
      x: 41.85130132956921,
      y: 28.60717028894068,
    },
    {
      code: "4",
      angle: 179.42161796439916,
      type: "WORK_MARKER",
      x: 17.479,
      y: 29.233,
    },
    {
      code: "5",
      angle: 1.8979388314748595,
      type: "NAVIGATION_MARKER",
      x: 57.285,
      y: 25.263,
    },
    {
      code: "6",
      angle: -0.48348799922970953,
      type: "NAVIGATION_MARKER",
      x: 59.306,
      y: 25.249,
    },
  ],
  path: [
    {
      startControl: { x: 51.027, y: 28.195 },
      endControl: { x: 47.968, y: 28.333 },
    },
    {
      startControl: { x: 58.093, y: 25.257 },
      endControl: { x: 58.498, y: 25.255 },
    },
    {
      startControl: { x: 27.228, y: 28.983 },
      endControl: { x: 32.102, y: 28.858 },
    },
    {
      startControl: { x: 57.009, y: 11.598 },
      endControl: { x: 57.101, y: 16.153 },
    },
    {
      startControl: { x: 57.229, y: 26.326 },
      endControl: { x: 57.2, y: 26.858 },
    },
  ],
  slidePath: [
    {
      startControl: { x: 32.102, y: 28.858 },
      endControl: { x: 27.228, y: 28.983 },
    },
    {
      startControl: { x: 57.2, y: 26.858 },
      endControl: { x: 57.229, y: 26.326 },
    },
    {
      startControl: { x: 58.498, y: 25.255 },
      endControl: { x: 58.093, y: 25.257 },
    },
    {
      startControl: { x: 51.027, y: 28.195 },
      endControl: { x: 47.968, y: 28.333 },
    },
    {
      startControl: { x: 57.101, y: 16.153 },
      endControl: { x: 57.009, y: 11.598 },
    },
    {
      startControl: { x: 47.968, y: 28.333 },
      endControl: { x: 51.027, y: 28.195 },
    },
    {
      startControl: { x: 57.009, y: 11.598 },
      endControl: { x: 57.101, y: 16.153 },
    },
    {
      startControl: { x: 57.229, y: 26.326 },
      endControl: { x: 57.2, y: 26.858 },
    },
    {
      startControl: { x: 58.093, y: 25.257 },
      endControl: { x: 58.498, y: 25.255 },
    },
    {
      startControl: { x: 27.228, y: 28.983 },
      endControl: { x: 32.102, y: 28.858 },
    },
  ],
  pathPoint: [
    { startPoint: "4", endPoint: "3" },
    { startPoint: "3", endPoint: "2" },
    { startPoint: "2", endPoint: "5" },
    { startPoint: "5", endPoint: "1" },
    { startPoint: "6", endPoint: "5" },
  ],
};
// 模拟图标列表
const svgIconList = [
  {
    name: "icon-lab",
    color: "#1296DB",
    label: "工程室",
    class: "icon-lab",
    size: 200,
  },
  {
    name: "icon-lab",
    color: "#1296DB",
    label: "agv实验室",
    class: "icon-lab2",
    size: 200,
  },
  {
    name: "icon-engine-room",
    color: "#1296DB",
    label: "IT设备房",
    class: "icon-engine-room",
    size: 200,
  },
  {
    name: "icon-lift",
    color: "#1296DB",
    label: "电梯",
    class: "icon-lift",
    size: 50,
  },
  {
    name: "icon-stair",
    color: "#1296DB",
    label: "楼梯",
    class: "icon-stair",
    size: 50,
  },
  {
    name: "icon-meetting-room",
    color: "#1296DB",
    label: "会议室1",
    class: "icon-meetting-room",
    size: 100,
  },
  {
    name: "icon-meetting-room",
    color: "#1296DB",
    label: "会议室2",
    class: "icon-meetting-room2",
    size: 100,
  },
  {
    name: "icon-meetting-room",
    color: "#1296DB",
    label: "会议室3",
    class: "icon-meetting-room3",
    size: 100,
  },
  {
    name: "icon-meetting-room",
    color: "#1296DB",
    label: "会议室4",
    class: "icon-meetting-room4",
    size: 200,
  },
  {
    name: "icon-feed",
    color: "#1296DB",
    label: "上料台",
    class: "icon-feed",
    size: 30,
  },
  {
    name: "icon-refuel",
    color: "#1296DB",
    label: "换料台",
    class: "icon-refuel",
    size: 30,
  },
];

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;
const robotCode = ref<string>("30");
const robotPositionInfo = ref<RobotPositionInfo>();

// mqtt订阅小车实时位置信息
const topic = computed(
  () => robotCode.value && `/robot/${robotCode.value}/position`
);

// 坐标修正
const handlePosition = (pos: number, extraPX = 0) => {
  const _pos = ((pos / 3) * 100) / 2;
  return _pos + extraPX;
};
// 路径画线
const drawLines = () => {
  mapInfo.pathPoint.forEach((pointItem) => {
    const item1 = mapInfo.point.find(
      (item) => item.code === pointItem.startPoint
    );
    const x1 = handlePosition(item1!.x);
    const y1 = handlePosition(item1!.y);
    ctx!.moveTo(x1, -y1);
    const item2 = mapInfo.point.find(
      (item) => item.code === pointItem.endPoint
    );
    const x2 = handlePosition(item2!.x);
    const y2 = handlePosition(item2!.y);
    ctx!.lineTo(x2, -y2);
    ctx!.stroke();
  });
};

const handleAgvPos = () => {
  if (!robotPositionInfo.value) return null;
  return {
    bottom: handlePosition(robotPositionInfo.value.y, -15) + "px",
    left: handlePosition(robotPositionInfo.value.x, -15) + "px",
    transform: `rotate(${-robotPositionInfo.value.angle - 90}deg)`,
  };
};

onMounted(() => {
  initMqtt("ws://192.168.1.88", { port: 8083, path: "/mqtt" });
  if (canvas.value) {
    ctx = canvas.value.getContext("2d");
    ctx!.translate(0, canvas.value.height);
    ctx!.strokeStyle = "#bbb";

    drawLines();
  }
});
onUnmounted(() => {
  // 在组件卸载时断开 MQTT 连接
  disconnect();
});
// MQTT连接后订阅消息
watch(
  () => isConnected.value,
  (newValue) => {
    if (newValue && topic.value) {
      subscribeToTopic(topic.value);
    }
  }
);
// 设置小车信息
watch(
  () => messages.value.find((item) => item.topic === topic.value),
  (topicInfo) => {
    if (topicInfo?.msg) {
      console.log(topicInfo.msg.positionStatus.pos_x);
      robotPositionInfo.value = {
        x: topicInfo.msg.positionStatus.pos_x,
        y: topicInfo.msg.positionStatus.pos_y,
        angle: topicInfo.msg.positionStatus.pos_angle,
      };
    }
  },
  { deep: true }
);
</script>
<style scoped>
.agv-preview-page {
  height: 100%;
}
.agv-preview-page::before {
  content: " ";
  display: table;
}
.agv-map-canvas {
  margin: 30px auto;
  width: 1160px;
  height: 513px;
  /* background: url(@/assets/img/map.png); */
  background-size: contain;
  position: relative;
}

.agv-point {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #00a5ff;
}
.agv-point-work {
  background-color: #ff7e67;
}

.map-line {
  position: absolute;
  height: 2px;
  border-radius: 1px;
  width: 100px;
  background-color: #00a5ff;
}
.map-line-1 {
  transform: rotate(1.1deg);
  left: 262px;
  top: 9px;
  width: 847px;
}
.map-line-2 {
  transform: rotate(1.1deg);
  left: 310px;
  top: 54px;
  width: 621px;
}
.map-line-3 {
  transform: rotate(1.1deg);
  left: 977px;
  top: 113px;
  width: 175px;
}
.map-line-4 {
  transform: rotate(91.1deg);
  left: 173px;
  top: 88px;
  width: 175px;
}
.map-line-5 {
  transform: rotate(91.1deg);
  left: 266px;
  top: 91px;
  width: 88px;
}
.map-line-6 {
  transform: rotate(91.1deg);
  left: 700px;
  top: 284px;
  width: 450px;
}
.map-line-7 {
  transform: rotate(91.1deg);
  left: 774px;
  top: 311px;
  width: 400px;
}

.icon-box {
  position: absolute;

  span {
    color: white;
    font-size: 24px;
    position: absolute;
    left: 0;
    bottom: 0;
    min-width: max-content;
  }
}
.icon {
  transform: rotate(1deg);
}
.icon-lab {
  top: 45px;
  left: 315px;

  span {
    left: 59px;
    bottom: -25px;
    transform: rotate(1deg);
  }
}
.icon-lab2 {
  top: 50px;
  left: 515px;

  span {
    left: 38px;
    bottom: -25px;
  }
}
.icon-engine-room {
  top: 60px;
  left: 730px;

  span {
    left: 50px;
    bottom: -12px;
  }
}
.icon-feed {
  top: 460px;
  left: 960px;

  span {
    left: 40px;
    bottom: 2px;
  }
}
.icon-refuel {
  top: -20px;
  left: 280px;

  span {
    left: 40px;
    bottom: 14px;
  }
}
.icon-lift {
  top: 20px;
  left: 1040px;
  transform: rotate(91deg);

  span {
    left: -5px;
    bottom: 70px;
    transform: rotate(-89deg);
  }
}
.icon-stair {
  top: 70px;
  left: 1040px;
  transform: rotate(91deg);

  span {
    left: -5px;
    bottom: 70px;
    transform: rotate(-89deg);
  }
}
.icon-meetting-room {
  top: 120px;
  left: 980px;

  span {
    left: 100px;
    bottom: 38px;
  }
}
.icon-meetting-room2 {
  top: 220px;
  left: 980px;

  span {
    left: 100px;
    bottom: 38px;
  }
}
.icon-meetting-room3 {
  top: 320px;
  left: 980px;

  span {
    left: 100px;
    bottom: 38px;
  }
}
.icon-meetting-room4 {
  top: 260px;
  left: 730px;

  span {
    left: 52px;
    bottom: -8px;
  }
}
</style>
