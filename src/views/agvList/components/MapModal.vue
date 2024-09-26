<template>
  <el-dialog
    :title="addFlag ? '地图新建' : '地图编辑'"
    :model-value="modalVisible"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-form
      ref="mapFormRef"
      :model="addMapForm"
      :rules="addRules"
      label-width="auto"
      status-icon
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="addMapForm.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="所属实验室" prop="typeId">
        <el-select v-model="addMapForm.typeId" placeholder="请选择所属实验室">
          <el-option
            v-for="item in labList"
            :label="item.label"
            :value="item.value"
            :key="item.value + item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="绑定机器人" prop="robots">
        <el-select
          v-model="addMapForm.robots"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="3"
          placeholder="请选择绑定机器人"
        >
          <el-option
            v-for="item in robotOptions"
            :label="item.label"
            :value="item.value"
            :key="item.value + item.label"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleModalClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { FormInstance, FormRules } from "element-plus";
import { Options, RobotInfo } from "../";
import { createMapInfo, updateMapInfo } from "@/api/api";
import { nextTick } from "process";

const props = defineProps<{
  labList: Array<Options>;
  robotList: Array<RobotInfo>;
}>();
const emit = defineEmits<{
  (e: "handleAddComplete"): void;
}>();
const robotOptions = computed(() => {
  return (
    props.robotList?.map((item) => ({
      label: item.robotName,
      value: item.robotId,
    })) ?? []
  );
});
const addFlag = ref<boolean>(true);
const modalVisible = ref<boolean>(false);
const mapFormRef = ref<FormInstance>();
const addMapForm = reactive({
  name: undefined,
  typeId: undefined,
  robots: [],
});
const addRules = reactive<FormRules>({
  name: [{ required: true, message: "请输入名称" }],
  typeId: [{ required: true, message: "请选择所属实验室" }],
  robots: [{ required: true, message: "请选择绑定机器人" }],
});

const handleModalClose = () => {
  modalVisible.value = false;
};
const handleConfirm = () => {
  mapFormRef.value!.validate((valid: boolean) => {
    if (valid) {
      const params = {
        ...addMapForm,
        robots: props.robotList.filter((item) =>
          (addMapForm.robots as number[]).includes(item.robotId)
        ),
      };
      let request = null;
      if (addFlag.value) {
        request = createMapInfo({
          name: params.name,
          robots: params.robots,
          typeId: params.typeId,
        });
      } else {
        request = updateMapInfo(params);
      }
      request.then((res: any) => {
        if (res.code !== 200) {
          ElMessage.error(res.message);
        } else {
          ElMessage.success(res.message);
          emit("handleAddComplete");
          handleModalClose();
        }
      });
    }
  });
};

const handleAdd = (_addFlag: boolean, mapInfo: any) => {
  addFlag.value = _addFlag;
  modalVisible.value = true;

  nextTick(() => {
    mapFormRef.value!.resetFields();
    if (!_addFlag) {
      Object.assign(addMapForm, {
        ...mapInfo,
        robots: mapInfo.robots?.map((item: any) => item.robotId) ?? [],
      });
    } else {
      Object.assign(addMapForm, {
        id: null,
      });
    }
  });
};

defineExpose({
  handleAdd,
});
</script>
<style lang="less" scoped></style>
