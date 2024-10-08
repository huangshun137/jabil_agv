<template>
  <div
    class="drag-content"
    :style="{
      width: canvasWidth + 'px',
      height: canvasHeight + 'px',
    }"
    :class="{ 'map-content-drag': mapInfo?.width }"
  >
    <img
      :src="`${baseImgUrl}/${mapInfo.url}`"
      alt=""
      v-if="mapInfo?.show && mapInfo.width"
      :style="{
        width: mapInfo.width + 'px',
        height: mapInfo.height + 'px',
      }"
    />
    <canvas
      :height="canvasHeight"
      :width="canvasWidth"
      ref="canvas"
      class="map-canvas"
    ></canvas>
    <div
      class="map-point"
      v-for="item in pointList"
      :key="item.name + item.posX"
      :style="{
        left: item.posX + 'px',
        top: item.posY + 'px',
      }"
    />
    <VueDragResizeRotate
      v-for="(item, index) in dragItems"
      :key="item.id"
      :parent="true"
      :x="item.x"
      :y="item.y"
      :w="item.width"
      :h="item.height"
      :rotatable="true"
      :r="item.rotate"
      :class-name="`drag-item${item.type === 'device' ? ' device-item' : ''}`"
      :lock-aspect-ratio="item.type === 'point'"
      @resizing="
        (x: number, y: number, width: number, height: number) =>
          onResize(x, y, width, height, index)
      "
      @dragging="(x: number, y: number) => onDrag(x, y, index)"
      @dragstop="onDragStop(index)"
      @rotatestop="(degree: number) => onRotateStop(degree, index)"
      @activated="onActivated(index)"
      @deactivated="onDeactivated"
      @dblclick="handleItemDblClick(index)"
    >
      <SvgIconRemote
        :svgUrl="item.url!"
        :size="Math.min(item.width, item.height)"
        :color="item.color"
        v-if="item.type === '_svg' || item.type === 'car'"
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
            :key="deviceInfo.keyName"
            :style="{
              backgroundColor:
                deviceInfo.bgColor ||
                deviceInfo.options?.[0]?.bgColor ||
                'transparent',
              color:
                deviceInfo.ownColor ||
                deviceInfo.options?.[0]?.ownColor ||
                'white',
              fontSize: (deviceInfo.fontSize || 12) + 'px',
            }"
          >
            {{ deviceInfo.label
            }}<template v-if="deviceInfo.label">：</template>
            {{
              deviceInfo.options?.length > 0
                ? deviceInfo.options
                    .map((item) => (deviceInfo.keyValue || "") + item.label)
                    .join("/")
                : deviceInfo.keyValue
            }}
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
        }"
      ></div>
      <div
        v-else-if="item.type === 'text'"
        class="drag-text"
        :style="{ color: item.color, fontSize: item.fontSize + 'px' }"
      >
        {{ item.text }}
      </div>

      <div v-if="item.dragFlag" class="drag-info">
        <p>x: {{ item.x }}</p>
        <p>y: {{ item.y }}</p>
      </div>
    </VueDragResizeRotate>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { baseImgUrl } from "@/api/api";
import { DragItem, LineInfo, PointInfo } from "..";

const props = defineProps<{
  mapInfo: any;
  canvasWidth: number;
  canvasHeight: number;
  pointList: Array<PointInfo>;
  lineList: Array<LineInfo>;
  dragItems: Array<DragItem>;
  onResize: (
    x: number,
    y: number,
    width: number,
    height: number,
    index: number
  ) => void;
  onDrag: (x: number, y: number, index: number) => void;
  onDragStop: (index: number) => void;
  onRotateStop: (degree: number, index: number) => void;
  onActivated: (index: number) => void;
  onDeactivated: () => void;
  handleItemDblClick: (index: number) => void;
}>();

const canvas = ref<HTMLCanvasElement>();
// canvas绘制路径
const drawLines = () => {
  const ctx = canvas.value!.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
  props.lineList.forEach((item) => {
    const startPoint = props.pointList.find((i) => i.name === item.startPoint);
    const endPoint = props.pointList.find((i) => i.name === item.endPoint);
    if (!startPoint || !endPoint) return;
    ctx.beginPath();
    ctx.moveTo(item.startPosX, item.startPosY);
    ctx.lineTo(item.endPosX, item.endPosY);
    ctx.strokeStyle = "#bbb";
    ctx.stroke();
  });
};
defineExpose({
  drawLines,
});
</script>
<style lang="less" scoped>
.map-content-drag {
  border: 1px solid #ccc;
  background-color: rgb(11, 9, 33);
}
.drag-content {
  position: relative;
  max-width: 100%;
  max-height: 100%;

  & > img {
    max-width: 100%;
    max-height: 100%;
    position: absolute;
    z-index: 0;
  }

  .map-point {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 2px;
    background-color: #f5b894;
  }

  .map-canvas {
    position: absolute;
  }

  .drag-item {
    text-align: center;
    user-select: none;
    background-size: contain !important;
    background-repeat: no-repeat !important;
    position: absolute;
    min-height: 3px;
    min-width: 3px;

    &.active {
      outline: 1px dashed #ccc;
    }

    &.device-item {
      z-index: 9 !important;
    }

    :deep(.handle-rot) {
      &::before,
      &::after {
        border-color: #ccc;
      }
      &::after {
        border-left-color: transparent;
        border-top-color: transparent;
      }
      &::before {
        border-right-color: transparent;
      }
      &.handle {
        background: transparent;
      }
    }

    img {
      max-width: 100%;
      max-height: 100%;
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
}
</style>
