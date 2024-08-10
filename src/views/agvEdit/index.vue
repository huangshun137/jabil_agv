<template>
  <div class="agv-edit-page">
    <div style="font-size: 0; text-align: center">
      <img src="@/assets/img/top.jpg" style="height: 80px; min-width: 90%" />
    </div>
    <div class="drag-page" @mousemove="handleMouseMove">
      <div class="drag-add-content">
        <div
          class="drag-add-item"
          v-for="(item, index) in dragItemTemplates"
          :key="item.name"
          @click="handleItemClick(index)"
        >
          <img :src="item.img" :alt="item.name" v-if="item.img" />
          <div
            v-else-if="item.type === 'line'"
            class="drag-template-line"
          ></div>
          <div
            v-else-if="item.type === 'point'"
            class="drag-template-point"
          ></div>
        </div>
      </div>
      <div
        class="drag-content"
        :style="{
          width: canvasWidth + 'px',
          height: canvasHeight + 'px',
          background: `url(${bg})`,
        }"
      >
        <div
          class="drag-item"
          v-for="(item, index) in dragItems"
          :key="item.id"
          :style="{
            width: item.width + 'px',
            height: item.height + 'px',
            left: item.x + 'px',
            top: item.y + 'px',
            borderColor: item.dragFlag ? '#409EFF' : '#ccc',
          }"
          @mousedown="handleMouseDown($event, index)"
          @dblclick="handleItemDblClick(index)"
        >
          <img :src="item.img" :alt="item.name" v-if="item.img" />
          <div v-else-if="item.type === 'line'" class="drag-line"></div>
          <div
            v-else-if="item.type === 'point'"
            class="drag-point"
            :style="{ borderRadius: item.width / 2 + 'px' }"
          ></div>

          <div v-if="item.dragFlag" class="drag-info">
            <p>x: {{ item.x }}</p>
            <p>y: {{ item.y }}</p>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="请填写必要参数" v-model="modalVisible" width="500px">
      <p v-for="item in modalContentList" :key="item.key">
        <span>{{ item.label }}：</span>
        <template v-if="editItem">
          <el-input
            type="number"
            :min="0"
            v-model="editItem[item.key]"
            @input="validateInput(item.key)"
            style="margin-bottom: 10px"
          />
        </template>
        <template v-else>
          <el-input
            type="number"
            :min="0"
            v-model="addItem[item.key]"
            @input="validateInput(item.key)"
            style="margin-bottom: 10px"
          />
        </template>
      </p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleModalClose">取消</el-button>
          <el-button type="danger" @click="handleDelete" v-if="editItem">
            删除
          </el-button>
          <el-button type="primary" @click="handleConfrimAdd">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import bg from "@/assets/img/bg_proc.jpg";
import jt from "@/assets/img/jt.png";
import cdf from "@/assets/img/cdf.png";
import car from "@/assets/img/car.png";
import {
  AddItem,
  DragItem,
  DragItemTemplate,
  EditItem,
  ModalContent,
  ModalContentKey,
  MouseCoor,
} from ".";
import { omit } from "lodash-es";

const canvasWidth = 1000;
const canvasHeight = 533;
const LEFT = 330; // 画布距左边的像素
const TOP = 80; // 画布距上边的像素
const modalContentList: ModalContent[] = [
  { label: "宽度", key: "width" },
  { label: "高度", key: "height" },
  { label: "X轴坐标", key: "x" },
  { label: "Y轴坐标", key: "y" },
];
const dragItemTemplates = reactive<DragItemTemplate[]>([
  {
    name: "镜头",
    img: jt,
    width: 113,
    height: 134,
    type: "custom",
  },
  {
    name: "充电房",
    img: cdf,
    width: 190,
    height: 134,
    type: "custom",
  },
  {
    name: "车",
    img: car,
    width: 42,
    height: 39,
    type: "custom",
  },
  {
    name: "线",
    img: null,
    width: 506,
    height: 3,
    type: "line",
  },
  {
    name: "点",
    img: null,
    width: 8,
    height: 8,
    type: "point",
  },
]);
const modalVisible = ref(false);
const initAddItem: AddItem = {
  name: "",
  width: 200,
  height: 200,
  x: 0,
  y: 0,
};
const addItem = reactive<AddItem>({ ...initAddItem });
const dragItems = reactive<Array<DragItem>>([]);
const mouseCoor = ref<MouseCoor>({ x: 0, y: 0 });
const editItem = ref<EditItem>();

const handleItemClick = (index: number) => {
  modalVisible.value = true;
  Object.assign(addItem, { ...initAddItem, ...dragItemTemplates[index] });
};
const validateInput = (flag: ModalContentKey) => {
  const _item = editItem.value || addItem;
  if (_item[flag] < 0) {
    _item[flag] = 0;
  }
  if (flag === "width" && _item.width > canvasWidth - _item.x) {
    _item.width = canvasWidth - _item.x;
  }
  if (flag === "height" && _item.height > canvasHeight - _item.y) {
    _item.height = canvasHeight - _item.y;
  }
  if (flag === "x" && _item.x > canvasWidth - _item.width) {
    _item.x = canvasWidth - _item.width;
  }
  if (flag === "y" && _item.y > canvasWidth - _item.height) {
    _item.y = canvasHeight - _item.height;
  }
};
const handleDelete = () => {
  dragItems.splice(editItem.value!.index, 1);
  handleModalClose();
};
const handleConfrimAdd = () => {
  if (editItem.value) {
    const index = editItem.value.index;
    dragItems[index] = omit(editItem.value, ["index"]);
  } else {
    dragItems.push({
      id: Math.random(),
      dragFlag: false,
      ...addItem,
    });
  }
  handleModalClose();
};
const handleModalClose = () => {
  modalVisible.value = false;
  editItem.value = undefined;
};

const handleMouseMove = (ev: MouseEvent) => {
  const index = mouseCoor.value.dragIndex;
  if (!!index || index === 0) {
    let x = ev.pageX - LEFT - mouseCoor.value.x;
    let y = ev.pageY - TOP - mouseCoor.value.y;
    dragItems[index].dragFlag = true;
    dragItems[index].x = Math.min(
      Math.max(0, x),
      canvasWidth - dragItems[index].width
    );
    dragItems[index].y = Math.min(
      Math.max(0, y),
      canvasHeight - dragItems[index].height
    );
  }
};
// 记录点击的组件信息及鼠标位置
const handleMouseDown = (ev: MouseEvent, index: number) => {
  ev.preventDefault();
  mouseCoor.value = {
    x: ev.layerX,
    y: ev.layerY,
    dragIndex: index,
  };
};

const handleItemDblClick = (index: number, imgFlag = false) => {
  console.log("123123123");
  let _index = index;
  if (imgFlag) {
    _index = dragItems.findIndex((item) => item.id == index);
  }
  editItem.value = {
    index: _index,
    ...dragItems[_index],
  };
  modalVisible.value = true;
};

onMounted(() => {
  document.addEventListener("mouseup", () => {
    dragItems.forEach((item) => {
      item.dragFlag = false;
    });
    mouseCoor.value = { x: 0, y: 0 };
  });
});
</script>
<style scoped lang="less">
.agv-edit-page {
  background: url(@/assets/img/bg_proc.jpg);
  height: 100%;
  min-width: 1370px;
}
.drag-page {
  display: flex;
  height: calc(100% - 80px);
}
.drag-add-content {
  width: 300px;
  height: 800px;
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
  }
}
.drag-content {
  margin-left: 30px;
  position: relative;
  border: 1px solid #ccc;

  .drag-item {
    position: absolute;
    text-align: center;
    user-select: none;

    img {
      max-width: 100%;
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

    .drag-info {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      color: white;
    }
  }
}
</style>
