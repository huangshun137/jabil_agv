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
      <template v-if="isConnected && carList.length > 0">
        <SvgIconRemote
          v-for="item in carList"
          :svgUrl="item.url!"
          :size="Math.min(item.width, item.height)"
          :color="item.color"
          :style="{ ...handleAgvPos(item), position: 'absolute' }"
        />
      </template>
      <div
        v-for="item in dragItemList"
        :key="item.name + item.id"
        class="icon-box"
        :class="{ 'icon-device': item.type === 'device' && item.deviceId }"
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
          v-if="item.type === '_svg'"
        />
        <template v-if="item.type === 'device'">
          <SvgIconRemote
            :svgUrl="item.url!"
            :size="Math.min(item.width, item.height)"
            :color="item.color"
            v-if="!item.deviceData || !item.deviceData.length"
          />
          <div
            v-else
            class="device-info"
            :style="{
              width: item.width + 'px',
              height: item.height + 'px',
              borderColor: item.color,
            }"
          >
            <div class="info-title">{{ item.deviceName }}</div>
            <p
              class="info"
              v-for="deviceInfo in item.deviceData"
              :class="{
                'info-btn':
                  !!deviceInfo.bgColor ||
                  deviceInfo.options?.some((i) => i.bgColor),
              }"
              :key="deviceInfo.keyName + item.deviceCode"
              :style="{
                backgroundColor: deviceInfo.bgColor || 'transparent',
                color: deviceInfo.ownColor || 'white',
                fontSize: (deviceInfo.fontSize || 12) + 'px',
              }"
            >
              {{ deviceInfo.label
              }}<template v-if="deviceInfo.label">：</template>
              {{ deviceInfo.showKeyValue }}
            </p>
          </div>
        </template>
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
import { onMounted, onUnmounted, ref, watch } from "vue";
import useMqtt from "@/utils/useMqtt";
import { DragItem, LineInfo, PointInfo } from "../agvEdit";
import { RobotInfo } from "../agvList";
import { pxToMeterRate } from "@/constant/constant";
import { extractNumber } from "@/utils/utils";
import { DeviceItemShow, DragItemShow } from ".";

const props = withDefaults(
  defineProps<{
    width: number;
    height: number;
    scale: number;
    pointList: PointInfo[];
    lineList: LineInfo[];
    dragItemList: Array<DragItem>;
    mqttUrl?: string;
    robotList: Array<RobotInfo>;
  }>(),
  {
    mqttUrl: import.meta.env.VITE_APP_WS_URL,
  }
);

const width = ref<number>(props.width);
const height = ref<number>(props.height);
const pointList = ref<PointInfo[]>(props.pointList);
const lineList = ref<LineInfo[]>(props.lineList);
const dragItemList = ref<DragItemShow[]>(
  JSON.parse(
    JSON.stringify(props.dragItemList.filter((item) => item.type !== "car"))
  )
);
const carList = ref<DragItem[]>(
  JSON.parse(
    JSON.stringify(props.dragItemList.filter((item) => item.type === "car"))
  )
);
const mqttUrl = ref<string>(props.mqttUrl || "ws://192.168.1.88:8083");
const robotList = ref<Array<RobotInfo>>(props.robotList);

const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
  useMqtt();

const canvas = ref<HTMLCanvasElement>();
let ctx: CanvasRenderingContext2D | null = null;

// 坐标修正
const handlePosition = (pos: number, extraPX = 0) => {
  const _pos = pos * pxToMeterRate * props.scale;
  return _pos + extraPX;
};
// 弧度换算为角度
const handleRadToDegree = (rad: number) => {
  return rad * (180 / Math.PI);
};

// 路径画线
const drawLines = () => {
  lineList.value.forEach((item) => {
    const startPoint = pointList.value.find((i) => i.name === item.startPoint);
    const endPoint = pointList.value.find((i) => i.name === item.endPoint);
    if (!startPoint || !endPoint || !ctx) return;
    ctx.beginPath();
    ctx.moveTo(item.startPosX, item.startPosY);
    ctx.lineTo(item.endPosX, item.endPosY);
    ctx.strokeStyle = "#bbb";
    ctx.stroke();
  });
};

const handleAgvPos = (carInfo: DragItem) => {
  return {
    bottom: handlePosition(carInfo.y, -carInfo.height / 2) + "px",
    left: handlePosition(carInfo.x, -carInfo.width / 2) + "px",
    transform: `rotate(${-handleRadToDegree(carInfo.rotate) - 90}deg)`,
  };
};

const handleInit = () => {
  if (mqttUrl.value) {
    console.log("mqttUrl.value:::", mqttUrl.value);
    initMqtt(mqttUrl.value, { path: "/mqtt" });
  }
  if (lineList.value.length > 0 && canvas.value) {
    ctx = canvas.value.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
    // ctx.translate(0, canvas.value.height);

    drawLines();
  }
};

// mqtt设备信号处理
const handleDeviceStatus = (infoStr: string) => {
  // "M0:1100100010,N0000;M1:0000000000,N0000"
  // 单个设备信号
  const _deviceStatusList = infoStr.split(";");
  const _deviceCodeList = _deviceStatusList
    .map((item) => {
      const _deviceCode = extractNumber(item.split(":")[0]);
      return _deviceCode || _deviceCode === 0 ? _deviceCode + 1 : null;
    })
    .filter(Boolean);
  dragItemList.value.forEach((dragItem: DragItem) => {
    if (
      dragItem.type !== "device" ||
      !dragItem.deviceData ||
      dragItem.deviceData.length === 0
    ) {
      return;
    }
    const deviceIndex = _deviceCodeList.indexOf(
      parseInt(dragItem.deviceCode || "")
    );
    if (deviceIndex === -1) return;
    dragItem.deviceData.forEach((item: DeviceItemShow) => {
      item.showKeyValue = item.keyValue;
      const _statusItem = _deviceStatusList[deviceIndex].split(":")[1];
      const _keyValue = _statusItem.substring(
        item.startIndex - 1,
        item.endIndex - 1
      );
      // 没有配置匹配项则直接赋值keyValue
      if (!item.options || item.options.length === 0) {
        item.showKeyValue = (item.keyValue || "") + _keyValue;
        return;
      }
      const optionItem = item.options?.find((i) => i.keyValue === _keyValue);
      if (optionItem) {
        item.showKeyValue = (item.keyValue || "") + optionItem.label;
        if (optionItem.bgColor) {
          item.bgColor = optionItem.bgColor;
        }
        if (optionItem.ownColor) {
          item.ownColor = optionItem.ownColor;
        }
      }
    });
  });
  console.log(dragItemList.value);
};

onMounted(() => {
  handleInit();
});
onUnmounted(() => {
  // 在组件卸载时断开 MQTT 连接
  disconnect();
});
// MQTT连接后订阅消息
watch(
  () => [isConnected.value, robotList.value],
  ([connected, robots]) => {
    if (Array.isArray(robots) && connected && robots.length > 0) {
      robots.forEach((item) => {
        subscribeToTopic(`/robot/${item.robotId}/position`);
      });
    }
  }
);
watch(
  () => isConnected.value,
  (connected) => {
    if (connected) {
      subscribeToTopic("/CNC_Status");
    }
  }
);
// 设置小车信息
watch(
  () => messages.value,
  (topicInfoList) => {
    carList.value.forEach((item) => {
      const topicItem = topicInfoList.find(
        (topicInfo) => topicInfo.topic === `/robot/${item.robotId}/position`
      );
      if (topicItem && topicItem.msg) {
        item.x = topicItem.msg.pos_x;
        item.y = topicItem.msg.pos_y;
        item.rotate = topicItem.msg.pos_angle;
      }
    });
    const cncStatus = topicInfoList.find(
      (topicInfo) => topicInfo.topic === "/CNC_Status"
    );
    if (cncStatus?.msg?.CNC_Sta) {
      handleDeviceStatus(cncStatus.msg.CNC_Sta);
    }
  },
  { deep: true }
);
</script>
<style scoped>
.agv-preview-page {
  height: 100%;
  &::before {
    content: " ";
    display: table;
  }
  .agv-map-canvas {
    margin: auto;
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
  .icon-device {
    z-index: 9;
    transition: all 0.1s;
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

  .device-info {
    border: 1px solid #1296db;
    border-radius: 10px;
    padding: 10px;
    color: white;
    font-size: 12px;
    text-align: left;

    .info-title {
      border: 1px solid white;
      font-size: 20px;
      width: fit-content;
    }
    .info {
      margin-bottom: 5px;
    }
    .info-btn {
      padding: 5px 3px;
      width: fit-content;
      border-radius: 4px;
    }
  }
}
</style>
