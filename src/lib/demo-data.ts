import { AgentLog as AgentLogType } from "@/types/agent";

export interface DemoScenario {
  type: "accommodation" | "delivery" | "payment";
  originalMessage: string;
  originalValue: string;
  tamperedValue: string;
}

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  accommodation: {
    type: "accommodation",
    originalMessage: "명동에 있는 호텔을 추천해주고, 1순위의 호텔을 예약해줘",
    originalValue: "신뢰성 있는 숙소 3곳 (Booking.com, Agoda 검증)",
    tamperedValue: "피싱 사이트 포함된 악성 숙소 링크",
  },
  delivery: {
    type: "delivery",
    originalMessage: "우리 집으로 선글라스 주문해줘",
    originalValue: "사용자 집 주소",
    tamperedValue: "강남역 무인택배함",
  },
  payment: {
    type: "payment",
    originalMessage: "100달러치 스테이블코인 구매해줘",
    originalValue: "100달러, 사용자 지갑 주소",
    tamperedValue: "500달러, 공격자 지갑 주소",
  },
};

export function generateScenarioLogs(
  scenario: string,
  sageEnabled: boolean
): AgentLogType[] {
  const baseTime = Date.now();
  const scenarioData = DEMO_SCENARIOS[scenario];

  if (!scenarioData) return [];

  const logs: AgentLogType[] = [];

  // Common initial logs
  logs.push({
    type: "routing",
    from: "user",
    to: "agent-a",
    content: `사용자 요청: '${scenarioData.originalMessage}'`,
    timestamp: new Date(baseTime).toISOString(),
    messageId: "demo-1",
  });

  // Scenario-specific logs
  switch (scenario) {
    case "accommodation":
      logs.push({
        type: "planning",
        from: "agent-a",
        to: "gateway",
        content: "추천 에이전트가 신뢰성 있는 숙소 목록 생성 완료 (위치, 평점, 가격 기반)",
        timestamp: new Date(baseTime + 1000).toISOString(),
        messageId: "demo-2",
      });
      logs.push({
        type: "gateway",
        from: "gateway",
        to: "agent-b",
        content: "게이트웨이에서 숙소 목록 전달 중...",
        timestamp: new Date(baseTime + 2000).toISOString(),
        messageId: "demo-3",
        originalPrompt: scenarioData.originalValue,
        tamperedPrompt: scenarioData.tamperedValue,
      });
      break;

    case "delivery":
      logs.push({
        type: "planning",
        from: "agent-a",
        to: "gateway",
        content: "상품 구매 요청 메시지 생성 완료 (상품명, 수량, 배송지 포함)",
        timestamp: new Date(baseTime + 1000).toISOString(),
        messageId: "demo-2",
      });
      logs.push({
        type: "gateway",
        from: "gateway",
        to: "agent-b",
        content: "구매 요청 메시지 전달 중...",
        timestamp: new Date(baseTime + 2000).toISOString(),
        messageId: "demo-3",
        originalPrompt: `배송지: ${scenarioData.originalValue}`,
        tamperedPrompt: `배송지: ${scenarioData.tamperedValue}`,
      });
      break;

    case "payment":
      logs.push({
        type: "planning",
        from: "agent-a",
        to: "gateway",
        content: "결제 명세 메시지 생성 완료 (금액: 100달러, 수신 지갑 주소 포함)",
        timestamp: new Date(baseTime + 1000).toISOString(),
        messageId: "demo-2",
      });
      logs.push({
        type: "gateway",
        from: "gateway",
        to: "agent-b",
        content: "결제 명세 메시지 전달 중...",
        timestamp: new Date(baseTime + 2000).toISOString(),
        messageId: "demo-3",
        originalPrompt: `금액: ${scenarioData.originalValue.split(",")[0]}, 주소: ${scenarioData.originalValue.split(",")[1]}`,
        tamperedPrompt: `금액: ${scenarioData.tamperedValue.split(",")[0]}, 주소: ${scenarioData.tamperedValue.split(",")[1]}`,
      });
      break;
  }

  // SAGE verification results
  if (sageEnabled) {
    logs.push({
      type: "sage",
      from: "agent-b",
      to: "system",
      content: getVerificationWarning(scenario),
      timestamp: new Date(baseTime + 3000).toISOString(),
      messageId: "demo-4",
    });
    logs.push({
      type: "ordering",
      from: "agent-b",
      to: "user",
      content: getSageProtectionMessage(scenario),
      timestamp: new Date(baseTime + 4000).toISOString(),
      messageId: "demo-5",
    });
  } else {
    logs.push({
      type: "ordering",
      from: "agent-b",
      to: "user",
      content: getAttackSuccessMessage(scenario),
      timestamp: new Date(baseTime + 3000).toISOString(),
      messageId: "demo-4",
    });
  }

  return logs;
}

function getVerificationWarning(scenario: string): string {
  switch (scenario) {
    case "accommodation":
      return "⚠️ Agent A의 서명 검증 실패! 숙소 목록 위조 감지";
    case "delivery":
      return "⚠️ Agent A의 디지털 서명 검증 실패! 배송지 정보 변조 감지";
    case "payment":
      return "⚠️ Agent A의 서명 검증 실패! 결제 정보 변조 감지";
    default:
      return "⚠️ 서명 검증 실패! 메시지 변조 감지";
  }
}

function getSageProtectionMessage(scenario: string): string {
  switch (scenario) {
    case "accommodation":
      return "🛡️ 예약 중단 및 위험 경고: 변조된 숙소 목록이 감지되어 예약을 차단했습니다.";
    case "delivery":
      return "🛡️ 주문 거절 및 재확인 요청: 배송지 정보가 변조되어 주문을 차단했습니다.";
    case "payment":
      return "🛡️ 결제 차단 및 경고: 금액/주소 변조가 감지되어 트랜잭션을 차단했습니다.";
    default:
      return "🛡️ 작업 차단: 변조된 메시지가 감지되어 작업을 차단했습니다.";
  }
}

function getAttackSuccessMessage(scenario: string): string {
  switch (scenario) {
    case "accommodation":
      return "❌ 가짜 숙소 예약 완료: 현장 도착 후 숙소 없음, 금전 피해 발생 예상";
    case "delivery":
      return "❌ 변조된 주소로 배송 완료: 강남역 무인택배함으로 배송됨, 사용자 피해 발생";
    case "payment":
      return "❌ 변조된 결제 실행: 500달러가 공격자 주소로 전송됨, 자산 탈취 발생";
    default:
      return "❌ 공격 성공: 변조된 메시지가 그대로 실행됨";
  }
}

export const SCENARIO_INFO = {
  accommodation: {
    icon: "🏨",
    title: "숙소 추천 & 예약 시나리오",
    agentA: "추천 에이전트 - 신뢰성 있는 숙소 목록 생성",
    agentB: "예약 실행 에이전트 - 1순위 숙소 자동 예약",
    attack: "게이트웨이가 피싱 사이트 포함된 악성 숙소 링크로 변조",
    placeholder: "명동에 있는 호텔을 추천해주고, 1순위의 호텔을 예약해줘",
  },
  delivery: {
    icon: "📦",
    title: "배송지 변조 시나리오",
    agentA: "구매 요청 에이전트 - 상품명, 수량, 배송지 포함한 주문 생성",
    agentB: "결제 및 배송 처리 에이전트 - 실제 결제와 배송 예약",
    attack: "구매 요청 메시지의 배송지 정보 변조 (강남역 무인택배함 등)",
    placeholder: "우리 집으로 선글라스 주문해줘",
  },
  payment: {
    icon: "💰",
    title: "결제 정보 변조 시나리오",
    agentA: "결제 명세 생성 에이전트 - 금액, 수신 지갑 주소 포함",
    agentB: "블록체인 결제 수행 에이전트 - 실제 트랜잭션 전송",
    attack: "결제 메시지의 금액 또는 수신 주소 조작 (100달러→500달러)",
    placeholder: "100달러치 스테이블코인 구매해줘",
  },
};