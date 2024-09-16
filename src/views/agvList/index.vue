<template>
  <div class="agv-list-container">
    <AgvTitle title="AGV地图总览" />
    <div class="list-content">
      <el-card class="search-form-content">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="所属实验室">
            <el-select
              v-model="searchForm.typeId"
              placeholder="请选择所属实验室"
              clearable
            >
              <el-option
                v-for="item in labList"
                :label="item.label"
                :value="item.value"
                :key="item.value + item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="绑定机器人">
            <el-select
              v-model="searchForm.robotId"
              placeholder="请选择绑定机器人"
              clearable
            >
              <el-option
                v-for="item in robotList"
                :label="item.label"
                :value="item.value.robotId"
                :key="item.value.robotId + item.label"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="table-content">
        <div class="d-flex jc-end mb-3">
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
        <el-table
          :data="tableData"
          max-height="calc(100% - 48px)"
          style="width: 100%"
        >
          <el-table-column type="index" />
          <el-table-column prop="name" label="名称" width="180" />
          <el-table-column prop="typeId" label="所属实验室" width="180" />
          <el-table-column label="绑定机器人" width="250">
            <template #default="scope">
              {{
                scope.row.robots?.map((item: any) => item.robotName)?.join("，")
              }}
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="200" />
          <el-table-column prop="updateTime" label="修改时间" width="200" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" link @click="handleEdit(scope.row)"
                >编辑</el-button
              >
              <el-button
                type="primary"
                link
                @click="handleMapEdit(scope.row.id)"
                >地图编辑</el-button
              >
              <el-button type="primary" link>地图预览</el-button>
              <el-button type="primary" link>进入大屏</el-button>
              <el-button type="danger" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <MapModal
      ref="mapModalRef"
      :labList="labList"
      :robotList="robotList"
      @handleAddComplete="handleAddComplete"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getLabListApi, getRobotListApi, queryMapListApi } from "@/api/api";
import MapModal from "./components/MapModal.vue";
import { Options } from ".";

const router = useRouter();
const labList = ref<Array<Options>>([]);
const robotList = ref<Array<Options>>([]);
const mapModalRef = ref();
const searchForm = reactive({
  typeId: undefined,
  name: undefined,
  robotId: undefined,
});
const tableData = ref([]);

// 获取实验室列表
const getLabList = () => {
  getLabListApi().then((res: any) => {
    if (res.code === 200) {
      labList.value = res.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
    }
  });
};
// 获取机器人列表
const getRobotList = () => {
  getRobotListApi().then((res: any) => {
    if (res.code === 200) {
      robotList.value = res.data.map((item: any) => ({
        label: item.robotName,
        value: item,
      }));
    }
  });
};

const handleSearch = () => {
  const params = {
    ...searchForm,
    // page: 1,
    // pageSize: 10,
  };
  queryMapListApi(params).then((res: any) => {
    if (res.code !== 200) {
      ElMessage({
        type: "warning",
        message: res.message,
      });
      return;
    }
    tableData.value = res.data;
  });
};

const handleAdd = () => {
  mapModalRef.value.handleAdd(true);
};
const handleAddComplete = () => {
  handleSearch();
};
// 地图信息编辑（列表项）
const handleEdit = (record: any) => {
  mapModalRef.value.handleAdd(false, record);
};
// 地图编辑
const handleMapEdit = (id: number) => {
  router.push({
    name: "AGVEdit",
    params: { id },
  });
};

onMounted(() => {
  getLabList();
  getRobotList();
  handleSearch();
});
</script>
<style lang="less" scoped>
.agv-list-container {
  background: url(@/assets/img/pageBg.png);
  height: 100%;
  width: 100%;
  padding: 16px;

  .list-content {
    height: calc(100% - 100px);
    padding: 16px;
  }

  .search-form-content {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding-bottom: 2px;
    }
  }

  .table-content {
    height: calc(100% - 90px);
    width: 100%;

    :deep(.el-card__body) {
      height: 100%;
    }
    :deep(.el-table__header),
    :deep(.el-scrollbar__view),
    :deep(.el-table__body) {
      min-width: 100%;
    }
  }
}
</style>
