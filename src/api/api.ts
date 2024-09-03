import {
  postApi,
  postApiWithoutLoading,
  getApi,
  getApiWithoutLoading,
} from "./http";

const baseURL = import.meta.env.VITE_APP_BASE_API;
const testApi = (data: any) => postApi("/test", data);

// modbusDebug api
const getModbusStatusApi = () => getApi(baseURL + "/modbus/status");
const getAllModbusStatus = () => getApi(baseURL + "/modbus/getAllStatus");
const getModbusValueApi = (data: any) =>
  getApi(baseURL + "/modbus/getModbusValue", data);

const setModbusValueApi = (data: any) =>
  postApi(baseURL + "/modbus/setModbusValue", data);
const modbusReconnected = () => postApi(baseURL + "/modbus/reconnected", {});

// AgvTaskStatistic
const getTaskStatisticApi = () =>
  getApiWithoutLoading(baseURL + "/task/getCountByFinish");

export {
  testApi,
  getModbusStatusApi,
  getAllModbusStatus,
  getModbusValueApi,
  setModbusValueApi,
  modbusReconnected,
  getTaskStatisticApi,
};
