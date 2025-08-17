// src/components/AgentFlowVisualization.tsx
"use client";

import { AgentFlowStep } from "@/types/agent";
import clsx from "clsx";

interface AgentFlowVisualizationProps {
  flowSteps: AgentFlowStep[];
  showHeader?: boolean;
  maxHeight?: string;
}

// Format timestamp for display
const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Get status indicator
const getStatusIndicator = (status: AgentFlowStep["status"]): string => {
  switch (status) {
    case "pending":
      return "⏳";
    case "processing":
      return "⚡";
    case "completed":
      return "✅";
    case "error":
      return "❌";
    default:
      return "📄";
  }
};

// Get animation classes for status
const getStatusAnimation = (status: AgentFlowStep["status"]): string => {
  switch (status) {
    case "processing":
      return "animate-pulse";
    case "completed":
      return "animate-none";
    case "error":
      return "animate-bounce";
    default:
      return "";
  }
};

export default function AgentFlowVisualization({
  flowSteps,
  showHeader = true,
  maxHeight = "h-96",
}: AgentFlowVisualizationProps) {
  return (
    <div className="sage-card">
      {showHeader && (
        <div className="sage-card-header">
          <h3 className="sage-body-small font-semibold flex items-center gap-2">
            <span className="text-lg">🔄</span>
            Agent 메시지 흐름
          </h3>
        </div>
      )}

      <div className={clsx("p-4 overflow-auto sage-scrollbar", maxHeight)}>
        {flowSteps.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--sage-text-tertiary)" }}>
            <div className="text-2xl mb-2">🌊</div>
            <div className="sage-body">메시지 흐름을 기다리는 중...</div>
          </div>
        ) : (
          <div className="relative">
            {/* Flow timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: "var(--sage-border-default)" }}></div>

            <div className="space-y-4">
              {flowSteps.map((step, idx) => (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Icon circle */}
                  <div
                    className={clsx(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 text-lg sage-agent-badge",
                      step.color,
                      getStatusAnimation(step.status)
                    )}
                  >
                    {step.icon}
                  </div>

                  {/* Flow step content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={clsx(
                        "p-4 rounded-lg border shadow-sm sage-agent-badge",
                        step.color
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="sage-body-small font-semibold uppercase tracking-wide">
                            {step.type}
                          </span>
                          <span
                            className={clsx(
                              "sage-body-small",
                              getStatusAnimation(step.status)
                            )}
                          >
                            {getStatusIndicator(step.status)}
                          </span>
                        </div>
                        <div className="sage-caption">
                          {formatTime(step.timestamp)}
                        </div>
                      </div>

                      {/* Flow direction */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-white bg-opacity-60 rounded sage-code">
                          {step.from}
                        </span>
                        <span style={{ color: "var(--sage-text-tertiary)" }}>→</span>
                        <span className="px-2 py-1 bg-white bg-opacity-60 rounded sage-code">
                          {step.to}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="sage-body-small">
                        {step.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
