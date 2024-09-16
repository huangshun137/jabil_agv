<template>
  <el-dialog
    :title="addFlag ? '新建图标' : '请填写必要参数'"
    :model-value="modalVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="info-modal"
  >
    <el-form
      ref="ruleFormRef"
      :model="addRuleForm"
      :rules="addRules"
      label-width="auto"
      status-icon
      v-if="addFlag"
    >
      <el-form-item
        v-for="item in addIconModalList"
        :key="item.key"
        :label="item.label"
        :prop="item.key"
      >
        <template v-if="item.key === 'color'">
          <color-picker v-model:pureColor="addRuleForm.color" />
        </template>
        <template v-else-if="item.key === 'name'">
          <el-input v-model="addRuleForm.name" />
        </template>
        <template v-else-if="item.key === 'isCommon'">
          <el-switch
            v-model="addRuleForm.isCommon"
            inline-prompt
            active-text="是"
            inactive-text="否"
            size="large"
          />
        </template>
        <template v-else-if="item.key === 'url'">
          <el-upload
            class="svg-uploader"
            accept="image/svg+xml"
            name="files"
            :action="`${imgUploadUrl}/file/upload`"
            :show-file-list="false"
            :on-success="handleIconSuccess"
            :before-upload="beforeIconUpload"
          >
            <SvgIconRemote
              :svgUrl="addRuleForm.url"
              :size="64"
              :color="addRuleForm.color"
              v-if="addRuleForm.url"
            />
            <el-icon v-else class="svg-uploader-icon"><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                仅支持上传svg文件，且文件大小不超过2M.
              </div>
            </template>
          </el-upload>
        </template>
        <template v-else>
          <el-input-number
            v-model="addRuleForm[item.key]"
            :min="10"
            :max="500"
            :controls="false"
          />
        </template>
      </el-form-item>
    </el-form>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      status-icon
      v-else
    >
      <el-form-item
        v-for="item in formItems"
        :key="item.key"
        :label="item.label"
        :prop="item.key"
      >
        <template v-if="item.key === 'color'">
          <color-picker v-model:pureColor="ruleForm.color" />
        </template>
        <template v-else-if="item.key === 'text'">
          <el-input v-model="ruleForm.text" />
        </template>
        <template v-else>
          <el-input-number
            v-model="ruleForm[item.key]"
            :min="handleMin(item.key)"
            :max="handleMax(item.key)"
            :controls="false"
            :precision="2"
          />
        </template>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleModalClose">取消</el-button>
        <template v-if="modalType === 'edit'">
          <el-button type="danger" @click="handleDelete"> 删除 </el-button>
          <el-button type="primary" @click="handleCopy"> 复制 </el-button>
        </template>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  AddIconItem,
  AddIconModalContent,
  AddItem,
  EditItem,
  ModalContent,
  ModalContentKey,
} from "..";
import {
  ElMessageBox,
  FormInstance,
  FormRules,
  UploadProps,
} from "element-plus";
import { nextTick } from "process";
import { omit } from "lodash-es";
import { createIconApi, imgUploadUrl } from "@/api/api";

const baseImgUrl = import.meta.env.VITE_APP_IMG_BASE_URL;
const modalContentList: ModalContent[] = [
  { label: "宽度", key: "width" },
  { label: "高度", key: "height" },
  { label: "X轴坐标", key: "x" },
  { label: "Y轴坐标", key: "y" },
  { label: "旋转角度", key: "rotate" },
  { label: "颜色", key: "color" },
];
const modalContentTextList: ModalContent[] = [
  { label: "文字", key: "text" },
  { label: "字体大小", key: "fontSize" },
];
const addIconModalList: AddIconModalContent[] = [
  { label: "名称", key: "name" },
  { label: "默认宽度", key: "width" },
  { label: "默认高度", key: "height" },
  { label: "默认颜色", key: "color" },
  { label: "是否公用", key: "isCommon" },
  { label: "上传图标", key: "url" },
];
const props = defineProps<{
  canvasWidth: number;
  canvasHeight: number;
  mapId: number;
}>();
const emit = defineEmits<{
  (e: "handleModalClose"): void;
  (e: "handleDelete", index: number): void;
  (e: "handleConfrimIconCreate"): void;
  (
    e: "handleConfrimAdd",
    formData: AddItem | EditItem,
    modalType: "add" | "edit"
  ): void;
}>();

const modalVisible = ref<boolean>(false);
const modalType = ref<"add" | "edit">("add");
const ruleFormRef = ref<FormInstance>();
const record = ref<AddItem | EditItem>();
const ruleForm = reactive<Omit<AddItem | EditItem, "id">>({
  name: "",
  width: 0,
  height: 0,
  x: 0,
  y: 0,
  rotate: 0,
  color: "",
});
const addRuleForm = reactive<AddIconItem>({
  name: "",
  width: 50,
  height: 50,
  color: "#1296DB",
  isCommon: true,
  url: "",
});
const rules = reactive<FormRules<AddItem>>({
  width: [{ required: true, message: "请输入宽度", trigger: "blur" }],
  height: [{ required: true, message: "请输入高度", trigger: "blur" }],
  x: [{ required: true, message: "请输入X坐标", trigger: "blur" }],
  y: [{ required: true, message: "请输入Y坐标", trigger: "blur" }],
  rotate: [{ required: true, message: "请输入旋转角度", trigger: "blur" }],
  text: [{ required: true, message: "请输入文字", trigger: "blur" }],
  fontSize: [{ required: true, message: "请输入字体大小", trigger: "blur" }],
});
const addRules = reactive<FormRules<AddIconItem>>({
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  width: [{ required: true, message: "请输入宽度", trigger: "blur" }],
  height: [{ required: true, message: "请输入高度", trigger: "blur" }],
  url: [{ required: true, message: "请上传图标", trigger: "blur" }],
});
// 新增图标flag
const addFlag = ref<boolean>(false);
const formItems = computed(() => {
  if (ruleForm.type === "text") {
    return [...modalContentList, ...modalContentTextList];
  } else {
    return modalContentList;
  }
});

const handleAdd = (addItem: AddItem) => {
  modalType.value = "add";
  modalVisible.value = true;
  addFlag.value = !addItem.name;
  nextTick(() => {
    if (addFlag.value) {
      ruleFormRef.value!.resetFields();
      // Object.assign(addRuleForm, { ...addItem });
    } else {
      ruleFormRef.value!.resetFields();
      record.value = { ...addItem };
      Object.assign(ruleForm as AddItem, { ...addItem });
    }
  });
};
const handleEdit = (editItem: EditItem) => {
  modalType.value = "edit";
  modalVisible.value = true;
  nextTick(() => {
    ruleFormRef.value!.resetFields();
    record.value = { ...editItem };
    Object.assign(ruleForm as EditItem, { ...editItem });
  });
};

const beforeIconUpload: UploadProps["beforeUpload"] = (rawFile) => {
  if (rawFile.type !== "image/svg+xml") {
    ElMessage.error("请上传svg文件!");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("上传的地图大小不能超过 2MB!");
    return false;
  }
  return true;
};
const handleIconSuccess = (response: any) => {
  if (response.code !== 200) {
    addRuleForm.url = "";
    ElMessage.error(response.message);
    return;
  }
  addRuleForm.url = `${baseImgUrl}/${response.data}`;
};

const handleMin = (key: ModalContentKey) => {
  let min: number = 0;
  switch (key) {
    case "width":
      min = 3;
      break;
    case "height":
      min = 3;
      break;
    case "fontSize":
      min = 8;
      break;
  }
  return min;
};
const handleMax = (key: ModalContentKey) => {
  let max: number = Infinity;
  switch (key) {
    case "width":
      max = props.canvasWidth - ruleForm.x;
      break;
    case "height":
      max = props.canvasHeight - ruleForm.y;
      break;
    case "x":
      max = props.canvasWidth - ruleForm.width;
      break;
    case "y":
      max = props.canvasHeight - ruleForm.height;
      break;
    case "fontSize":
      max = 999;
      break;
  }
  return max;
};

const handleModalClose = () => {
  modalVisible.value = false;
};
const handleDelete = () => {
  ElMessageBox.confirm("是否确定删除?", "Warning", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    emit("handleDelete", (ruleForm as EditItem).index);
    handleModalClose();
  });
};
const handleCopy = () => {
  ruleFormRef.value!.validate((valid: boolean) => {
    if (valid) {
      const _ruleForm = {
        ...omit(ruleForm, ["index", "id", "dragFlag"]),
        x:
          ruleForm.x > props.canvasWidth / 2
            ? ruleForm.x - 20
            : ruleForm.x + 20,
        y:
          ruleForm.y > props.canvasHeight / 2
            ? ruleForm.y - 20
            : ruleForm.y + 20,
      };
      emit("handleConfrimAdd", _ruleForm as AddItem, "add");
      handleModalClose();
    }
  });
};
const handleConfirm = () => {
  ruleFormRef.value!.validate((valid: boolean) => {
    if (valid) {
      if (addFlag.value) {
        console.log(addRuleForm);
        const params = {
          ...addRuleForm,
          id: undefined,
          isInit: 0,
          mapId: addRuleForm.isCommon ? 0 : props.mapId, // todo 需要父组件传mapId过来
          type: "_svg",
        };
        createIconApi(params).then((res: any) => {
          console.log(res);
          if (res.code !== 200) {
            ElMessage.error(res.message);
            return;
          }
          ElMessage.success("添加成功");
          emit("handleConfrimIconCreate");
          handleModalClose();
        });
      } else {
        emit(
          "handleConfrimAdd",
          { ...(record.value as EditItem), ...ruleForm },
          modalType.value
        );
        handleModalClose();
      }
    }
  });
};

defineExpose({
  handleAdd,
  handleEdit,
});
</script>
<style lang="less" scoped>
.info-modal {
  .el-input-number {
    width: 95%;

    :deep(.el-input__inner) {
      text-align: left;
    }
  }
  .el-input {
    width: 95%;
  }

  .svg-uploader {
    :deep(.el-upload) {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
    .el-icon.svg-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 98px;
      height: 98px;
      text-align: center;
    }
    .el-upload__tip {
      line-height: 20px;
    }
  }
}
</style>
