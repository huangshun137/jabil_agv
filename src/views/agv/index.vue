<template>
  <div class="agv-page">
    <div class="agv-page-content" ref="appRef">
      <AgvTitle />
      <div class="agv-page-content-main">
        <div class="task-statistic-content">
          <AgvTaskStatistic />
          <AgvStatus />
        </div>
        <div class="map-content">
          <div class="map-title">机台实时信息和小车轨迹</div>
          <agv-preview />
        </div>
        <div class="task-detail-content">
          <AGVTaskInfo />
          <AgvAcupointInfo />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import useDraw from "@/utils/useDraw";
import AgvTitle from "@/components/AgvTitle.vue";
import {
  AgvTaskStatistic,
  AgvStatus,
  AGVTaskInfo,
  AgvAcupointInfo,
} from "./components/index.ts";
import agvPreview from "@/views/agvPreview/index.vue";
// * 适配处理
const { appRef, calcRate, windowDraw, unWindowDraw } = useDraw();
onMounted(() => {
  // 屏幕适应
  windowDraw();
  calcRate();
});
onUnmounted(() => {
  unWindowDraw();
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
  }
}
</style>
