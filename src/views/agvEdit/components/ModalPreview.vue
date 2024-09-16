<template>
  <div class="preview-modal">
    <el-dialog title="地图预览" :model-value="modalVisible" width="80%">
      <div class="preview-container" ref="containerRef">
        <div class="preview-content" ref="appRef">
          <AgvPreview ref="previewRef"></AgvPreview>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import AgvPreview from "@/views/agvPreview/index.vue";
import useDraw from "@/utils/useDraw";
import { LineInfo, MapInfo, PointInfo } from "..";
import { nextTick } from "process";

const props = defineProps<{
  mapInfo?: MapInfo;
  pointList: PointInfo[];
  lineList: LineInfo[];
}>();

// * 适配处理
const { appRef, calcRate, windowDraw, unWindowDraw } = useDraw(
  props.mapInfo?.width,
  props.mapInfo?.height
);

const modalVisible = ref<boolean>(false);
const containerRef = ref<HTMLElement>();

const showModal = () => {
  modalVisible.value = true;
  nextTick(() => {
    // todo 可能width，height也要传
    calcRate(containerRef.value);
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
}
</style>
