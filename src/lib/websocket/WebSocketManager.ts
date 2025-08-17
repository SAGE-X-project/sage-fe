import ReconnectingWebSocket from "reconnecting-websocket";
import { WebSocketConfig, WebSocketState, WebSocketMessage, WebSocketManagerOptions } from "./types";
import { AgentLog } from "@/types/agent";

export class WebSocketManager {
  private ws: ReconnectingWebSocket | null = null;
  private config: WebSocketConfig;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private options: WebSocketManagerOptions;
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue = false;

  constructor(config: WebSocketConfig, options: WebSocketManagerOptions = {}) {
    this.config = config;
    this.options = options;
  }

  public connect(): void {
    if (!this.config.enableRealtimeLogs) {
      console.log("Realtime logs disabled");
      return;
    }

    const wsUrl = `${this.config.url}${this.config.endpoint}`;
    
    try {
      this.updateState(WebSocketState.CONNECTING);
      
      this.ws = new ReconnectingWebSocket(wsUrl, [], {
        connectionTimeout: 5000,
        maxRetries: this.config.maxReconnectAttempts,
        maxReconnectionDelay: 10000,
        minReconnectionDelay: this.config.reconnectInterval,
        reconnectionDelayGrowFactor: 1.3,
        debug: process.env.NODE_ENV === "development",
      });

      this.setupEventHandlers();
    } catch (error) {
      this.handleError(new Error(`Failed to create WebSocket connection: ${error}`));
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.addEventListener("open", this.handleOpen.bind(this));
    this.ws.addEventListener("close", this.handleClose.bind(this));
    this.ws.addEventListener("error", this.handleError.bind(this));
    this.ws.addEventListener("message", this.handleMessage.bind(this));
  }

  private handleOpen(): void {
    console.log("WebSocket connected");
    this.reconnectAttempts = 0;
    this.updateState(WebSocketState.CONNECTED);
    this.startHeartbeat();
    this.processMessageQueue();
  }

  private handleClose(): void {
    console.log("WebSocket disconnected");
    this.stopHeartbeat();
    
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.updateState(WebSocketState.RECONNECTING);
      this.reconnectAttempts++;
      this.options.onReconnect?.(this.reconnectAttempts);
    } else {
      this.updateState(WebSocketState.DISCONNECTED);
    }
  }

  private handleError(error: Event | Error): void {
    const errorMessage = error instanceof Error ? error.message : "Unknown WebSocket error";
    console.error("WebSocket error:", errorMessage);
    
    this.updateState(WebSocketState.ERROR);
    this.options.onError?.(new Error(errorMessage));
    
    // Send error message to UI
    const errorLog: WebSocketMessage = {
      type: "error",
      payload: errorMessage,
      timestamp: new Date().toISOString(),
    };
    this.options.onMessage?.(errorLog);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      // Handle both string and JSON messages
      let message: WebSocketMessage;
      
      if (typeof event.data === "string") {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(event.data);
          
          // Check if it's already a WebSocketMessage format
          if (parsed.type && parsed.payload) {
            message = parsed;
          } else {
            // Convert backend log format to WebSocketMessage
            message = this.convertToWebSocketMessage(parsed);
          }
        } catch {
          // Plain text message from backend
          message = {
            type: "log",
            payload: this.createAgentLogFromText(event.data),
            timestamp: new Date().toISOString(),
          };
        }
      } else {
        console.warn("Received non-string WebSocket message:", event.data);
        return;
      }

      this.options.onMessage?.(message);
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      this.handleError(new Error(`Failed to process message: ${error}`));
    }
  }

  private convertToWebSocketMessage(data: any): WebSocketMessage {
    // Convert backend log format to AgentLog
    const agentLog: AgentLog = {
      type: data.type || "info",
      from: data.from || "system",
      to: data.to || "user",
      content: data.content || data.message || JSON.stringify(data),
      timestamp: data.timestamp || new Date().toISOString(),
      messageId: data.messageId || `msg-${Date.now()}`,
      originalPrompt: data.originalPrompt,
      tamperedPrompt: data.tamperedPrompt,
    };

    return {
      type: "log",
      payload: agentLog,
      timestamp: agentLog.timestamp,
    };
  }

  private createAgentLogFromText(text: string): AgentLog {
    // Parse text logs from backend
    const logPatterns = {
      routing: /routing|route/i,
      planning: /planning|plan/i,
      ordering: /ordering|order/i,
      gateway: /gateway/i,
      sage: /sage|verification|signature/i,
      error: /error|fail|exception/i,
    };

    let type: AgentLog["type"] = "info";
    for (const [key, pattern] of Object.entries(logPatterns)) {
      if (pattern.test(text)) {
        type = key as AgentLog["type"];
        break;
      }
    }

    return {
      type,
      from: "backend",
      to: "frontend",
      content: text,
      timestamp: new Date().toISOString(),
      messageId: `log-${Date.now()}`,
    };
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: "heartbeat", data: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private updateState(newState: WebSocketState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.options.onStateChange?.(newState);
      
      // Send status update
      const statusMessage: WebSocketMessage = {
        type: "status",
        payload: {
          state: newState,
          message: this.getStateMessage(newState),
          attemptNumber: this.reconnectAttempts,
          maxAttempts: this.config.maxReconnectAttempts,
        },
        timestamp: new Date().toISOString(),
      };
      this.options.onMessage?.(statusMessage);
    }
  }

  private getStateMessage(state: WebSocketState): string {
    switch (state) {
      case WebSocketState.CONNECTING:
        return "WebSocket 연결 중...";
      case WebSocketState.CONNECTED:
        return "WebSocket 연결됨";
      case WebSocketState.DISCONNECTED:
        return "WebSocket 연결 끊김";
      case WebSocketState.RECONNECTING:
        return `재연결 시도 중... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`;
      case WebSocketState.ERROR:
        return "WebSocket 연결 오류";
      default:
        return "";
    }
  }

  public send(data: any): void {
    if (!this.isConnected()) {
      // Queue message if not connected
      this.queueMessage(data);
      return;
    }

    try {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.ws?.send(message);
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      this.queueMessage(data);
    }
  }

  private queueMessage(data: any): void {
    const message: WebSocketMessage = {
      type: "log",
      payload: data,
      timestamp: new Date().toISOString(),
    };
    this.messageQueue.push(message);
  }

  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message.payload);
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
      }
    }
    
    this.isProcessingQueue = false;
  }

  public disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.updateState(WebSocketState.DISCONNECTED);
    this.messageQueue = [];
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  public getState(): WebSocketState {
    return this.state;
  }

  public reconnect(): void {
    this.disconnect();
    setTimeout(() => this.connect(), 100);
  }

  public updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reconnect if URL changed
    if (newConfig.url || newConfig.endpoint) {
      this.reconnect();
    }
  }
}