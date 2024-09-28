<template>
  <div class="agv-edit-page">
    <AgvTitle title="可视化编辑平台" />
    <div class="drag-page">
      <DragTemplate
        :mapInfo="mapInfo"
        :modalInfoRef="modalInfoRef"
        :dragItems="dragItems"
        :robotsLength="robotList.length"
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
          :handleBack="handleBack"
          :hasDeviceItem="dragItems.some((item) => item.type === 'device')"
          :handleAddDeviceInfo="handleAddDeviceInfo"
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
            :onActivated="onActivated"
            :onDeactivated="onDeactivated"
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
      :mapId="parseInt(id)"
      :robotList="robotList"
      :dragItems="dragItems"
      @handleDelete="handleDelete"
      @handleConfrimAdd="handleConfrimAdd"
      @handleRefreshIconList="handleRefreshIconList"
    />
    <modal-preview
      v-if="mapInfo?.width && mapInfo?.height"
      :width="mapInfo.width"
      :height="mapInfo.height"
      :scale="mapInfo.scale"
      :pointList="pointList"
      :lineList="lineList"
      :dragItemList="dragItems"
      :robotList="robotList"
      ref="modalPreviewRef"
    />
    <modal-device
      :device-id="activeDragItem?.deviceId || 0"
      :deviceData="activeDragItem?.deviceData ?? []"
      :handleConfirm="handleDeviceConfirm"
      ref="modalDeviceRef"
    ></modal-device>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { omit } from "lodash-es";
import { useRouter } from "vue-router";
import AgvTitle from "@/components/AgvTitle.vue";
import ModalInfo from "./components/ModalInfo.vue";
import DragTemplate from "./components/DragTemplate.vue";
import MapBtn from "./components/MapBtn.vue";
import MapContent from "./components/MapContent.vue";
import ModalPreview from "./components/ModalPreview.vue";
import ModalDevice from "./components/ModalDevice.vue";
import {
  AddItem,
  DeviceItem,
  DragItem,
  EditItem,
  LineInfo,
  MapInfo,
  PointInfo,
  SizeInfo,
} from ".";
import { getMapInfoApi, updateMapInfoApi } from "@/api/api";
import { nextTick } from "process";
import { RobotInfo } from "../agvList";

const props = defineProps<{
  id: string;
}>();
const router = useRouter();
const dragTemplateRef = ref(); // 左边拖拽模板组件
const scale = ref<number>(1); // 接口获取后的地图和当前屏幕显示的缩放比例
const mapInfo = ref<MapInfo>(); // 地图详情信息
const mapContainerRef = ref(); // 外部容器div
const mapContentRef = ref(); // 地图拖拽组件
const modalInfoRef = ref(); // 新增/编辑弹窗组件
const modalPreviewRef = ref(); // 预览弹窗组件
const modalDeviceRef = ref(); // 设备配置弹窗组件
const dragItems = reactive<Array<DragItem>>([]);
const pointList = reactive<Array<PointInfo>>([]);
const lineList = reactive<Array<LineInfo>>([]);
const robotList = ref<Array<RobotInfo>>([]);
const activeDragItemIndex = ref<number>(); // 激活的拖拽元素

const activeDragItem = computed(() => {
  return dragItems[activeDragItemIndex.value || 0];
});

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
// 新建拖拽图标弹窗确认
const handleConfrimAdd = (data: AddItem | EditItem, flag: "add" | "edit") => {
  console.log("data:::", data);
  if (flag === "add") {
    // 新建
    let _deviceData: Array<DeviceItem> = [];
    if (data.type === "device") {
      const sameDeviceItem = dragItems.find(
        (item) => item.deviceType === data.deviceType
      );
      if (sameDeviceItem) {
        _deviceData = sameDeviceItem.deviceData ?? [];
      }
    }
    dragItems.push({
      ...(omit(data, ["index"]) as AddItem),
      iconId: data.id || (data as EditItem).iconId,
      id: -Math.random(),
      deviceData: [..._deviceData],
      dragFlag: false,
    });
  } else {
    // 编辑
    const _data = data as EditItem;
    dragItems[_data.index] = omit(_data, ["index"]);
  }
};
// 新增图标弹窗确认
const handleRefreshIconList = () => {
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
    x: parseFloat(x.toFixed(2)),
    y: parseFloat(y.toFixed(2)),
    width: parseFloat(width.toFixed(2)),
    height: parseFloat(height.toFixed(2)),
  };
};
// 拖拽中事件
const onDrag = (x: number, y: number, index: number) => {
  dragItems[index] = {
    ...dragItems[index],
    x: parseFloat(x.toFixed(2)),
    y: parseFloat(y.toFixed(2)),
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
    rotate: parseFloat(degree.toFixed(2)),
  };
};
// 拖拽item激活
const onActivated = (index: number) => {
  activeDragItemIndex.value = index;
};
const onDeactivated = () => {
  // activeDragItemIndex.value = undefined;
};
// 编辑机台数据结构
const handleAddDeviceInfo = () => {
  if (
    (!activeDragItemIndex.value && activeDragItemIndex.value !== 0) ||
    dragItems[activeDragItemIndex.value]?.type !== "device"
  ) {
    ElMessage.warning("请选择需要添加的机台");
    return;
  }
  // const dragItem = dragItems[activeDragItemIndex.value];
  // dragItem.deviceData = [];

  modalDeviceRef.value.showModal();
};
// 设备数据配置弹窗确认
const handleDeviceConfirm = (data: Array<DeviceItem>) => {
  dragItems[activeDragItemIndex.value!].deviceData = [...data];
};

const handleItemDblClick = (index: number) => {
  modalInfoRef.value.handleEdit({
    index,
    ...dragItems[index],
  });
};

const handleScale = (data: any) => {
  let _sacle = 1;
  const canvasRatio = canvasWidth.value / canvasHeight.value;
  const imgRatio = data.width / data.height;

  if (imgRatio > canvasRatio) {
    // 比例大 -> 宽度更大 -> 高度自适应，宽度缩放
    _sacle = canvasWidth.value / data.width;
  } else {
    // 比例小 -> 高度更大 -> 宽度自适应，高度缩放
    _sacle = canvasHeight.value / data.height;
  }
  scale.value = _sacle;
};
const handleDataFormat = (data: any): number => {
  return parseFloat(data || "0") * scale.value;
};
const getMapInfo = () => {
  getMapInfoApi(props.id).then((res: any) => {
    if (res.code !== 200) {
      ElMessage({
        type: "warning",
        message: res.message,
      });
      return;
    }

    robotList.value = res.data.robots ?? [];
    mapInfo.value = {
      ...res.data,
      show: false,
    };
    if (!res.data.width || !res.data.height) {
      return;
    }
    const data = res.data;
    // 处理当前页面与接口返回大小的缩放比例，适配当前屏幕
    handleScale(data);

    canvasWidth.value = handleDataFormat(data.width);
    canvasHeight.value = handleDataFormat(data.height);
    mapInfo.value = {
      ...res.data,
      show: false,
      width: handleDataFormat(data.width),
      height: handleDataFormat(data.height),
      scale: parseFloat(data.scale || "1"),
    };
    const _dragItems =
      res.data.dragIconMaps?.map((item: any) => ({
        ...item,
        width: handleDataFormat(item.width),
        height: handleDataFormat(item.height),
        x: handleDataFormat(item.x),
        y: handleDataFormat(item.y),
        fontSize: handleDataFormat(item.fontSize),
        rotate: parseFloat(item.rotate || "0"),
        deviceData: item.deviceAttributeDTOS?.map((deviceItem: any) => ({
          ...deviceItem,
          fontSize: parseFloat(deviceItem.fontSize),
        })),
      })) ?? [];
    dragItems.splice(0, dragItems.length, ..._dragItems);
    const _pointList =
      res.data.dragMapPointDTOS?.map((item: any) => ({
        ...item,
        posX: handleDataFormat(item.posX),
        posY: handleDataFormat(item.posY),
      })) ?? [];
    pointList.splice(0, pointList.length, ..._pointList);
    const _lineList =
      res.data.dragMapLineDTOS?.map((item: any) => ({
        ...item,
        startPosX: handleDataFormat(item.startPosX),
        startPosY: handleDataFormat(item.startPosY),
        endPosX: handleDataFormat(item.endPosX),
        endPosY: handleDataFormat(item.endPosY),
      })) ?? [];
    lineList.splice(0, lineList.length, ..._lineList);
    if (lineList.length > 0) {
      nextTick(() => {
        mapContentRef.value.drawLines();
      });
    }
  });
};

const handleSave = () => {
  const params = {
    ...mapInfo.value,
    dragMapPointDTOS: pointList,
    dragMapLineDTOS: lineList,
    dragIconMaps: dragItems.map((item) => ({
      ...item,
      id: item.id < 0 ? null : item.id,
      deviceAttributeDTOS: item.deviceData,
    })),
  };
  updateMapInfoApi(params).then((res: any) => {
    if (res.code !== 200) {
      ElMessage({
        type: "warning",
        message: res.message,
      });
    } else {
      ElMessage({
        type: "success",
        message: res.message,
      });
      handleBack();
    }
  });
};
const handlePreview = () => {
  modalPreviewRef.value.showModal();
};
const handleBack = () => {
  router.push("/agv-list");
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
