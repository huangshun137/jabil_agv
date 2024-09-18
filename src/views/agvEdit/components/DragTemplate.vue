<template>
  <div class="drag-add-content">
    <el-scrollbar>
      <div class="drag-add-container">
        <div
          class="drag-add-item"
          v-for="(item, index) in dragItemTemplates"
          :key="item.name"
          @click="handleItemClick(index)"
        >
          <SvgIconRemote
            :svgUrl="item.url!"
            :size="100"
            :color="item.color || '#1296DB'"
            v-if="item.type === '_svg' || item.type === 'car'"
          />
          <div
            v-else-if="item.type === 'line'"
            class="drag-template-line"
          ></div>
          <div
            v-else-if="item.type === 'point'"
            class="drag-template-point"
          ></div>
          <div v-else-if="item.type === 'text'" class="drag-template-text">
            文字
          </div>
        </div>
        <div class="drag-add-item" @click="handleAddItemClick">
          <el-icon size="50" color="#fff"><Plus /></el-icon>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive } from "vue";
import { AddItem, DragItem, DragItemTemplate } from "..";
import { queryIconList } from "@/api/api";

const props = defineProps<{
  mapInfo: any;
  modalInfoRef: any;
  dragItems: DragItem[];
  robotsLength: number;
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
        url: item.url,
        width: parseFloat(item.width),
        height: parseFloat(item.height),
        color: item.color,
        type: item.type,
      }))
    );
  });
};
// 点击图标 新建图标
const handleItemClick = (index: number) => {
  if (!props.mapInfo?.url) {
    ElMessage({
      type: "warning",
      message: "请先上传地图!",
    });
    return;
  }
  const dragTemplateItem = dragItemTemplates[index];
  if (dragTemplateItem.type === "car") {
    const carItemsLength = props.dragItems.filter(
      (item) => item.type === "car"
    ).length;
    if (carItemsLength === props.robotsLength) {
      ElMessage({
        type: "warning",
        message: "已添加所有车辆，请先删除车辆后再添加",
      });
      return;
    }
  }
  props.modalInfoRef.handleAdd({
    ...initAddItem,
    ...dragTemplateItem,
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
  height: 100%;
  border: 1px solid #ccc;
  .drag-add-container {
    width: 290px;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
  }

  .drag-add-item {
    width: 130px;
    height: 130px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    cursor: pointer;
    background-size: contain !important;
    background-repeat: no-repeat !important;

    &:nth-child(odd) {
      margin-right: 10px;
    }

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
