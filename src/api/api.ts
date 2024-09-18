import { postApi, getApi, getApiWithoutLoading, deleteApi } from "./http";

const baseURL = import.meta.env.VITE_APP_BASE_API;
const imgUploadUrl = import.meta.env.VITE_APP_UPLOAD_BASE_URL;
const baseImgUrl = import.meta.env.VITE_APP_IMG_BASE_URL;

const testApi = (data: any) => postApi("/test", data);

// modbusDebug api
const getModbusStatusApi = () => getApi(baseURL + "/modbus/status");
const getAllModbusStatus = () => getApi(baseURL + "/modbus/getAllStatus");
const getModbusValueApi = (data: any) =>
  getApi(baseURL + "/modbus/getModbusValue", data);

const setModbusValueApi = (data: any) =>
  postApi(baseURL + "/modbus/setModbusValue", data);
const modbusReconnected = () => postApi(baseURL + "/modbus/reconnected", {});

// agv-home api
// AgvTaskStatistic
const getTaskStatisticApi = () =>
  getApiWithoutLoading(baseURL + "/task/getCountByFinish");

// agvEdit api
const getImageStreamApi = (data: any) =>
  getApi(imgUploadUrl + "/file/getImgStream", data, { responseType: "blob" });
// 新建图标
const createIconApi = (data: any) =>
  postApi(baseURL + "/dragIcon/createIcon", data);
// 删除图标
const deleteIconApi = (data: any) =>
  deleteApi(baseURL + "/dragIcon/deleteOne", data);
// 查询图标列表
const queryIconList = (data: any) =>
  getApi(baseURL + "/dragIcon/listDefaultIcon", data);
// 获取地图详情
const getMapInfoApi = (id: string) =>
  getApi(baseURL + `/dragMap/getMapById/${id}`);
// 获取地图详情
const updateMapInfoApi = (data: any) =>
  postApi(baseURL + "/dragMap/update", data);

// agvList api
// 获取实验室列表
const getLabListApi = () => getApi(baseURL + "/dragMap/getMapTypeList");
// 获取机器人列表
const getRobotListApi = () => getApi(baseURL + "/robot/getRobotList");
// 查询地图列表
const queryMapListApi = (data: any) => getApi(baseURL + "/dragMap/list", data);
// 新建地图
const createMapInfo = (data: any) => postApi(baseURL + "/dragMap/create", data);
// 更新地图
const updateMapInfo = (data: any) => postApi(baseURL + "/dragMap/update", data);
// 删除地图
const deleteMapApi = (data: any) =>
  deleteApi(baseURL + "/dragMap/delete", data);

export {
  baseURL,
  imgUploadUrl,
  baseImgUrl,
  testApi,
  getModbusStatusApi,
  getAllModbusStatus,
  getModbusValueApi,
  setModbusValueApi,
  modbusReconnected,
  getTaskStatisticApi,
  getImageStreamApi,
  createIconApi,
  deleteIconApi,
  queryIconList,
  getMapInfoApi,
  updateMapInfoApi,
  getLabListApi,
  getRobotListApi,
  queryMapListApi,
  createMapInfo,
  updateMapInfo,
  deleteMapApi,
};
