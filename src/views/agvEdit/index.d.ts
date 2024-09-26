type ModalContentKey =
  | "width"
  | "height"
  | "x"
  | "y"
  | "rotate"
  | "color"
  | "text"
  | "fontSize"
  | "robotId"
  // | "deviceType"
  | "deviceId";

interface ModalContent {
  label: string;
  key: ModalContentKey;
}

// 拖拽组件模板类型定义
interface DragItemTemplate {
  id: number;
  name: string;
  url: string | null;
  width: number;
  height: number;
  color?: string;
  type: "_svg" | "point" | "line" | "custom" | "text" | "car" | "device";
}

interface AddItem {
  id: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  url?: string | null;
  type?: string;
  text?: string;
  fontSize?: number;
  robotId?: number;
  deviceId?: number;
  deviceType?: string;
  deviceName?: string;
  deviceCode?: string;
}

interface DeviceOptionItem {
  bgColor: string;
  ownColor: string;
  keyValue: string;
  label: string;
}
// 设备信息类型定义
interface DeviceItem {
  startIndex: number;
  endIndex: number;
  bgColor: string;
  ownColor: string;
  deviceType: string;
  fontSize: number;
  deviceType: string;
  sort: number;
  keyName: string; // 关键字key（保存的数据的key）
  keyValue: string; // 显示的值
  label: string; // 显示的标签值
  options: Array<DeviceOptionItem>;
}
interface DragItem extends AddItem {
  id: number;
  iconId: number;
  dragFlag: boolean;
  deviceData?: Array<DeviceItem>;
}

interface MouseCoor {
  x: number;
  y: number;
  dragIndex?: number;
}

interface EditItem extends DragItem {
  index: number;
}

// 新建图标类型定义
type AddIconModalContentKey =
  | "name"
  | "width"
  | "height"
  | "color"
  | "isCommon"
  | "url";
interface AddIconModalContent {
  label: string;
  key: AddIconModalContentKey;
}
interface AddIconItem {
  name: string;
  width: number;
  height: number;
  color: string;
  isCommon: boolean;
  url: string;
}

interface MapInfo {
  url: string;
  show: boolean;
  width: number;
  height: number;
  scale: number;
}

// 地图点位信息
interface PointInfo {
  name: string;
  posX: number;
  posY: number;
  type: string;
}
interface LineInfo {
  startPoint: string;
  endPoint: string;
  startPosX: number;
  startPosY: number;
  endPosX: number;
  endPosY: number;
}

// 更新的地图大小信息
interface SizeInfo {
  width: number;
  height: number;
}

// 设备信息(接口下拉)
interface DeviceInfo {
  deviceId: number;
  deviceName: string;
  deviceCode: string;
  deviceType: string;
}

export {
  ModalContentKey,
  ModalContent,
  DragItemTemplate,
  AddItem,
  DragItem,
  MouseCoor,
  EditItem,
  MapInfo,
  AddIconModalContent,
  AddIconItem,
  PointInfo,
  LineInfo,
  SizeInfo,
  DeviceInfo,
  DeviceOptionItem,
  DeviceItem,
};
