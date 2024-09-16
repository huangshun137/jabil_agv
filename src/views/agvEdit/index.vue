<template>
  <div class="agv-edit-page">
    <AgvTitle title="可视化编辑平台" />
    <div class="drag-page">
      <DragTemplate
        :mapInfo="mapInfo"
        :modalInfoRef="modalInfoRef"
        ref="dragTemplateRef"
      />
      <div class="map-area">
        <MapBtn
          :mapInfo="mapInfo"
          :mapContainerRef="mapContainerRef"
          :canvasWidth="canvasWidth"
          :canvasHeight="canvasHeight"
          :scale="scale"
          :handleSave="handleSave"
          :handlePreview="handlePreview"
          @updateMapInfo="updateMapInfo"
          @updateSizeInfo="updateSizeInfo"
          @updatePointList="updatePointList"
          @updateLineList="updateLineList"
        />
        <div class="map-content" ref="mapContainerRef">
          <MapContent
            :mapInfo="mapInfo"
            :canvasWidth="canvasWidth"
            :canvasHeight="canvasHeight"
            :pointList="pointList"
            :lineList="lineList"
            :dragItems="dragItems"
            :onResize="onMapItemResize"
            :onDrag="onDrag"
            :onDragStop="onDragStop"
            :onRotateStop="onRotateStop"
            :handleItemDblClick="handleItemDblClick"
            ref="mapContentRef"
          />
        </div>
      </div>
    </div>
    <modal-info
      ref="modalInfoRef"
      :canvasWidth="canvasWidth"
      :canvasHeight="canvasHeight"
      :mapId="id"
      @handleDelete="handleDelete"
      @handleConfrimAdd="handleConfrimAdd"
      @handleConfrimIconCreate="handleConfrimIconCreate"
    />
    <modal-preview
      :mapInfo="mapInfo"
      :pointList="pointList"
      :lineList="lineList"
      ref="modalPreviewRef"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { omit } from "lodash-es";
import AgvTitle from "@/components/AgvTitle.vue";
import ModalInfo from "./components/ModalInfo.vue";
import DragTemplate from "./components/DragTemplate.vue";
import MapBtn from "./components/MapBtn.vue";
import MapContent from "./components/MapContent.vue";
import ModalPreview from "./components/ModalPreview.vue";
import {
  AddItem,
  DragItem,
  EditItem,
  LineInfo,
  MapInfo,
  PointInfo,
  SizeInfo,
} from ".";
import { getMapInfoApi } from "@/api/api";

const props = defineProps<{
  id: number;
}>();
const dragTemplateRef = ref(); // 左边拖拽模板组件
const scale = ref<number>(1); // 地图缩放比例
const mapInfo = ref<MapInfo>(); // 地图详情信息
const mapContainerRef = ref(); // 外部容器div
const mapContentRef = ref(); // 地图拖拽组件
const modalInfoRef = ref(); // 新增/编辑弹窗组件
const modalPreviewRef = ref(); // 预览弹窗组件
const dragItems = reactive<Array<DragItem>>([]);
const pointList = reactive<Array<PointInfo>>([]);
const lineList = reactive<Array<LineInfo>>([]);

const canvasWidth = ref<number>(1000);
const canvasHeight = ref<number>(533);

const updateMapInfo = (_mapInfo: MapInfo) => {
  mapInfo.value = {
    ...mapInfo.value,
    ..._mapInfo,
  };
};
const updateSizeInfo = (sizeInfo: SizeInfo) => {
  canvasWidth.value = sizeInfo.width;
  canvasHeight.value = sizeInfo.height;
  scale.value = sizeInfo.scale;
};
const updatePointList = (_pointList: Array<PointInfo>) => {
  pointList.splice(0, pointList.length, ..._pointList);
};
const updateLineList = (_lineList: Array<LineInfo>) => {
  lineList.splice(0, lineList.length, ..._lineList);
  if (lineList.length > 0) {
    mapContentRef.value.drawLines();
  }
};

const handleDelete = (index: number) => {
  dragItems.splice(index, 1);
};
const handleConfrimAdd = (data: AddItem | EditItem, flag: "add" | "edit") => {
  if (flag === "add") {
    dragItems.push({
      ...(omit(data, ["index"]) as AddItem),
      iconId: data.id,
      dragFlag: false,
    });
  } else {
    const _data = data as EditItem;
    dragItems[_data.index] = omit(_data, ["index"]);
  }
};
// 新增图标弹窗确认
const handleConfrimIconCreate = () => {
  dragTemplateRef.value.getIconList();
};

// 缩放事件
const onMapItemResize = (
  x: number,
  y: number,
  width: number,
  height: number,
  index: number
) => {
  dragItems[index] = {
    ...dragItems[index],
    x,
    y,
    width,
    height,
  };
};
// 拖拽中事件
const onDrag = (x: number, y: number, index: number) => {
  dragItems[index] = {
    ...dragItems[index],
    x,
    y,
    dragFlag: true,
  };
};
// 拖拽结束事件
const onDragStop = (index: number) => {
  dragItems[index] = {
    ...dragItems[index],
    dragFlag: false,
  };
};

const onRotateStop = (degree: number, index: number) => {
  dragItems[index] = {
    ...dragItems[index],
    rotate: degree,
  };
};

const handleItemDblClick = (index: number) => {
  modalInfoRef.value.handleEdit({
    index,
    ...dragItems[index],
  });
};

const getMapInfo = () => {
  getMapInfoApi(props.id).then((res: any) => {
    console.log(res);
  });
};

const handleSave = () => {
  const params = {
    ...mapInfo.value,
    pointList,
    lineList,
    dragIconMaps: dragItems.map((item) => ({
      ...item,
      id: item.id < 0 ? undefined : item.id,
    })),
  };
  console.log(params);
};
const handlePreview = () => {
  modalPreviewRef.value.showModal();
};

onMounted(() => {
  canvasWidth.value = mapContainerRef.value.clientWidth;
  canvasHeight.value = mapContainerRef.value.clientHeight;
  getMapInfo();
});
</script>
<style scoped lang="less">
.agv-edit-page {
  background: url(@/assets/img/pageBg.png);
  height: 100%;
  min-width: 1370px;
  padding: 16px;
}
.drag-page {
  display: flex;
  height: calc(100% - 100px);
  padding-top: 10px;
}

.map-area {
  margin-left: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.map-content {
  margin-top: 10px;
  flex: 1;
}
</style>
