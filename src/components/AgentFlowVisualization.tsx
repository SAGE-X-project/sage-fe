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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-lg">🔄</span>
            Agent 메시지 흐름
          </h3>
        </div>
      )}

      <div className={clsx("p-4 overflow-auto", maxHeight)}>
        {flowSteps.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">🌊</div>
            <div>메시지 흐름을 기다리는 중...</div>
          </div>
        ) : (
          <div className="relative">
            {/* Flow timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-4">
              {flowSteps.map((step, idx) => (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Icon circle */}
                  <div
                    className={clsx(
                      "relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 text-lg",
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
                        "p-4 rounded-lg border shadow-sm",
                        step.color
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm uppercase tracking-wide">
                            {step.type}
                          </span>
                          <span
                            className={clsx(
                              "text-sm",
                              getStatusAnimation(step.status)
                            )}
                          >
                            {getStatusIndicator(step.status)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatTime(step.timestamp)}
                        </div>
                      </div>

                      {/* Flow direction */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="px-2 py-1 bg-white bg-opacity-60 rounded font-mono">
                          {step.from}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="px-2 py-1 bg-white bg-opacity-60 rounded font-mono">
                          {step.to}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="text-sm leading-relaxed">
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
