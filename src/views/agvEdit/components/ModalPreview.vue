<template>
  <div class="preview-modal">
    <el-dialog
      title="地图预览"
      v-model="modalVisible"
      width="80%"
      destroy-on-close
    >
      <div class="preview-container" ref="containerRef">
        <div class="preview-content" ref="appRef">
          <AgvPreview
            v-if="width && height"
            ref="previewRef"
            :width="width"
            :height="height"
            :scale="scale"
            :pointList="pointList"
            :lineList="lineList"
            :dragItemList="dragItemList"
            :robot-list="robotList"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import AgvPreview from "@/views/agvPreview/index.vue";
import useDraw from "@/utils/useDraw";
import { DragItem, LineInfo, PointInfo } from "..";
import { nextTick } from "process";
import { RobotInfo } from "@/views/agvList";

const props = defineProps<{
  width: number;
  height: number;
  scale: number;
  pointList: PointInfo[];
  lineList: LineInfo[];
  dragItemList: DragItem[];
  robotList: RobotInfo[];
}>();

// * 适配处理
const { appRef, calcRate, windowDraw, unWindowDraw } = useDraw();

const modalVisible = ref<boolean>(false);
const containerRef = ref<HTMLElement>();

const showModal = () => {
  modalVisible.value = true;
  nextTick(() => {
    calcRate(containerRef.value, props.width, props.height);
  });
};

onMounted(() => {
  // 屏幕适应
  windowDraw();
});
onUnmounted(() => {
  unWindowDraw();
});

defineExpose({
  showModal,
});
</script>
<style lang="less" scoped>
.preview-modal {
  :deep(.el-dialog) {
    height: 80vh;
    margin-top: 10vh;
  }
  :deep(.el-dialog__body),
  .preview-container {
    width: 100%;
    height: 100%;
  }
  .preview-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform-origin: left top;
  }
}
</style>
