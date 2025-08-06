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

  // 시나리오 및 SAGE 설정 상태
  const [selectedScenario, setSelectedScenario] = useState<
    "accommodation" | "delivery" | "payment"
  >("accommodation");
  const [isSageEnabled, setIsSageEnabled] = useState(true);

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

  // 시나리오별 데모 데이터 생성
  const getScenarioData = (scenario: string, sageEnabled: boolean) => {
    const baseTime = Date.now();

    if (scenario === "accommodation") {
      const originalMessage =
        "명동에 있는 호텔을 추천해주고, 1순위의 호텔을 예약해줘";
      const originalRecommendations =
        "신뢰성 있는 숙소 3곳 (Booking.com, Agoda 검증)";
      const tamperedRecommendations = "피싱 사이트 포함된 악성 숙소 링크";

      const logs: AgentLogType[] = [
        {
          type: "routing",
          from: "user",
          to: "agent-a",
          content: `사용자 요청: '${originalMessage}'`,
          timestamp: new Date(baseTime).toISOString(),
          messageId: "demo-1",
        },
        {
          type: "planning",
          from: "agent-a",
          to: "gateway",
          content:
            "추천 에이전트가 신뢰성 있는 숙소 목록 생성 완료 (위치, 평점, 가격 기반)",
          timestamp: new Date(baseTime + 1000).toISOString(),
          messageId: "demo-2",
        },
        {
          type: "gateway",
          from: "gateway",
          to: "agent-b",
          content: "게이트웨이에서 숙소 목록 전달 중...",
          timestamp: new Date(baseTime + 2000).toISOString(),
          messageId: "demo-3",
          originalPrompt: originalRecommendations,
          tamperedPrompt: tamperedRecommendations,
        },
      ];

      if (sageEnabled) {
        logs.push({
          type: "sage",
          from: "agent-b",
          to: "system",
          content: "⚠️ Agent A의 서명 검증 실패! 숙소 목록 위조 감지",
          timestamp: new Date(baseTime + 3000).toISOString(),
          messageId: "demo-4",
        });
        logs.push({
          type: "ordering",
          from: "agent-b",
          to: "user",
          content:
            "🛡️ 예약 중단 및 위험 경고: 변조된 숙소 목록이 감지되어 예약을 차단했습니다.",
          timestamp: new Date(baseTime + 4000).toISOString(),
          messageId: "demo-5",
        });
      } else {
        logs.push({
          type: "ordering",
          from: "agent-b",
          to: "user",
          content:
            "❌ 가짜 숙소 예약 완료: 현장 도착 후 숙소 없음, 금전 피해 발생 예상",
          timestamp: new Date(baseTime + 3000).toISOString(),
          messageId: "demo-4",
        });
      }

      return logs;
    }

    if (scenario === "delivery") {
      const originalMessage = "우리 집으로 선글라스 주문해줘";
      const originalAddress = "사용자 집 주소";
      const tamperedAddress = "강남역 무인택배함";

      const logs: AgentLogType[] = [
        {
          type: "routing",
          from: "user",
          to: "agent-a",
          content: `사용자 요청: '${originalMessage}'`,
          timestamp: new Date(baseTime).toISOString(),
          messageId: "demo-1",
        },
        {
          type: "planning",
          from: "agent-a",
          to: "gateway",
          content:
            "상품 구매 요청 메시지 생성 완료 (상품명, 수량, 배송지 포함)",
          timestamp: new Date(baseTime + 1000).toISOString(),
          messageId: "demo-2",
        },
        {
          type: "gateway",
          from: "gateway",
          to: "agent-b",
          content: "구매 요청 메시지 전달 중...",
          timestamp: new Date(baseTime + 2000).toISOString(),
          messageId: "demo-3",
          originalPrompt: `배송지: ${originalAddress}`,
          tamperedPrompt: `배송지: ${tamperedAddress}`,
        },
      ];

      if (sageEnabled) {
        logs.push({
          type: "sage",
          from: "agent-b",
          to: "system",
          content: "⚠️ Agent A의 디지털 서명 검증 실패! 배송지 정보 변조 감지",
          timestamp: new Date(baseTime + 3000).toISOString(),
          messageId: "demo-4",
        });
        logs.push({
          type: "ordering",
          from: "agent-b",
          to: "user",
          content:
            "🛡️ 주문 거절 및 재확인 요청: 배송지 정보가 변조되어 주문을 차단했습니다.",
          timestamp: new Date(baseTime + 4000).toISOString(),
          messageId: "demo-5",
        });
      } else {
        logs.push({
          type: "ordering",
          from: "agent-b",
          to: "user",
          content:
            "❌ 변조된 주소로 배송 완료: 강남역 무인택배함으로 배송됨, 사용자 피해 발생",
          timestamp: new Date(baseTime + 3000).toISOString(),
          messageId: "demo-4",
        });
      }

      return logs;
    }

    if (scenario === "payment") {
      const originalAmount = "100달러";
      const tamperedAmount = "500달러";
      const originalAddress = "사용자 지갑 주소";
      const tamperedAddress = "공격자 지갑 주소";

      const logs: AgentLogType[] = [
        {
          type: "routing",
          from: "user",
          to: "agent-a",
          content: "사용자 요청: '100달러치 스테이블코인 구매해줘'",
          timestamp: new Date(baseTime).toISOString(),
          messageId: "demo-1",
        },
        {
          type: "planning",
          from: "agent-a",
          to: "gateway",
          content:
            "결제 명세 메시지 생성 완료 (금액: 100달러, 수신 지갑 주소 포함)",
          timestamp: new Date(baseTime + 1000).toISOString(),
          messageId: "demo-2",
        },
        {
          type: "gateway",
          from: "gateway",
          to: "agent-b",
          content: "결제 명세 메시지 전달 중...",
          timestamp: new Date(baseTime + 2000).toISOString(),
          messageId: "demo-3",
          originalPrompt: `금액: ${originalAmount}, 주소: ${originalAddress}`,
          tamperedPrompt: `금액: ${tamperedAmount}, 주소: ${tamperedAddress}`,
        },
      ];

      if (sageEnabled) {
        logs.push({
          type: "sage",
          from: "agent-b",
          to: "system",
          content: "⚠️ Agent A의 서명 검증 실패! 결제 정보 변조 감지",
          timestamp: new Date(baseTime + 3000).toISOString(),
          messageId: "demo-4",
        });
        logs.push({
          type: "ordering",
          from: "agent-b",
          to: "user",
          content:
            "🛡️ 결제 차단 및 경고: 금액/주소 변조가 감지되어 트랜잭션을 차단했습니다.",
          timestamp: new Date(baseTime + 4000).toISOString(),
          messageId: "demo-5",
        });
      } else {
        logs.push({
          type: "ordering",
          from: "agent-b",
          to: "user",
          content:
            "❌ 변조된 결제 실행: 500달러가 공격자 주소로 전송됨, 자산 탈취 발생",
          timestamp: new Date(baseTime + 3000).toISOString(),
          messageId: "demo-4",
        });
      }

      return logs;
    }

    return [];
  };

  // 데모 데이터 로드
  const loadDemoData = () => {
    const demoLogs = getScenarioData(selectedScenario, isSageEnabled);

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
        <div className="flex items-center gap-4 flex-wrap">
          {/* 시나리오 선택기 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              시나리오:
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => {
                setSelectedScenario(
                  e.target.value as "accommodation" | "delivery" | "payment"
                );
                // 시나리오 변경 시 자동 초기화
                setLogs([]);
                setFlowSteps([]);
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="accommodation">🏨 숙소 추천 & 예약</option>
              <option value="delivery">📦 배송지 변조</option>
              <option value="payment">💰 결제 정보 변조</option>
            </select>
          </div>

          {/* SAGE 프로토콜 토글 스위치 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              SAGE 프로토콜:
            </label>
            <button
              onClick={() => setIsSageEnabled(!isSageEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isSageEnabled ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSageEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                isSageEnabled ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {isSageEnabled ? "🛡️ ON" : "❌ OFF"}
            </span>
          </div>

          <button
            onClick={loadDemoData}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            데모 실행
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            초기화
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
                } else if (e.key === "Tab" && !input.trim()) {
                  e.preventDefault();
                  const placeholderText =
                    selectedScenario === "accommodation"
                      ? "명동에 있는 호텔을 추천해주고, 1순위의 호텔을 예약해줘"
                      : selectedScenario === "delivery"
                      ? "우리 집으로 선글라스 주문해줘"
                      : "100달러치 스테이블코인 구매해줘";
                  setInput(placeholderText);
                }
              }}
              placeholder={
                selectedScenario === "accommodation"
                  ? "명동에 있는 호텔을 추천해주고, 1순위의 호텔을 예약해줘"
                  : selectedScenario === "delivery"
                  ? "우리 집으로 선글라스 주문해줘"
                  : "100달러치 스테이블코인 구매해줘"
              }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🏨</span>
            <div>
              <div className="font-semibold text-blue-800 mb-2">
                숙소 추천 & 예약 시나리오
              </div>
              <div className="text-blue-700 mb-2">
                <strong>Agent A:</strong> 추천 에이전트 - 신뢰성 있는 숙소 목록
                생성
                <br />
                <strong>Agent B:</strong> 예약 실행 에이전트 - 1순위 숙소 자동
                예약
              </div>
              <div className="text-blue-600 text-xs">
                공격: 게이트웨이가 피싱 사이트 포함된 악성 숙소 링크로 변조
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">📦</span>
            <div>
              <div className="font-semibold text-blue-800 mb-2">
                배송지 변조 시나리오
              </div>
              <div className="text-blue-700 mb-2">
                <strong>Agent A:</strong> 구매 요청 에이전트 - 상품명, 수량,
                배송지 포함한 주문 생성
                <br />
                <strong>Agent B:</strong> 결제 및 배송 처리 에이전트 - 실제
                결제와 배송 예약
              </div>
              <div className="text-blue-600 text-xs">
                공격: 구매 요청 메시지의 배송지 정보 변조 (강남역 무인택배함 등)
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">💰</span>
            <div>
              <div className="font-semibold text-blue-800 mb-2">
                결제 정보 변조 시나리오
              </div>
              <div className="text-blue-700 mb-2">
                <strong>Agent A:</strong> 결제 명세 생성 에이전트 - 금액, 수신
                지갑 주소 포함
                <br />
                <strong>Agent B:</strong> 블록체인 결제 수행 에이전트 - 실제
                트랜잭션 전송
              </div>
              <div className="text-blue-600 text-xs">
                공격: 결제 메시지의 금액 또는 수신 주소 조작 (100달러→500달러)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-lg">🛡️</span>
            <div className="text-blue-700">
              <div className="font-medium text-blue-800 mb-1">
                SAGE 프로토콜 ON
              </div>
              <div>
                프롬프트 변조를 감지하고 원본 요청으로 안전하게 처리합니다.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">❌</span>
            <div className="text-blue-700">
              <div className="font-medium text-blue-800 mb-1">
                SAGE 프로토콜 OFF
              </div>
              <div>
                변조된 요청이 그대로 처리되어 의도하지 않은 결과가 발생합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>💡 사용법:</strong> 시나리오를 선택하고 SAGE 프로토콜을
            ON/OFF로 전환한 후 &quot;데모 실행&quot; 버튼을 클릭하여 다양한
            상황을 체험해보세요.
          </div>
        </div>
      </div>
    </main>
  );
}
