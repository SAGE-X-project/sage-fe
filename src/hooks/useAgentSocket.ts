// src/hooks/useAgentLog.ts
import { useEffect, useRef, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

type AgentLog = {
  type: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
};

export function useAgentLog(url: string) {
  const socketRef = useRef<ReconnectingWebSocket | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);

  useEffect(() => {
    const socket = new ReconnectingWebSocket(url);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as AgentLog;
        setLogs((prev) => [...prev, parsed]);
      } catch {
        console.warn("Invalid message:", event.data);
      }
    };

    return () => socket.close();
  }, [url]);

  return { logs };
}
