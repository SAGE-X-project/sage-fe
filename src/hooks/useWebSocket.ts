import { useEffect, useRef, useState, useCallback } from "react";
import { WebSocketManager } from "@/lib/websocket/WebSocketManager";
import { WebSocketConfig, WebSocketState, WebSocketMessage } from "@/lib/websocket/types";
import { AgentLog } from "@/types/agent";

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onLog?: (log: AgentLog) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: WebSocketState) => void;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  state: WebSocketState;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  send: (data: any) => void;
  isConnected: boolean;
  error: string | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const [state, setState] = useState<WebSocketState>(WebSocketState.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<WebSocketManager | null>(null);

  // Get configuration from environment variables
  const config: WebSocketConfig = {
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8085",
    endpoint: process.env.NEXT_PUBLIC_WS_ENDPOINT || "/ws",
    reconnectInterval: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_INTERVAL || "1000"),
    maxReconnectAttempts: parseInt(process.env.NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS || "5"),
    heartbeatInterval: parseInt(process.env.NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL || "30000"),
    enableRealtimeLogs: process.env.NEXT_PUBLIC_ENABLE_REALTIME_LOGS === "true",
  };

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case "log":
        if (options.onLog && message.payload && typeof message.payload === "object") {
          options.onLog(message.payload as AgentLog);
        }
        break;
      case "error":
        const errorMsg = typeof message.payload === "string" 
          ? message.payload 
          : "WebSocket error occurred";
        setError(errorMsg);
        options.onError?.(errorMsg);
        break;
      case "status":
        // Status updates are handled by onStateChange
        break;
    }
    
    options.onMessage?.(message);
  }, [options]);

  const handleStateChange = useCallback((newState: WebSocketState) => {
    setState(newState);
    options.onStateChange?.(newState);
    
    // Clear error on successful connection
    if (newState === WebSocketState.CONNECTED) {
      setError(null);
    }
  }, [options]);

  const handleError = useCallback((err: Error) => {
    const errorMessage = err.message || "Unknown WebSocket error";
    setError(errorMessage);
    options.onError?.(errorMessage);
  }, [options]);

  const handleReconnect = useCallback((attemptNumber: number) => {
    console.log(`Reconnection attempt ${attemptNumber}/${config.maxReconnectAttempts}`);
  }, [config.maxReconnectAttempts]);

  const connect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.connect();
    } else {
      managerRef.current = new WebSocketManager(config, {
        onMessage: handleMessage,
        onStateChange: handleStateChange,
        onError: handleError,
        onReconnect: handleReconnect,
      });
      managerRef.current.connect();
    }
  }, [config, handleMessage, handleStateChange, handleError, handleReconnect]);

  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    managerRef.current?.reconnect();
  }, []);

  const send = useCallback((data: any) => {
    if (!managerRef.current) {
      console.error("WebSocket manager not initialized");
      return;
    }
    managerRef.current.send(data);
  }, []);

  // Auto-connect on mount if specified
  useEffect(() => {
    if (options.autoConnect !== false && config.enableRealtimeLogs) {
      connect();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
        managerRef.current = null;
      }
    };
  }, []); // Only run on mount/unmount

  return {
    state,
    connect,
    disconnect,
    reconnect,
    send,
    isConnected: state === WebSocketState.CONNECTED,
    error,
  };
}