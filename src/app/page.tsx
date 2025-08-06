"use client";

import { useState } from "react";
import MessageFlow from "@/components/MessageFlow";
import AgentLog from "@/components/AgentLog";
import AgentFlowVisualization from "@/components/AgentFlowVisualization";
import { sendPrompt } from "@/lib/sendPrompt";
import { ChatMessage } from "@/types/Message";
import { AgentLog as AgentLogType, AgentFlowStep } from "@/types/agent";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"flow" | "logs">("flow");

  // Agent 로그 및 플로우 데이터 상태
  const [logs, setLogs] = useState<AgentLogType[]>([]);
  const [flowSteps, setFlowSteps] = useState<AgentFlowStep[]>([]);

  const createMessage = (
    sender: "user" | "agent" | "error",
    content: string,
    senderName: string
  ): ChatMessage => ({
    id: Date.now().toString() + Math.random(),
    sender,
    senderName,
    content,
    timestamp: new Date(),
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, createMessage("user", userMsg, "사용자")]);
    setInput("");

    try {
      const response = await sendPrompt(userMsg);
      // 에이전트 응답 추가
      setMessages((prev) => [
        ...prev,
        createMessage("agent", response, "SAGE 에이전트"),
      ]);
    } catch (err) {
      // 오류 메시지 추가
      setMessages((prev) => [
        ...prev,
        createMessage("error", (err as Error).message, "시스템"),
      ]);
    }
  };

  // 타입별 아이콘 반환
  const getIconForType = (type: string): string => {
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
      default:
        return "📝";
    }
  };

  // 타입별 색상 반환
  const getColorForType = (type: string): string => {
    switch (type) {
      case "routing":
        return "bg-purple-100 border-purple-300 text-purple-800";
      case "planning":
        return "bg-blue-100 border-blue-300 text-blue-800";
      case "ordering":
        return "bg-green-100 border-green-300 text-green-800";
      case "gateway":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "sage":
        return "bg-indigo-100 border-indigo-300 text-indigo-800";
      case "error":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  // 데모 데이터 로드
  const loadDemoData = () => {
    const demoLogs: AgentLogType[] = [
      {
        type: "routing",
        from: "user",
        to: "root-agent",
        content: "사용자 요청: '3일간 도쿄 여행 계획 세워줘'",
        timestamp: new Date().toISOString(),
        messageId: "demo-1",
      },
      {
        type: "routing",
        from: "root-agent",
        to: "planning-gateway",
        content: "여행 계획 요청으로 분류하여 Planning Agent로 라우팅",
        timestamp: new Date(Date.now() + 1000).toISOString(),
        messageId: "demo-2",
      },
      {
        type: "gateway",
        from: "planning-gateway",
        to: "planning-agent",
        content: "게이트웨이에서 프롬프트 처리 중...",
        timestamp: new Date(Date.now() + 2000).toISOString(),
        messageId: "demo-3",
        originalPrompt: "3일간 도쿄 여행 계획 세워줘",
        tamperedPrompt: "1일간 오사카 여행 계획 세워줘",
      },
      {
        type: "sage",
        from: "sage-protocol",
        to: "system",
        content: "⚠️ 프롬프트 변조 감지! 원본과 다른 내용이 발견되었습니다.",
        timestamp: new Date(Date.now() + 3000).toISOString(),
        messageId: "demo-4",
      },
      {
        type: "planning",
        from: "planning-agent",
        to: "user",
        content:
          "SAGE 프로토콜 보호로 인해 원본 요청으로 여행 계획을 생성했습니다.",
        timestamp: new Date(Date.now() + 4000).toISOString(),
        messageId: "demo-5",
      },
    ];

    const demoFlowSteps: AgentFlowStep[] = demoLogs.map((log) => ({
      id: log.messageId || `step-${Math.random()}`,
      type: log.type,
      from: log.from,
      to: log.to,
      content: log.content,
      timestamp: new Date(log.timestamp),
      icon: getIconForType(log.type),
      color: getColorForType(log.type),
      status: log.type === "error" ? "error" : "completed",
    }));

    setLogs(demoLogs);
    setFlowSteps(demoFlowSteps);
  };

  const handleClearAll = () => {
    setMessages([]);
    setLogs([]);
    setFlowSteps([]);
  };

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          SAGE 다중 에이전트 시스템
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={loadDemoData}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agent 흐름 데모
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            전체 초기화
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left side - Chat Interface */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">
              💬 사용자 대화
            </h2>
          </div>

          <MessageFlow messages={messages} />

          <div className="flex gap-2">
            <input
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="예: 3일간 도쿄 여행 계획 세워줘 또는 노트북 주문하고 싶어"
            />
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              보내기
            </button>
          </div>
        </div>

        {/* Right side - Agent Monitoring */}
        <div className="space-y-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              🤖 Agent 모니터링
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("flow")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === "flow"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                메시지 흐름
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeTab === "logs"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                상세 로그
              </button>
            </div>
          </div>

          {/* Tab content */}
          {activeTab === "flow" ? (
            <AgentFlowVisualization
              flowSteps={flowSteps}
              showHeader={false}
              maxHeight="h-[600px]"
            />
          ) : (
            <AgentLog logs={logs} showHeader={false} maxHeight="h-[600px]" />
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span>🔍</span>
          시스템 안내
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-lg">🧠</span>
            <div>
              <div className="font-medium text-blue-800">Root Agent</div>
              <div className="text-blue-700">
                요청을 분석하여 적절한 하위 에이전트로 라우팅
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">✈️</span>
            <div>
              <div className="font-medium text-blue-800">Planning Agent</div>
              <div className="text-blue-700">
                여행 계획 및 일정 관련 요청 처리
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🛒</span>
            <div>
              <div className="font-medium text-blue-800">Ordering Agent</div>
              <div className="text-blue-700">
                상품 주문 및 구매 관련 요청 처리
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg">🛡️</span>
            <div className="text-blue-700">
              <strong className="text-blue-800">SAGE 프로토콜:</strong>{" "}
              게이트웨이의 악의적인 프롬프트 변조를 탐지하고 방어합니다.
              &quot;Agent 흐름 데모&quot; 버튼을 클릭하여 프롬프트 변조 탐지
              과정을 확인해보세요.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
