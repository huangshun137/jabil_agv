<template>
  <div class="agv-acu-point-info mt-3">
    <BorderBox13>
      <div class="bg-color-black">
        <div class="d-flex pt-2 pl-2 mt-2">
          <span>
            <svg-icon name="icon-data7" :size="20" color="#5cd9e8"></svg-icon>
          </span>
          <div class="d-flex ml-1 ai-center">
            <span style="font-size: 18px; color: white">穴位信息</span>
          </div>
        </div>
        <div class="mt-1 p-3 pb-0">AGV 1# 穴位信息</div>
        <div class="mt-1 pl-3">
          <span class="acu-status bg-gray">无料</span>
          <span class="acu-status bg-orange ml-2">有料</span>
          <!-- <span class="acu-status bg-green ml-2">已测</span> -->
        </div>
        <div style="display: flex; flex-wrap: wrap">
          <div
            class="box1 my-3 ml-3"
            v-for="item in carCaves"
            :key="item.no"
            :class="item.bg"
          >
            <div>{{ item.no + 1 }}#</div>
          </div>
        </div>
      </div>
    </BorderBox13>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";
import { BorderBox13 } from "@kjgl77/datav-vue3";
import useMqtt from "@/utils/useMqtt";

const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
  useMqtt();

const carCaves = computed(() => {
  let caves: any[] = [];
  if (messages.value[0]?.msg) {
    caves = messages.value[0].msg.caves.map((item: any) => ({
      ...item,
      bg:
        item.caveStatus === 0
          ? "bg-gray"
          : item.caveStatus === 1
          ? "bg-orange"
          : "bg-green",
    }));
  }
  return caves;
});
// MQTT连接后订阅消息
watch(
  () => isConnected.value,
  (newValue) => {
    if (newValue) {
      subscribeToTopic("/site/76/productInfoCar");
    }
  }
);
onMounted(() => {
  initMqtt(import.meta.env.VITE_APP_WS_URL, { path: "/mqtt" });
});
onUnmounted(() => {
  // 在组件卸载时断开 MQTT 连接
  disconnect();
});
</script>
<style lang="less" scoped>
@box-width: 280px;
@box-height: 384px;

.agv-acu-point-info {
  height: @box-height;
  width: @box-width;

  .dv-border-box-13 {
    padding: 16px;
  }
  .bg-color-black {
    height: calc(100% - 8px);
  }
  .bg-gray {
    background: #9e9e9e;
  }
  .bg-orange {
    background: #f07010;
  }
  .bg-green {
    background: #4caf50;
  }

  .acu-status {
    display: inline-block;
    font-size: 12px;

    &::before {
      content: "";
      display: inline-block;
      width: 13px;
      height: 13px;
      border-radius: 5px;
    }
    &.bg-gray,
    &.bg-orange,
    &.bg-green {
      background-color: unset;
    }
    &.bg-gray::before {
      background: #9e9e9e;
    }
    &.bg-orange::before {
      background: #f07010;
    }
    &.bg-green::before {
      background: #4caf50;
    }
  }

  .box1 {
    color: white;
    font-size: 15px;
    border-radius: 6px;
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
  }
}
</style>
