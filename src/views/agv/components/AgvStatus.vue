<template>
  <div class="agv-status mt-3">
    <BorderBox13>
      <div class="bg-color-black d-flex flex-column">
        <div class="d-flex pt-2 pl-2 mt-2 mb-2">
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
        <el-scrollbar ref="scrollbarRef" class="flex-1">
          <div class="agv-status-content">
            <template
              v-for="item in robotsStatus"
              :key="item.robotId + item.status + item.battery"
            >
              <div class="mt-3 p-3">
                AGV {{ item.robotId }}#状态：{{ item.status }}
              </div>
              <div class="water px-2">
                <water-level-pond
                  class="dv-wa-le-po"
                  :config="{
                    data: [item.battery || 0],
                    shape: 'roundRect',
                    formatter: '{value}%',
                    waveNum: 3,
                  }"
                />
              </div>
            </template>
          </div>
        </el-scrollbar>
      </div>
    </BorderBox13>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ElScrollbar } from "element-plus";
import { WaterLevelPond, BorderBox13 } from "@kjgl77/datav-vue3";
import { RobotStatusInfo } from "..";
import { autoScroll } from "@/utils/utils";

const props = defineProps<{ robotsStatus: RobotStatusInfo[] }>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
let clearScrollTimers: () => void;

watch(
  () => props.robotsStatus,
  (value) => {
    if (value.length > 0) {
      nextTick(() => {
        const scrollRef = scrollbarRef.value?.wrapRef;
        const scrollHeight =
          (scrollRef?.scrollHeight || 0) - (scrollRef?.clientHeight || 0);
        if (scrollHeight > 0 && scrollbarRef.value) {
          clearScrollTimers && clearScrollTimers();
          clearScrollTimers = autoScroll(scrollbarRef.value, scrollHeight);
        }
        scrollbarRef.value?.update();
      });
    }
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  nextTick(() => {
    scrollbarRef.value!.update();
  });
});

onUnmounted(() => {
  clearScrollTimers && clearScrollTimers();
});
</script>
<style lang="less" scoped>
@box-width: 300px;
@box-height: 510px;

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
