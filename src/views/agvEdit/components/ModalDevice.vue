<template>
  <div class="device-modal">
    <el-dialog
      title="机台信息配置"
      v-model="modalVisible"
      width="1000"
      destroy-on-close
    >
      <el-table :data="tableData" row-key="keyName" class="draggable">
        <el-table-column type="index" label="序号" width="60"></el-table-column>
        <el-table-column label="拖拽" width="60">
          <template #default>
            <el-icon class="drag-handler"><Rank /></el-icon>
          </template>
        </el-table-column>
        <el-table-column
          prop="label"
          label="标签名称"
          width="140"
        ></el-table-column>
        <el-table-column prop="keyValue" label="标签值">
          <template #default="scope">
            {{
              scope.row.options?.length > 0
                ? scope.row.options
                    .map(
                      (item: DeviceOptionItem) =>
                        (scope.row.keyValue || "") + item.label
                    )
                    .join("/")
                : scope.row.keyValue
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="fontSize"
          label="字体大小"
          width="100"
        ></el-table-column>
        <el-table-column prop="bgColor" label="背景色" width="150">
          <template #default="scope">
            {{
              scope.row.options?.length > 0 &&
              scope.row.options.some((i: DeviceOptionItem) => i.bgColor)
                ? scope.row.options
                    ?.map((i: DeviceOptionItem) => i.bgColor)
                    .filter(Boolean)
                    .join("/")
                : scope.row.bgColor
            }}
          </template>
        </el-table-column>
        <el-table-column prop="ownColor" label="字体颜色" width="150">
          <template #default="scope">
            {{
              scope.row.options?.length > 0 &&
              scope.row.options.some((i: DeviceOptionItem) => i.ownColor)
                ? scope.row.options
                    ?.map((i: DeviceOptionItem) => i.ownColor)
                    .filter(Boolean)
                    .join("/")
                : scope.row.ownColor
            }}
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="120">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button
              :type="scope.row.isShow ? 'warning' : 'success'"
              link
              @click="
                () => {
                  scope.row.isShow = !scope.row.isShow;
                }
              "
            >
              {{ scope.row.isShow ? "隐藏" : "显示" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="() => (modalVisible = false)">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      title="机台信息配置"
      v-model="modalFormVisible"
      width="800"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        label-width="140px"
        label-suffix="："
        v-if="formData"
      >
        <el-form-item label="信号位置">{{ formData.startIndex }}</el-form-item>
        <el-form-item label="信号结束位置">
          {{ formData.endIndex }}
        </el-form-item>
        <el-form-item label="标签名">{{ formData.label }}</el-form-item>
        <el-form-item label="标签key">{{ formData.keyName }}</el-form-item>
        <el-form-item label="标签值">{{ formData.keyValue }}</el-form-item>
        <el-form-item label="字体大小">
          <el-input-number
            v-model="formData.fontSize"
            :min="4"
            :max="100"
            :controls="false"
            :precision="0"
          />px
        </el-form-item>
        <el-form-item label="背景色">
          <el-switch v-model="formData.hasBgColor" style="margin-right: 10px" />
          <color-picker
            v-model:pureColor="formData.bgColor"
            v-if="formData.hasBgColor"
          />
        </el-form-item>
        <el-form-item label="字体颜色">
          <el-switch
            v-model="formData.hasOwnColor"
            style="margin-right: 10px"
          />
          <color-picker
            v-model:pureColor="formData.ownColor"
            v-if="formData.hasOwnColor"
          />
        </el-form-item>
        <el-form-item
          v-for="(option, index) in formData.options"
          :label="'标签值转换' + (index + 1)"
          :key="option.label + option.keyValue"
        >
          <el-row style="width: 100%">
            <el-col :span="8">
              {{ option.keyValue }} -> {{ option.label }}
            </el-col>
            <el-col :span="8">
              <el-form-item label="背景色" label-width="90">
                <el-switch
                  v-model="option.hasBgColor"
                  style="margin-right: 10px"
                />
                <color-picker
                  v-model:pureColor="option.bgColor"
                  v-if="option.hasBgColor"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="字体颜色" label-width="90">
                <el-switch
                  v-model="option.hasOwnColor"
                  style="margin-right: 10px"
                />
                <color-picker
                  v-model:pureColor="option.ownColor"
                  v-if="option.hasOwnColor"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="() => (modalFormVisible = false)">取消</el-button>
          <el-button type="primary" @click="handleEditConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { default as Sortable, SortableEvent } from "sortablejs";
import { getDeviceAttrApi } from "@/api/api";
import { DeviceItem, DeviceOptionItem } from "..";

interface FormOptions extends DeviceOptionItem {
  hasBgColor: boolean;
  hasOwnColor: boolean;
}
interface FormData extends DeviceItem {
  hasBgColor: boolean;
  hasOwnColor: boolean;
  options: Array<FormOptions>;
}

const props = defineProps<{
  deviceId: number;
  deviceData: Array<DeviceItem>;
  handleConfirm: (data: Array<DeviceItem>) => void;
}>();

const modalVisible = ref<boolean>(false);
const modalFormVisible = ref<boolean>(false);
const tableData = ref<Array<any>>([]);
const formData = ref<FormData>();

const showModal = () => {
  tableData.value = [];
  modalVisible.value = true;

  getDeviceAttrApi({ deviceId: props.deviceId }).then((res: any) => {
    const data = res.data || [];
    data.forEach((item: any) => {
      const deviceItem = props.deviceData.find(
        (i) => i.keyName === item.keyName
      );
      item.isShow = !!deviceItem;
      item.sort = deviceItem?.sort ?? 999;
      if (!deviceItem) return;
      item.fontSize = deviceItem.fontSize ?? 12;
      item.options = deviceItem.options ?? [];
      item.ownColor = deviceItem.ownColor;
      item.bgColor = deviceItem.bgColor;
    });
    tableData.value = data.sort(
      (a: DeviceItem, b: DeviceItem) => a.sort - b.sort
    );
    rowDrag();
  });
};

// 行拖拽
const rowDrag = function () {
  // 要拖拽元素的父容器
  const tbody = document.querySelector(
    ".draggable .el-table__body-wrapper tbody"
  );
  if (!tbody) return;
  Sortable.create(tbody as HTMLElement, {
    //  可被拖拽的子元素
    draggable: ".draggable .el-table__row",
    handle: ".drag-handler",
    ghostClass: "sortable-ghost",
    animation: 100,
    onEnd(event: SortableEvent) {
      if (event.oldIndex !== undefined && event.newIndex !== undefined) {
        const currRow = tableData.value.splice(event.oldIndex, 1)[0];
        tableData.value.splice(event.newIndex, 0, currRow);
      }
    },
  });
};

const handleEdit = (record: any) => {
  formData.value = {
    ...record,
    fontSize: record.fontSize || 12,
    bgColor: record.bgColor || "rgba(0,0,0,0)",
    ownColor: record.ownColor || "#fff",
    hasBgColor: !!record.bgColor,
    hasOwnColor: !!record.ownColor,
    options:
      record.options?.map((item: FormOptions) => {
        return {
          ...item,
          bgColor: item.bgColor || "rgba(0,0,0,0)",
          ownColor: item.ownColor || "#fff",
          hasBgColor: !!item.bgColor,
          hasOwnColor: !!item.ownColor,
        };
      }) ?? [],
  };
  modalFormVisible.value = true;
};

const handleEditConfirm = () => {
  if (!formData.value) return;
  const data = {
    ...formData.value,
    bgColor: formData.value.hasBgColor ? formData.value.bgColor : null,
    ownColor: formData.value.hasOwnColor ? formData.value.ownColor : null,
    options:
      formData.value.options?.map((item: FormOptions) => {
        return {
          ...item,
          bgColor: item.hasBgColor ? item.bgColor : null,
          ownColor: item.hasOwnColor ? item.ownColor : null,
        };
      }) ?? [],
  };
  const tableDataIndex = tableData.value.findIndex(
    (item: DeviceItem) => item.keyName === formData.value!.keyName
  );
  tableData.value[tableDataIndex] = data;
  modalFormVisible.value = false;
};

const handleConfirm = () => {
  const data = tableData.value
    .filter((item) => item.isShow)
    .map((item, index) => ({
      ...item,
      sort: index + 1,
    }));
  props.handleConfirm(data);
  modalVisible.value = false;
};

defineExpose({
  showModal,
});
</script>
<style lang="less" scoped>
.device-modal {
  :deep(.sortable-ghost) {
    background-color: rgba(0, 0, 0, 0.8);
  }
  .el-input-number {
    :deep(.el-input__inner) {
      text-align: left;
    }
  }
}
</style>
