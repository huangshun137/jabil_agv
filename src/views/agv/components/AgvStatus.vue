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
        <div class="mt-3 p-3">AGV 1#状态：{{ statusInfo.status }}</div>
        <div class="water px-2">
          <water-level-pond
            class="dv-wa-le-po"
            :config="{
              data: [statusInfo.battery || 0],
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
import { onMounted, onUnmounted, reactive, watch } from "vue";
import { WaterLevelPond, BorderBox13 } from "@kjgl77/datav-vue3";
import useMqtt from "@/utils/useMqtt";

const { initMqtt, isConnected, messages, subscribeToTopic, disconnect } =
  useMqtt();

const statusInfo = reactive({
  battery: 0,
  status: "",
});
// MQTT连接后订阅消息
watch(
  () => isConnected.value,
  (newValue) => {
    if (newValue) {
      subscribeToTopic("/layout/robot_status/76");
      subscribeToTopic("/robot/power/76");
    }
  }
);
watch(
  () => messages.value,
  (messages) => {
    if (messages.length === 0) return;
    const powerMsg = messages.find(
      (msg) => msg.topic === "/robot/power/76"
    )?.msg;
    if (powerMsg) {
      statusInfo.battery = powerMsg.battery_value;
    }
    const stateMsg = messages.find(
      (msg) => msg.topic === "/layout/robot_status/76"
    )?.msg;
    if (stateMsg) {
      statusInfo.status = stateMsg.curStatus;
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
