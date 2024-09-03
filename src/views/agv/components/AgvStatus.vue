<template>
  <div class="agv-status mt-3">
    <BorderBox13>
      <div class="bg-color-black">
        <div class="d-flex pt-2 pl-2 mt-2">
          <span>
            <svg-icon
              name="icon-layer-group"
              :size="20"
              color="#5cd9e8"
            ></svg-icon>
          </span>
          <div class="d-flex ml-1 ai-center">
            <span style="font-size: 18px; color: white">AGV状态</span>
          </div>
        </div>
        <div class="mt-3 p-3">
          AGV 1#状态：{{ messages[0]?.msg?.curStatus }}
        </div>
        <div class="water px-2">
          <water-level-pond
            class="dv-wa-le-po"
            :config="{
              data: [messages[0]?.msg?.powerValue || 0],
              shape: 'roundRect',
              formatter: '{value}%',
              waveNum: 3,
            }"
          />
        </div>
      </div>
    </BorderBox13>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { WaterLevelPond, BorderBox13 } from "@kjgl77/datav-vue3";
import useMqtt from "@/utils/useMqtt";

const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
  useMqtt();

// MQTT连接后订阅消息
watch(
  () => isConnected.value,
  (newValue) => {
    if (newValue) {
      subscribeToTopic("/layout/robot/76");
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
@box-width: 300px;
@box-height: 407px;

.agv-status {
  height: @box-height;
  width: @box-width;

  .dv-border-box-13 {
    padding: 16px;
  }
  .bg-color-black {
    height: calc(100% - 8px);
  }

  .water {
    width: 100%;

    .dv-wa-le-po {
      height: 120px;
    }
  }
}
</style>
