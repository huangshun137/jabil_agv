type ModalContentKey =
  | "width"
  | "height"
  | "x"
  | "y"
  | "rotate"
  | "color"
  | "text"
  | "fontSize";

interface ModalContent {
  label: string;
  key: ModalContentKey;
}

// 拖拽组件模板类型定义
interface DragItemTemplate {
  id: number;
  name: string;
  img: string | null;
  width: number;
  height: number;
  color?: string;
  type: "_svg" | "point" | "line" | "custom" | "text";
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
  img?: string | null;
  type?: string;
  text?: string;
  fontSize?: number;
}

interface DragItem extends AddItem {
  id: number;
  iconId: number;
  dragFlag: boolean;
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
  scale: number;
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
};
