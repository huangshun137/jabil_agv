import {
  postApi,
  postApiWithoutLoading,
  getApi,
  getApiWithoutLoading,
} from "./http";

const testApi = (data: any) => postApi("/test", data);

const getModbusStatusApi = () => getApi("/modbus/status");
const getAllModbusStatus = () => getApi("/modbus/getAllStatus");
const getModbusValueApi = (data: any) => getApi("/modbus/getModbusValue", data);

const setModbusValueApi = (data: any) =>
  postApi("/modbus/setModbusValue", data);
const modbusReconnected = () => postApi("/modbus/reconnected", {});

export {
  testApi,
  getModbusStatusApi,
  getAllModbusStatus,
  getModbusValueApi,
  setModbusValueApi,
  modbusReconnected,
};
