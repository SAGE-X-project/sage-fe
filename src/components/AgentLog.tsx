// src/components/AgentLog.tsx
import clsx from "clsx";
import { AgentLog as AgentLogType } from "@/types/agent";

interface AgentLogProps {
  logs: AgentLogType[];
  showHeader?: boolean;
  maxHeight?: string;
}

// Format timestamp for display
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  } catch {
    return timestamp;
  }
};

// Get icon for agent type
const getAgentIcon = (type: string): string => {
  switch (type) {
    case "routing":
      return "🧠";
    case "planning":
      return "✈️";
    case "ordering":
      return "🛒";
    case "gateway":
      return "🚪";
    case "sage":
      return "🛡️";
    case "error":
      return "❌";
    case "info":
      return "📝";
    default:
      return "📄";
  }
};

// Get color classes for agent type
const getAgentColorClasses = (type: string): string => {
  switch (type) {
    case "routing":
      return "bg-purple-50 border-purple-200 text-purple-900";
    case "planning":
      return "bg-blue-50 border-blue-200 text-blue-900";
    case "ordering":
      return "bg-green-50 border-green-200 text-green-900";
    case "gateway":
      return "bg-yellow-50 border-yellow-200 text-yellow-900";
    case "sage":
      return "bg-indigo-50 border-indigo-200 text-indigo-900";
    case "error":
      return "bg-red-50 border-red-200 text-red-900";
    case "info":
      return "bg-blue-50 border-blue-200 text-blue-900";
    default:
      return "bg-gray-50 border-gray-200 text-gray-900";
  }
};

export default function AgentLog({
  logs,
  showHeader = true,
  maxHeight = "h-96",
}: AgentLogProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">📊</span>
            Agent 내부 처리 로그
          </h3>
        </div>
      )}

      <div
        className={clsx(
          "p-4 overflow-auto font-mono text-sm space-y-3",
          maxHeight
        )}
      >
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">🔍</div>
            <div>Agent 로그를 기다리는 중...</div>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={clsx(
                "p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                getAgentColorClasses(log.type)
              )}
            >
              {/* Header with icon, type, and timestamp */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getAgentIcon(log.type)}</span>
                  <span className="font-semibold uppercase text-xs tracking-wide">
                    {log.type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-white bg-opacity-60 rounded-full">
                    {log.from} → {log.to}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>

              {/* Content */}
              <div className="text-sm leading-relaxed">{log.content}</div>

              {/* Show tampered prompt if available */}
              {log.originalPrompt && log.tamperedPrompt && (
                <div className="mt-3 p-2 bg-white bg-opacity-50 rounded border border-red-300">
                  <div className="text-xs font-medium text-red-700 mb-1">
                    ⚠️ 프롬프트 변조 감지
                  </div>
                  <div className="text-xs">
                    <div className="mb-1">
                      <span className="font-medium">원본:</span>{" "}
                      {log.originalPrompt}
                    </div>
                    <div>
                      <span className="font-medium">변조됨:</span>{" "}
                      {log.tamperedPrompt}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
