import EventEmitter from "eventemitter3";

interface WebSocketEventMap {
  open: Event;
  message: MessageEvent<string>;
  close: CloseEvent;
  error: Event;
}
// 定义 ArgumentMap 类型
type ArgumentMap<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => any ? A : any[];
};

class WebSocketClient {
  private socket: WebSocket | null = null;
  private readonly url: string;
  private readonly eventEmitter: EventEmitter<WebSocketEventMap>;

  constructor(url: string) {
    this.url = url;
    this.eventEmitter = new EventEmitter();

    this.connect();
  }

  private connect() {
    if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket(this.url);

      this.socket.addEventListener("open", (event) => this.onOpen(event));
      this.socket.addEventListener("message", (event) => this.onMessage(event));
      this.socket.addEventListener("close", (event) => this.onClose(event));
      this.socket.addEventListener("error", (event) => this.onError(event));
    }
  }

  private onOpen(event: Event) {
    this.eventEmitter.emit("open", event);
  }

  private onMessage(event: MessageEvent<string>) {
    this.eventEmitter.emit("message", event);
  }

  private onClose(event: CloseEvent) {
    this.eventEmitter.emit("close", event);
    setTimeout(() => this.connect(), 5000); // 自动重连
  }

  private onError(event: Event) {
    this.eventEmitter.emit("error", event);
  }

  public send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
    }
  }

  public on<T extends keyof WebSocketEventMap>(
    event: T,
    callback: (
      ...args: ArgumentMap<WebSocketEventMap>[Extract<
        T,
        keyof WebSocketEventMap
      >]
    ) => void
  ) {
    this.eventEmitter.on(event, callback);
    return () => this.eventEmitter.off(event, callback);
  }
}

export default WebSocketClient;
