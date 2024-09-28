import { DeviceItem, DragItem } from "../agvEdit";
interface RobotPositionInfo {
  x: number;
  y: number;
  angle: number;
}

interface DeviceStatusInfo {
  deviceCode: number;

  [key: string]: string;
}

interface DeviceItemShow extends DeviceItem {
  showKeyValue?: string;
}

interface DragItemShow extends DragItem {
  deviceData?: Array<DeviceItemShow>;
}

export { RobotPositionInfo, DeviceStatusInfo, DragItemShow, DeviceItemShow };
