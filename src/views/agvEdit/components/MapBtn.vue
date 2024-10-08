<template>
  <div class="map-btn">
    <template v-if="!mapInfo?.url">
      <el-upload
        accept="image/png, image/jpeg"
        name="files"
        :action="`${imgUploadUrl}/file/upload`"
        :show-file-list="false"
        :before-upload="beforeMapUpload"
        :on-success="onMapUploadSuccess"
      >
        <el-button type="primary">上传地图</el-button>
        <template #tip>
          <div class="el-upload__tip">
            仅支持上传jpg、png文件，且文件大小不超过10M
          </div>
        </template>
      </el-upload>
      <el-button class="back-btn" @click="handleBack">返回</el-button>
    </template>
    <template v-else>
      <el-button
        type="primary"
        v-if="mapInfo.show"
        @click="handleMapShow(false)"
        >隐藏地图</el-button
      >
      <el-button type="primary" v-else @click="handleMapShow(true)"
        >显示地图</el-button
      >
      <el-upload
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleMapJSONUpload"
        class="upload-json-btn"
      >
        <el-button type="primary">上传地图点位路径信息</el-button>
      </el-upload>
      <el-button
        type="primary"
        v-if="hasDeviceItem"
        @click="handleAddDeviceInfo"
        class="ml-4"
        >编辑机台数据结构</el-button
      >
      <el-button type="primary" class="float-r ml-2" @click="handleSave"
        >保存</el-button
      >
      <el-button type="primary" class="float-r" @click="handlePreview"
        >预览</el-button
      >
      <el-button class="float-r" @click="handleBack">返回</el-button>
    </template>
  </div>
</template>
<script setup lang="ts">
import { nextTick } from "vue";
import { UploadFile, UploadProps } from "element-plus";
import { imgUploadUrl, baseImgUrl } from "@/api/api";
import { LineInfo, MapInfo, PointInfo, SizeInfo } from "..";
import { pxToMeterRate } from "@/constant/constant";

const props = defineProps<{
  mapInfo: any;
  mapContainerRef: any;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  hasDeviceItem: boolean;
  handleSave: () => void;
  handlePreview: () => void;
  handleBack: () => void;
  handleAddDeviceInfo: () => void;
}>();
const emit = defineEmits<{
  (e: "updateMapInfo", mapInfo: MapInfo): void;
  (e: "updateSizeInfo", sizeInfo: SizeInfo): void;
  (e: "updatePointList", pointList: Array<PointInfo>): void;
  (e: "updateLineList", lineList: Array<LineInfo>): void;
}>();

const MapImgType = ["image/png", "image/jpeg"];
const pointOffset = -2; // 点位补偿值

const beforeMapUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (MapImgType.indexOf(rawFile.type) === -1) {
    ElMessage.error("请上传jpg/png文件!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("上传的地图大小不能超过 10MB!");
    return false;
  }
  return true;
};
const onMapUploadSuccess = (response: any) => {
  if (response.code !== 200) {
    ElMessage.error(response.message);
    return;
  }
  let mapInfo: MapInfo = {
    url: response.data,
    show: true,
    width: 0,
    height: 0,
    scale: 1,
  };

  nextTick(() => {
    let _canvasWidth = props.mapContainerRef.clientWidth;
    let _canvasHeight = props.mapContainerRef.clientHeight;

    const _img = new Image();
    _img.src = `${baseImgUrl}/${mapInfo.url}`;
    _img.onload = () => {
      const canvasRatio = _canvasWidth / _canvasHeight;
      const imgRatio = _img.width / _img.height;

      if (imgRatio > canvasRatio) {
        // 比例大 -> 宽度更大 -> 高度自适应，宽度顶满
        mapInfo.width = _canvasWidth;
        mapInfo.height = _canvasWidth / imgRatio;
      } else {
        // 比例小 -> 高度更大 -> 宽度自适应，高度顶满
        mapInfo.height = _canvasHeight;
        mapInfo.width = _canvasHeight * imgRatio;
      }
      _canvasWidth = mapInfo.width;
      _canvasHeight = mapInfo.height;

      mapInfo.scale = mapInfo.width / _img.width;

      emit("updateMapInfo", mapInfo);
      emit("updateSizeInfo", {
        width: _canvasWidth,
        height: _canvasHeight,
      });
    };
  });
};
const handleMapShow = (flag: boolean) => {
  emit("updateMapInfo", {
    ...props.mapInfo,
    show: flag,
  });
};
// 地图坐标转换
const mapCoorChange = (pos: number, extraPX = 0) => {
  const _pos = pos * pxToMeterRate * props.scale * props.mapInfo.scale;
  return _pos + extraPX * props.scale;
};
// 设置地图点位路线信息
const handleMapJSONUpload = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (file?.type !== "application/json") {
    ElMessage({
      type: "warning",
      message: "请上传json文件!",
    });
    return;
  }
  // 读取json文件中的json内容
  const reader = new FileReader();
  reader.onload = () => {
    const content = reader.result;
    if (typeof content === "string") {
      const data = JSON.parse(content);
      console.log(data);
      const pointList: PointInfo[] = data.advancedPointList.map(
        (item: any) => ({
          name: item.instanceName.replace(/\D/g, ""),
          posX: mapCoorChange(item.pos.x, pointOffset), // -2为补偿值，因为原点为4*4，补偿中心点
          posY: props.canvasHeight - mapCoorChange(item.pos.y, -pointOffset),
          type: item.className,
        })
      );
      emit("updatePointList", pointList);

      const _lineList: LineInfo[] = [];
      data.advancedCurveList.forEach((item: any) => {
        const pList = [
          item.startPos.instanceName.replace(/\D/g, ""),
          item.endPos.instanceName.replace(/\D/g, ""),
        ].sort();
        if (
          !_lineList.some(
            (i) => i.startPoint === pList[0] && i.endPoint === pList[1]
          )
        ) {
          _lineList.push({
            startPoint: pList[0],
            endPoint: pList[1],
            startPosX: mapCoorChange(item.startPos.pos.x),
            startPosY: props.canvasHeight - mapCoorChange(item.startPos.pos.y),
            endPosX: mapCoorChange(item.endPos.pos.x),
            endPosY: props.canvasHeight - mapCoorChange(item.endPos.pos.y),
          });
        }
      });
      emit("updateLineList", _lineList);
    }
  };
  reader.readAsText(file);
};
</script>
<style lang="less" scoped>
.upload-json-btn {
  display: inline-block;
  position: relative;
  top: 1px;
  left: 10px;
}
.map-btn {
  position: relative;
  .back-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
