<template>
  <div class="agv-preview-page">
    <div
      class="agv-map-canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <canvas :width="width" :height="height" ref="canvas"></canvas>
      <el-popover
        v-for="item in pointList"
        :key="item.name + item.posX"
        placement="top-start"
        :title="item.name"
        :width="200"
        trigger="hover"
        :content="item.type"
      >
        <template #reference>
          <div
            class="agv-point"
            :class="{ 'agv-point-work': item.type === 'WORK_MARKER' }"
            :style="{
              top: item.posY + 'px',
              left: item.posX + 'px',
            }"
          ></div>
        </template>
      </el-popover>
      <!-- <svg-icon
        name="icon-agv"
        :size="30"
        color="#17c923"
        :style="{ ...handleAgvPos(), position: 'absolute' }"
        v-if="isConnected"
      ></svg-icon> -->
      <div
        v-for="item in dragItemList"
        :key="item.name + item.id"
        class="icon-box"
        :style="{
          left: item.x + 'px',
          top: item.y + 'px',
          transform: item.rotate ? `rotate(${item.rotate}deg)` : '',
        }"
      >
        <SvgIconRemote
          :svgUrl="item.url!"
          :size="Math.min(item.width, item.height)"
          :color="item.color"
          v-if="item.type === '_svg' || item.type === 'car'"
        />
        <div
          v-else-if="item.type === 'line'"
          class="drag-line"
          :style="{
            width: item.width + 'px',
            height: item.height + 'px',
            backgroundColor: item.color,
          }"
        ></div>
        <div
          v-else-if="item.type === 'point'"
          class="drag-point"
          :style="{
            borderRadius: item.width / 2 + 'px',
            backgroundColor: item.color,
            width: item.width + 'px',
            height: item.height + 'px',
          }"
        ></div>
        <div
          v-else-if="item.type === 'text'"
          class="drag-text"
          :style="{ color: item.color, fontSize: item.fontSize + 'px' }"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RobotPositionInfo } from ".";
import useMqtt from "@/utils/useMqtt";
import { DragItem, LineInfo, PointInfo } from "../agvEdit";
import { getMapInfoApi } from "@/api/api";

const props = withDefaults(
  defineProps<{
    id?: string;
    width?: number;
    height?: number;
    pointList?: PointInfo[];
    lineList?: LineInfo[];
    dragItemList?: Array<DragItem>;
    mqttUrl?: string;
  }>(),
  {
    width: 1160,
    height: 513,
    pointList: () => [],
    lineList: () => [],
    dragItemList: () => [],
    mqttUrl: "192.168.1.88:8083",
  }
);

const width = ref<number>(props.width);
const height = ref<number>(props.height);
const pointList = ref<PointInfo[]>(props.pointList);
const lineList = ref<LineInfo[]>(props.lineList);
const dragItemList = ref<DragItem[]>(props.dragItemList);
const mqttUrl = ref<string>(props.mqttUrl);

const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
  useMqtt();

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
  lineList.value.forEach((item) => {
    const startPoint = pointList.value.find((i) => i.name === item.startPoint);
    const endPoint = pointList.value.find((i) => i.name === item.endPoint);
    if (!startPoint || !endPoint || !ctx) return;
    console.log("lineList::", item.startPosY);
    ctx.beginPath();
    ctx.moveTo(item.startPosX, item.startPosY);
    ctx.lineTo(item.endPosX, item.endPosY);
    ctx.strokeStyle = "#bbb";
    ctx.stroke();
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

const handleInit = () => {
  if (mqttUrl.value) {
    initMqtt(`ws://${mqttUrl.value}`, { path: "/mqtt" });
  }
  if (lineList.value.length > 0 && canvas.value) {
    ctx = canvas.value.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
    // ctx.translate(0, canvas.value.height);

    drawLines();
  }
};

onMounted(() => {
  if (props.id) {
    getMapInfoApi(props.id).then((res: any) => {
      if (res.code !== 200) {
        ElMessage.warning(res.message);
        return;
      }
      width.value = res.data.width;
      height.value = res.data.height;
      pointList.value = res.data.dragMapPointDTOS || [];
      lineList.value = res.data.dragMapLineDTOS || [];
      dragItemList.value = res.data.dragIconMaps || [];
      mqttUrl.value = res.data.mqttUrl;

      handleInit();
    });
  } else {
    handleInit();
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
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background-color: #00a5ff;
}
.agv-point-work {
  background-color: #ff7e67;
}

.icon-box {
  position: absolute;
}
.drag-line {
  border-radius: 1px;
  background-color: #1a5cd7;
  width: 100%;
  height: 100%;
}
.drag-point {
  background-color: #6ba785;
  width: 100%;
  height: 100%;
}
.drag-text {
  font-size: 24px;
  cursor: default;
}

.drag-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
}
</style>
