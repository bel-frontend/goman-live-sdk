export type UniversalWebSocketOptions = {
  reconnectInterval?: number; // Time in ms between reconnection attempts
  maxReconnectAttempts?: number; // Maximum number of reconnection attempts
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: any) => void;
  onError?: (event: any) => void;
};

export class UniversalWebSocket {
  private url: string;
  private options: UniversalWebSocketOptions;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private isManuallyClosed: boolean = false;
  private ws: any;

  constructor(url: string, options: UniversalWebSocketOptions = {}) {
    this.url = url;
    this.options = options;
    this.reconnectInterval = options.reconnectInterval || 5000; // Default: 5 seconds
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity;

    // Start the connection
    this.connect();
  }

  private async connect(): Promise<void> {
    if (typeof window !== "undefined") {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = (event: Event) => {
        this.reconnectAttempts = 0; // Reset reconnect attempts
        this.options.onOpen?.(event);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.options.onMessage?.(event);
      };

      this.ws.onclose = (event: any) => {
        this.options.onClose?.(event);
        if (!this.isManuallyClosed) {
          this.handleReconnect();
        }
      };

      this.ws.onerror = (event: Event | ErrorEvent) => {
        this.options.onError?.(event);
      };
    } else {
      const WebSocketImpl = await import("ws");
      this.ws = new WebSocketImpl.default(this.url);

      this.ws.on("open", (event: Event) => {
        this.reconnectAttempts = 0; // Reset reconnect attempts
        this.options.onOpen?.(event);
      });

      this.ws.on("message", (data: any) => {
        this.options.onMessage?.(data as MessageEvent);
      });

      this.ws.on("close", (code: number, reason: string) => {
        this.options.onClose?.({ code, reason });
        if (!this.isManuallyClosed) {
          this.handleReconnect();
        }
      });

      this.ws.on("error", (error: Error) => {
        this.options.onError?.(error);
      });
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  public send(data: string | ArrayBuffer | Blob | ArrayBufferView): void {
    this.ws.send?.(data);
  }

  public close(): void {
    this.isManuallyClosed = true;
    this.ws?.close();
  }
}
