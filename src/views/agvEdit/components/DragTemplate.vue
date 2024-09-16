<template>
  <div class="drag-add-content">
    <div
      class="drag-add-item"
      v-for="(item, index) in dragItemTemplates"
      :key="item.name"
      :style="{
        background:
          item.type === 'custom' && item.img ? `url(${item.img})` : 'unset',
      }"
      @click="handleItemClick(index)"
    >
      <SvgIconRemote
        :svgUrl="item.img!"
        :size="100"
        :color="item.color || '#1296DB'"
        v-if="item.type === '_svg'"
      />
      <div v-else-if="item.type === 'line'" class="drag-template-line"></div>
      <div v-else-if="item.type === 'point'" class="drag-template-point"></div>
      <div v-else-if="item.type === 'text'" class="drag-template-text">
        文字
      </div>
    </div>
    <div class="drag-add-item" @click="handleAddItemClick">
      <el-icon size="50" color="#fff"><Plus /></el-icon>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive } from "vue";
import { AddItem, DragItemTemplate } from "..";
import { queryIconList } from "@/api/api";

const props = defineProps<{
  mapInfo: any;
  modalInfoRef: any;
}>();

const dragItemTemplates = reactive<DragItemTemplate[]>([]);
const initAddItem: AddItem = {
  id: -Math.random(),
  name: "",
  width: 150,
  height: 150,
  x: 5,
  y: 5,
  rotate: 0,
  color: "#1296DB",
  fontSize: 24,
};
// 获取图标列表
const getIconList = () => {
  queryIconList({}).then((res: any) => {
    console.log(res);
    if (res.code !== 200) {
      ElMessage({
        type: "error",
        message: res.message,
      });
      return;
    }
    dragItemTemplates.splice(
      0,
      dragItemTemplates.length,
      ...res.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        img: item.url,
        width: item.width,
        height: item.height,
        color: item.color,
        type: item.type,
      }))
    );
  });
};
// 点击图标 新建图标
const handleItemClick = (index: number) => {
  if (!props.mapInfo) {
    ElMessage({
      type: "warning",
      message: "请先上传地图!",
    });
    return;
  }
  props.modalInfoRef.handleAdd({
    ...initAddItem,
    ...dragItemTemplates[index],
  });
};
const handleAddItemClick = () => {
  props.modalInfoRef.handleAdd({
    ...initAddItem,
  });
};

defineExpose({
  getIconList,
});

onMounted(() => {
  getIconList();
});
</script>
<style lang="less" scoped>
.drag-add-content {
  width: 300px;
  height: 100%;
  border: 1px solid #ccc;
  padding: 10px;
  display: grid;
  grid-template-columns: 130px 130px;
  grid-template-rows: repeat(auto-fill, 130px);
  gap: 10px;

  .drag-add-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    cursor: pointer;
    background-size: contain !important;
    background-repeat: no-repeat !important;

    img {
      max-width: 80%;
    }

    .drag-template-line {
      width: 80%;
      height: 5px;
      border-radius: 1px;
      background-color: #1a5cd7;
    }

    .drag-template-point {
      width: 10px;
      height: 10px;
      border-radius: 5px;
      background-color: #6ba785;
    }
    .drag-template-text {
      color: #fff;
      font-size: 24px;
    }
  }
}
</style>
