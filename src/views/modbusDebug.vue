<template>
  <div class="content">
    <el-button type="primary" class="updateBtn" @click="updateStatus"
      >更新状态</el-button
    >
    <el-button type="primary" class="reconectedBtn" @click="reconnected"
      >尝试重连</el-button
    >
    <el-form :model="form" label-width="auto">
      <el-form-item label="modbus状态">
        <template v-if="form.modbusStatus">
          <el-button type="success" v-if="form.modbusStatus === 'connected'"
            >connected</el-button
          >
          <el-button type="info" v-else-if="form.modbusStatus === 'close'"
            >close</el-button
          >
          <el-button type="danger" v-else-if="form.modbusStatus === 'error'"
            >error</el-button
          >
        </template>
      </el-form-item>
      <el-form-item label="调度状态">
        <template v-if="form.isOccupy === 0">
          <span>占用中（或空闲中）</span>
          <el-button type="primary" @click="changeOccupy">释放控制权</el-button>
        </template>
        <template v-if="form.isOccupy === 1">
          <span>被抢了</span>
          <el-button type="primary" @click="changeOccupy">抢回来</el-button>
        </template>
      </el-form-item>
      <el-form-item label="当前点位">
        {{ form.currentPoint }}
      </el-form-item>
      <el-form-item label="当前导航状态">
        {{ form.navStatusName }}
      </el-form-item>
      <el-form-item label="电池电量">
        {{ form.power }}
      </el-form-item>
      <el-form-item label="现在去往">
        <el-input v-model="form.point" />
      </el-form-item>
      <el-button
        type="primary"
        @click="onSubmit"
        :disabled="form.isOccupy !== 0 || form.modbusStatus !== 'connected'"
        >开始任务</el-button
      >
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { reactive, onUnmounted, onMounted } from "vue";
import WebSocketClient from "@/utils/websocket";
import {
  getAllModbusStatus,
  getModbusStatusApi,
  getModbusValueApi,
  modbusReconnected,
  setModbusValueApi,
} from "@/api/api";

const ws = new WebSocketClient("ws://127.0.0.1:8088/modbusStatus");
const unsubscribe = ws.on("message", (event) => {
  // connected error close
  form.modbusStatus = event.data;
  console.log("Received data:", event.data);
});

const form = reactive({
  modbusStatus: null,
  isOccupy: null,
  currentPoint: null,
  navStatus: null,
  navStatusName: null,
  power: null,
  point: null,
});

const getModbusStatus = () => {
  getModbusStatusApi().then((res) => {
    console.log(res);
    form.modbusStatus = res.data;
  });
};

const updateStatus = () => {
  getAllModbusStatus().then((res) => {
    const {
      data: {
        modbusStatus,
        isOccupy,
        currentPoint,
        navStatus,
        navStatusName,
        power,
      } = {},
    } = res;
    Object.assign(form, {
      modbusStatus,
      isOccupy,
      currentPoint,
      navStatus,
      navStatusName,
      power,
    });
  });
};
const reconnected = () => {
  modbusReconnected().then((res: any) => {
    ElMessage({
      message: res.msg,
      type: "success",
      duration: 3 * 1000,
    });
  });
};
const changeOccupy = () => {
  const params = {
    addr: form.isOccupy === 0 ? 10 : 9,
    value: 1,
    type: "0x",
  };
  setModbusValueApi(params).then((res) => {
    if (res) {
      ElMessage({
        message: "操作成功",
        type: "success",
        duration: 3 * 1000,
      });
      const params = {
        addr: 42,
        type: "3x",
      };
      getModbusValueApi(params).then((res) => {
        form.isOccupy = res.data;
      });
    }
  });
};
const onSubmit = () => {
  const point = parseInt(form.point || "");
  if (!point) {
    ElMessage({
      message: "请输入正确的地址",
      type: "error",
      duration: 3 * 1000,
    });
    return;
  }
  const params = {
    addr: 0,
    value: point,
    type: "4x",
  };
  setModbusValueApi(params).then((res) => {
    if (res) {
      ElMessage({
        message: "操作成功",
        type: "success",
        duration: 3 * 1000,
      });
      updateStatus();
      form.point = null;
    }
  });
};

onMounted(() => {
  getModbusStatus();
});
onUnmounted(() => {
  unsubscribe();
  ws.close();
});
</script>
<style scoped>
.content {
  margin: auto;
  padding-top: 30px;
  width: 600px;
  position: relative;
}
.updateBtn {
  position: absolute;
  top: 30px;
  right: 0;
  z-index: 99;
}
.reconectedBtn {
  position: absolute;
  top: 80px;
  right: 0;
  z-index: 99;
}
</style>
