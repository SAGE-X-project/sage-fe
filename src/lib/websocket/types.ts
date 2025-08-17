import { AgentLog } from "@/types/agent";

export enum WebSocketState {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  RECONNECTING = "RECONNECTING",
  ERROR = "ERROR",
}

export interface WebSocketConfig {
  url: string;
  endpoint: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enableRealtimeLogs: boolean;
}

export interface WebSocketMessage {
  type: "log" | "error" | "status" | "heartbeat";
  payload: AgentLog | string | WebSocketStatus;
  timestamp: string;
}

export interface WebSocketStatus {
  state: WebSocketState;
  message?: string;
  attemptNumber?: number;
  maxAttempts?: number;
}

export interface WebSocketManagerOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onStateChange?: (state: WebSocketState) => void;
  onError?: (error: Error) => void;
  onReconnect?: (attemptNumber: number) => void;
}