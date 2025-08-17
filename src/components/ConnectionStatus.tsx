import React from "react";
import { WebSocketState } from "@/lib/websocket/types";

interface ConnectionStatusProps {
  wsState: WebSocketState;
  isConnected: boolean;
  error?: string | null;
  onReconnect?: () => void;
}

export default function ConnectionStatus({
  wsState,
  isConnected,
  error,
  onReconnect,
}: ConnectionStatusProps) {
  const getStatusColor = () => {
    switch (wsState) {
      case WebSocketState.CONNECTED:
        return "bg-green-100 text-green-800 border-green-300";
      case WebSocketState.CONNECTING:
      case WebSocketState.RECONNECTING:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case WebSocketState.ERROR:
      case WebSocketState.DISCONNECTED:
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = () => {
    switch (wsState) {
      case WebSocketState.CONNECTED:
        return "✅";
      case WebSocketState.CONNECTING:
        return "⏳";
      case WebSocketState.RECONNECTING:
        return "🔄";
      case WebSocketState.ERROR:
        return "❌";
      case WebSocketState.DISCONNECTED:
        return "🔌";
      default:
        return "❓";
    }
  };

  const getStatusText = () => {
    switch (wsState) {
      case WebSocketState.CONNECTED:
        return "연결됨";
      case WebSocketState.CONNECTING:
        return "연결 중...";
      case WebSocketState.RECONNECTING:
        return "재연결 중...";
      case WebSocketState.ERROR:
        return "연결 오류";
      case WebSocketState.DISCONNECTED:
        return "연결 끊김";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
      <span className="text-lg">{getStatusIcon()}</span>
      <span className="text-sm font-medium">{getStatusText()}</span>
      {!isConnected && onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-2 text-xs underline hover:no-underline"
        >
          재연결
        </button>
      )}
      {error && (
        <span className="ml-2 text-xs" title={error}>
          ⚠️
        </span>
      )}
    </div>
  );
}