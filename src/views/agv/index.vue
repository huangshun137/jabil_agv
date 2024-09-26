<template>
  <div class="agv-page">
    <div class="agv-page-content" ref="appRef">
      <AgvTitle />
      <div class="agv-page-content-main">
        <div class="task-statistic-content">
          <AgvTaskStatistic />
          <AgvStatus :robotsStatus="robotsStatus" />
        </div>
        <div class="map-content">
          <div class="map-title">机台实时信息和小车轨迹</div>
          <div class="map-container" ref="containerRef">
            <div class="preview-content" ref="previewRef">
              <agv-preview
                v-if="mapInfo?.width && mapInfo?.height"
                :width="mapInfo.width"
                :height="mapInfo.height"
                :scale="mapInfo.scale"
                :pointList="pointList"
                :lineList="lineList"
                :dragItemList="dragItems"
                :robotList="robotList"
              />
            </div>
          </div>
        </div>
        <div class="task-detail-content">
          <AGVTaskInfo ref="taskInfoRef" />
          <AgvAcupointInfo :acupointInfo="acupointInfo" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import useDraw from "@/utils/useDraw";
import AgvTitle from "@/components/AgvTitle.vue";
import {
  AgvTaskStatistic,
  AgvStatus,
  AGVTaskInfo,
  AgvAcupointInfo,
} from "./components/index.ts";
import agvPreview from "@/views/agvPreview/index.vue";
import { getMapInfoApi } from "@/api/api.ts";
import { DragItem, LineInfo, MapInfo, PointInfo } from "../agvEdit/index";
import { RobotInfo } from "../agvList/index";
import useMqtt from "@/utils/useMqtt.ts";
import { AcupointInfo, RobotStatusInfo } from "./index";

const props = defineProps<{
  id: string;
}>();

// * 页面适配处理
const { appRef, calcRate, windowDraw, unWindowDraw } = useDraw();
// * 地图适配处理
const { appRef: previewRef, calcRate: previewCalcRate } = useDraw();

const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
  useMqtt();

const mapInfo = ref<MapInfo>(); // 地图详情信息
const dragItems = ref<Array<DragItem>>([]);
const pointList = ref<Array<PointInfo>>([]);
const lineList = ref<Array<LineInfo>>([]);
const robotList = ref<Array<RobotInfo>>([]);
const containerRef = ref<HTMLElement>(); // 地图预览容器div
const taskInfoRef = ref(); // 任务信息组件ref

const robotsStatus = ref<Array<RobotStatusInfo>>([]); // 机器人状态信息
const tableData = ref<Array<Array<string>>>([]); // 任务信息
const acupointInfo = ref<Array<AcupointInfo>>([]); // 小车穴位信息

const initData = () => {
  getMapInfoApi(props.id).then((res: any) => {
    if (!res.data.width || !res.data.height) {
      ElMessage({
        type: "error",
        message: "地图信息异常",
      });
      return;
    }

    const {
      url,
      scale,
      width,
      height,
      robots,
      dragIconMaps,
      dragMapPointDTOS,
      dragMapLineDTOS,
    } = res.data;
    mapInfo.value = {
      url,
      scale,
      width: parseFloat(width),
      height: parseFloat(height),
      show: true,
    };
    dragItems.value =
      dragIconMaps?.map((item: any) => ({
        ...item,
        width: parseFloat(item.width),
        height: parseFloat(item.height),
        x: parseFloat(item.x),
        y: parseFloat(item.y),
        fontSize: parseFloat(item.fontSize),
        rotate: parseFloat(item.rotate || "0"),
      })) || [];
    pointList.value =
      dragMapPointDTOS?.map((item: any) => ({
        ...item,
        posX: parseFloat(item.posX),
        posY: parseFloat(item.posY),
      })) || [];
    lineList.value =
      dragMapLineDTOS?.map((item: any) => ({
        ...item,
        startPosX: parseFloat(item.startPosX),
        startPosY: parseFloat(item.startPosY),
        endPosX: parseFloat(item.endPosX),
        endPosY: parseFloat(item.endPosY),
      })) || [];
    robotList.value = robots ?? [];

    if (robotList.value.length > 0) {
      robotsStatus.value = robots.map((item: any) => ({
        robotId: item.robotId,
        battery: 0,
        status: "",
      }));
      acupointInfo.value = robots.map((item: any) => ({
        robotId: item.robotId,
        robotCode: item.robotCode,
        robotName: item.robotName,
        carCaves: [],
      }));
      initMqtt(import.meta.env.VITE_APP_WS_URL, { path: "/mqtt" });
    }

    nextTick(() => {
      previewCalcRate(
        containerRef.value,
        mapInfo.value!.width,
        mapInfo.value!.height
      );
    });
  });
};

// MQTT连接后订阅消息
watch(
  () => isConnected.value,
  (newValue) => {
    if (newValue) {
      robotList.value.forEach((item) => {
        // 订阅小车穴位信息
        subscribeToTopic(`/site/${item.robotId}/productInfoCar`);
        // 订阅小车电量信息
        subscribeToTopic(`/robot/power/${item.robotId}`);
      });
      // 订阅大屏任务滚轮信息
      subscribeToTopic("/carTaskInfo");
      // 订阅全部机器人状态
      subscribeToTopic("/robot_status/all");
    }
  }
);
// 任务滚轮表
watch(
  () => messages.value.find((item) => item.topic === "/carTaskInfo"),
  (msgItem) => {
    if (msgItem?.msg) {
      if (tableData.value.length > 20) {
        tableData.value.shift();
      }
      tableData.value.push([msgItem.msg.data]);
      taskInfoRef.value && taskInfoRef.value.updateRows(tableData.value);
    }
  },
  { deep: true }
);
// 机器人状态
watch(
  () => messages.value.find((item) => item.topic === "/robot_status/all"),
  (msgItem) => {
    if (msgItem?.msg) {
      robotsStatus.value.forEach((item) => {
        const statusInfo = msgItem.msg[item.robotId];
        if (statusInfo) {
          item.status = statusInfo.curStatus;
        }
      });
    }
  },
  { deep: true }
);
// 电量信息
watch(
  () =>
    messages.value.filter(
      (item) => item.topic.indexOf("/robot/power/") > -1 && item.msg
    ),
  (msgItems) => {
    msgItems.forEach((msgItem) => {
      const _robotId = msgItem.topic.split("/")[3];
      const statusInfo = robotsStatus.value.find(
        (item) => item.robotId === parseInt(_robotId)
      );
      if (statusInfo) {
        statusInfo.battery = msgItem.msg.battery_value;
      }
    });
  },
  { deep: true }
);
// 小车穴位信息
watch(
  () =>
    messages.value.filter(
      (item) => item.topic.indexOf("/site/") > -1 && item.msg
    ),
  (msgItems) => {
    msgItems.forEach((msgItem) => {
      const _robotId = msgItem.topic.split("/")[2];
      const acupointItem = acupointInfo.value.find(
        (item) => item.robotId === parseInt(_robotId)
      );
      if (acupointItem) {
        acupointItem.carCaves = msgItem.msg.caves?.map((item: any) => ({
          ...item,
          bg:
            item.caveStatus === 0
              ? "bg-gray"
              : item.caveStatus === 1
              ? "bg-orange"
              : "bg-green",
        }));
      }
    });
  },
  { deep: true }
);

onMounted(() => {
  // 屏幕适应
  windowDraw();
  calcRate();

  initData();
});
onUnmounted(() => {
  unWindowDraw();
  // 在组件卸载时断开 MQTT 连接
  disconnect();
});
</script>
<style lang="less" scoped>
.agv-page {
  overflow: hidden;
  height: 100%;
  position: relative;

  .agv-page-content {
    color: #d3d6dd;
    width: 1920px;
    height: 1080px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: left top;

    background: url(@/assets/img/pageBg.png);
    padding: 16px;
  }

  .agv-page-content-main {
    display: flex;
    padding-top: 10px;

    .map-content {
      flex: 1;
      background-color: rgb(11, 9, 33);
      margin: 0 8px;
      position: relative;
    }
    .map-title {
      border: 1px solid white;
      color: white;
      padding: 6px;
      width: 280px;
      text-align: center;
      margin-left: 12px;
      margin-top: 4px;
      font-size: 20px;
    }
    .map-container {
      height: calc(100% - 40px);
      width: 100%;
      position: relative;
    }
    .preview-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transform-origin: left top;
    }
  }
}
</style>
