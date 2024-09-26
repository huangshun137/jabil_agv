interface RobotStatusInfo {
  robotId: number;
  status: string;
  battery: number;
}

interface CarCaves {
  no: number;
  caveStatus: number;
  bg: string;
}

interface AcupointInfo {
  robotId: number;
  robotName: string;
  robotCode: string;
  carCaves: Array<CarCaves>;
}

export { RobotStatusInfo, CarCaves, AcupointInfo };
