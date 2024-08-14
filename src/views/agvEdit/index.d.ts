type ModalContentKey = "width" | "height" | "x" | "y" | "rotate";

interface ModalContent {
  label: string;
  key: ModalContentKey;
}

// 拖拽组件模板类型定义
interface DragItemTemplate {
  name: string;
  img: string | null;
  width: number;
  height: number;
  type: "_svg" | "point" | "line" | "custom";
}

interface AddItem {
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotate: number;
  img?: string | null;
  type?: string;
}

interface DragItem extends AddItem {
  id: number;
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

export {
  ModalContentKey,
  ModalContent,
  DragItemTemplate,
  AddItem,
  DragItem,
  MouseCoor,
  EditItem,
};
