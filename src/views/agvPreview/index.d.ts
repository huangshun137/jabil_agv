interface Point {
  code: string;
  angle: number;
  type: string;
  x: number;
  y: number;
}

interface Path {
  startControl: {
    x: number;
    y: number;
  };
  endControl: {
    x: number;
    y: number;
  };
}

interface PathPoint {
  startPoint: string;
  endPoint: string;
}

interface MapInfo {
  point: Array<Point>;
  path: Array<Path>;
  slidePath: Array<Path>;
  pathPoint: Array<PathPoint>;
}

interface RobotPositionInfo {
  x: number;
  y: number;
  angle: number;
}

export { MapInfo, RobotPositionInfo };
