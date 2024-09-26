interface RobotPositionInfo {
  x: number;
  y: number;
  angle: number;
}

interface DeviceStatusInfo {
  deviceCode: number;

  [key: string]: string;
}

export { RobotPositionInfo, DeviceStatusInfo };
