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
      return "sage-agent-routing";
    case "planning":
      return "sage-agent-planning";
    case "ordering":
      return "sage-agent-ordering";
    case "gateway":
      return "sage-agent-gateway";
    case "sage":
      return "sage-agent-sage";
    case "error":
      return "sage-badge-error";
    case "info":
      return "sage-badge-info";
    default:
      return "sage-agent-badge";
  }
};

export default function AgentLog({
  logs,
  showHeader = true,
  maxHeight = "h-96",
}: AgentLogProps) {
  return (
    <div className="sage-card">
      {showHeader && (
        <div className="sage-card-header">
          <h3 className="sage-body-small font-semibold flex items-center gap-2">
            <span className="text-lg">📊</span>
            Agent 내부 처리 로그
          </h3>
        </div>
      )}

      <div
        className={clsx(
          "p-4 overflow-auto sage-scrollbar space-y-3",
          maxHeight
        )}
        style={{ fontFamily: "var(--sage-font-mono)" }}
      >
        {logs.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--sage-text-tertiary)" }}>
            <div className="text-2xl mb-2">🔍</div>
            <div className="sage-body">Agent 로그를 기다리는 중...</div>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={clsx(
                "p-3 rounded-lg border transition-all duration-200 hover:shadow-sm sage-agent-badge",
                getAgentColorClasses(log.type)
              )}
            >
              {/* Header with icon, type, and timestamp */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getAgentIcon(log.type)}</span>
                  <span className="sage-caption font-semibold uppercase tracking-wide">
                    {log.type}
                  </span>
                  <span className="sage-caption px-2 py-1 bg-white bg-opacity-60 rounded-full">
                    {log.from} → {log.to}
                  </span>
                </div>
                <div className="sage-caption">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>

              {/* Content */}
              <div className="sage-body-small">{log.content}</div>

              {/* Show tampered prompt if available */}
              {log.originalPrompt && log.tamperedPrompt && (
                <div className="mt-3 p-2 bg-white bg-opacity-50 rounded sage-badge-error">
                  <div className="sage-caption font-medium mb-1">
                    ⚠️ 프롬프트 변조 감지
                  </div>
                  <div className="sage-caption">
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
