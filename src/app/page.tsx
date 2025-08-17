"use client";

import { useState, useEffect, useCallback } from "react";
import MessageFlow from "@/components/MessageFlow";
import AgentLog from "@/components/AgentLog";
import AgentFlowVisualization from "@/components/AgentFlowVisualization";
import { sendPrompt, extractTextResponse } from "@/lib/sendPrompt";
import { ChatMessage } from "@/types/Message";
import { AgentLog as AgentLogType, AgentFlowStep } from "@/types/agent";
import { useWebSocket } from "@/hooks/useWebSocket";
import { WebSocketState, WebSocketMessage } from "@/lib/websocket/types";
import { generateScenarioLogs, SCENARIO_INFO } from "@/lib/demo-data";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"flow" | "logs">("flow");
  const [isLoading, setIsLoading] = useState(false);

  // Agent 로그 및 플로우 데이터 상태
  const [logs, setLogs] = useState<AgentLogType[]>([]);
  const [flowSteps, setFlowSteps] = useState<AgentFlowStep[]>([]);
  
  // WebSocket 연결 상태
  const [wsConnectionStatus, setWsConnectionStatus] = useState<string>("연결 대기");

  // 시나리오 및 SAGE 설정 상태
  const [selectedScenario, setSelectedScenario] = useState<
    "accommodation" | "delivery" | "payment"
  >("accommodation");
  const [isSageEnabled, setIsSageEnabled] = useState(true);
  
  // WebSocket 훅 사용
  const { state: wsState, isConnected, error: wsError, reconnect } = useWebSocket({
    onLog: handleWebSocketLog,
    onStateChange: handleWebSocketStateChange,
    onError: handleWebSocketError,
    autoConnect: true,
  });

  // WebSocket 이벤트 핸들러
  function handleWebSocketLog(log: AgentLogType) {
    console.log("Received WebSocket log:", log);
    setLogs(prev => [...prev, log]);
    
    // Convert log to flow step
    const flowStep: AgentFlowStep = {
      id: log.messageId || `step-${Date.now()}`,
      type: log.type,
      from: log.from,
      to: log.to,
      content: log.content,
      timestamp: new Date(log.timestamp),
      icon: getIconForType(log.type),
      color: getColorForType(log.type),
      status: log.type === "error" ? "error" : "completed",
    };
    setFlowSteps(prev => [...prev, flowStep]);
  }
  
  function handleWebSocketStateChange(state: WebSocketState) {
    const statusMap: Record<WebSocketState, string> = {
      [WebSocketState.CONNECTING]: "연결 중...",
      [WebSocketState.CONNECTED]: "연결됨 ✅",
      [WebSocketState.DISCONNECTED]: "연결 끊김 ❌",
      [WebSocketState.RECONNECTING]: "재연결 중... 🔄",
      [WebSocketState.ERROR]: "연결 오류 ⚠️",
    };
    setWsConnectionStatus(statusMap[state] || "알 수 없음");
  }
  
  function handleWebSocketError(error: string) {
    console.error("WebSocket error:", error);
    // Add error message to chat
    const errorMessage = createMessage(
      "error",
      `WebSocket 오류: ${error}`,
      "시스템"
    );
    setMessages(prev => [...prev, errorMessage]);
  }

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
    if (!input.trim() || isLoading) return;
    const userMsg = input;

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, createMessage("user", userMsg, "사용자")]);
    setInput("");
    setIsLoading(true);

    try {
      // Send prompt with SAGE settings
      const response = await sendPrompt(userMsg, {
        sageEnabled: isSageEnabled,
        scenario: selectedScenario,
        metadata: {
          sessionId: `session-${Date.now()}`,
        },
      });
      
      // Extract text response
      const responseText = extractTextResponse(response);
      
      // 에이전트 응답 추가
      setMessages((prev) => [
        ...prev,
        createMessage(
          "agent", 
          responseText, 
          isSageEnabled ? "SAGE 에이전트 🛡️" : "일반 에이전트"
        ),
      ]);
      
      // Process logs if available
      if (response.logs && response.logs.length > 0) {
        response.logs.forEach(log => {
          handleWebSocketLog({
            type: log.type as AgentLogType["type"],
            from: log.from,
            to: log.to,
            content: log.content,
            timestamp: log.timestamp,
            messageId: log.messageId,
            originalPrompt: log.originalPrompt,
            tamperedPrompt: log.tamperedPrompt,
          });
        });
      }
      
      // Display SAGE verification status if available
      if (response.sageVerification) {
        const verificationMessage = response.sageVerification.verified
          ? "✅ SAGE 서명 검증 성공"
          : "❌ SAGE 서명 검증 실패";
        
        handleWebSocketLog({
          type: "sage",
          from: "sage-verifier",
          to: "user",
          content: verificationMessage,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      // 오류 메시지 추가
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
      setMessages((prev) => [
        ...prev,
        createMessage("error", errorMessage, "시스템"),
      ]);
    } finally {
      setIsLoading(false);
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
      default:
        return "sage-agent-badge";
    }
  };

  // 시나리오별 데모 데이터 생성 (demo-data.ts로 이동됨)
  const getScenarioData = generateScenarioLogs;

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
        <div>
          <h1 className="sage-heading-1">
            SAGE 다중 에이전트 시스템
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="sage-body-small">WebSocket:</span>
            <span className={`sage-body-small font-medium ${
              isConnected ? "text-green-600" : "text-red-600"
            }`}>
              {wsConnectionStatus}
            </span>
            {!isConnected && (
              <button
                onClick={reconnect}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                재연결
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* 시나리오 선택기 */}
          <div className="flex items-center gap-2">
            <label className="sage-body-small font-medium">
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
              className="sage-input px-3 py-1"
            >
              <option value="accommodation">{SCENARIO_INFO.accommodation.icon} {SCENARIO_INFO.accommodation.title}</option>
              <option value="delivery">{SCENARIO_INFO.delivery.icon} {SCENARIO_INFO.delivery.title}</option>
              <option value="payment">{SCENARIO_INFO.payment.icon} {SCENARIO_INFO.payment.title}</option>
            </select>
          </div>

          {/* SAGE 프로토콜 토글 스위치 */}
          <div className="flex items-center gap-2">
            <label className="sage-body-small font-medium">
              SAGE 프로토콜:
            </label>
            <button
              onClick={() => setIsSageEnabled(!isSageEnabled)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                backgroundColor: isSageEnabled 
                  ? "var(--sage-primary-600)" 
                  : "var(--sage-gray-300)"
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSageEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className="sage-body-small font-medium"
              style={{
                color: isSageEnabled 
                  ? "var(--sage-primary-600)" 
                  : "var(--sage-text-tertiary)"
              }}
            >
              {isSageEnabled ? "🛡️ ON" : "❌ OFF"}
            </span>
          </div>

          <button
            onClick={loadDemoData}
            className="sage-btn sage-btn-primary"
          >
            데모 실행
          </button>
          <button
            onClick={handleClearAll}
            className="sage-btn sage-btn-secondary"
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
            <h2 className="sage-heading-3">
              💬 사용자 대화
            </h2>
          </div>

          <MessageFlow messages={messages} />

          <div className="flex gap-2">
            <input
              className="flex-1 sage-input p-3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSend();
                } else if (e.key === "Tab" && !input.trim()) {
                  e.preventDefault();
                  const placeholderText = SCENARIO_INFO[selectedScenario]?.placeholder || "";
                  setInput(placeholderText);
                }
              }}
              placeholder={SCENARIO_INFO[selectedScenario]?.placeholder || "메시지를 입력하세요"}
            />
            <button
              className="sage-btn sage-btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">🔄</span>
                  처리 중...
                </>
              ) : (
                "보내기"
              )}
            </button>
          </div>
        </div>

        {/* Right side - Agent Monitoring */}
        <div className="space-y-4">
          {/* Tab navigation */}
          <div className="flex items-center gap-4">
            <h2 className="sage-heading-3">
              🤖 Agent 모니터링
            </h2>
            <div className="flex rounded-lg p-1" style={{ backgroundColor: "var(--sage-bg-tertiary)" }}>
              <button
                onClick={() => setActiveTab("flow")}
                className={`px-3 py-1 sage-body-small font-medium rounded-md transition-colors ${
                  activeTab === "flow"
                    ? "sage-tab-active"
                    : "sage-tab-inactive"
                }`}
              >
                메시지 흐름
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`px-3 py-1 sage-body-small font-medium rounded-md transition-colors ${
                  activeTab === "logs"
                    ? "sage-tab-active"
                    : "sage-tab-inactive"
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
      <div className="mt-8 p-6 sage-info-card">
        <h3 className="sage-heading-4 mb-3 flex items-center gap-2" style={{ color: "var(--sage-primary-700)" }}>
          <span>🔍</span>
          시스템 안내
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🏨</span>
            <div>
              <div className="sage-body font-semibold mb-2" style={{ color: "var(--sage-primary-700)" }}>
                숙소 추천 & 예약 시나리오
              </div>
              <div className="sage-body-small mb-2" style={{ color: "var(--sage-text-primary)" }}>
                <strong>Agent A:</strong> 추천 에이전트 - 신뢰성 있는 숙소 목록
                생성
                <br />
                <strong>Agent B:</strong> 예약 실행 에이전트 - 1순위 숙소 자동
                예약
              </div>
              <div className="sage-caption" style={{ color: "var(--sage-text-secondary)" }}>
                공격: 게이트웨이가 피싱 사이트 포함된 악성 숙소 링크로 변조
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">📦</span>
            <div>
              <div className="sage-body font-semibold mb-2" style={{ color: "var(--sage-primary-700)" }}>
                배송지 변조 시나리오
              </div>
              <div className="sage-body-small mb-2" style={{ color: "var(--sage-text-primary)" }}>
                <strong>Agent A:</strong> 구매 요청 에이전트 - 상품명, 수량,
                배송지 포함한 주문 생성
                <br />
                <strong>Agent B:</strong> 결제 및 배송 처리 에이전트 - 실제
                결제와 배송 예약
              </div>
              <div className="sage-caption" style={{ color: "var(--sage-text-secondary)" }}>
                공격: 구매 요청 메시지의 배송지 정보 변조 (강남역 무인택배함 등)
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl">💰</span>
            <div>
              <div className="sage-body font-semibold mb-2" style={{ color: "var(--sage-primary-700)" }}>
                결제 정보 변조 시나리오
              </div>
              <div className="sage-body-small mb-2" style={{ color: "var(--sage-text-primary)" }}>
                <strong>Agent A:</strong> 결제 명세 생성 에이전트 - 금액, 수신
                지갑 주소 포함
                <br />
                <strong>Agent B:</strong> 블록체인 결제 수행 에이전트 - 실제
                트랜잭션 전송
              </div>
              <div className="sage-caption" style={{ color: "var(--sage-text-secondary)" }}>
                공격: 결제 메시지의 금액 또는 수신 주소 조작 (100달러→500달러)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <span className="text-lg">🛡️</span>
            <div>
              <div className="sage-body font-medium mb-1" style={{ color: "var(--sage-primary-700)" }}>
                SAGE 프로토콜 ON
              </div>
              <div className="sage-body-small" style={{ color: "var(--sage-text-primary)" }}>
                프롬프트 변조를 감지하고 원본 요청으로 안전하게 처리합니다.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">❌</span>
            <div>
              <div className="sage-body font-medium mb-1" style={{ color: "var(--sage-primary-700)" }}>
                SAGE 프로토콜 OFF
              </div>
              <div className="sage-body-small" style={{ color: "var(--sage-text-primary)" }}>
                변조된 요청이 그대로 처리되어 의도하지 않은 결과가 발생합니다.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 sage-info-highlight">
          <div className="sage-body-small">
            <strong>💡 사용법:</strong> 시나리오를 선택하고 SAGE 프로토콜을
            ON/OFF로 전환한 후 &quot;데모 실행&quot; 버튼을 클릭하여 다양한
            상황을 체험해보세요.
          </div>
        </div>
      </div>
    </main>
  );
}
