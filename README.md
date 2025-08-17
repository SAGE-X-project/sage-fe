# SAGE Multi-Agent Demo Frontend

SAGE 프로토콜을 활용한 다중 에이전트 시스템의 프론트엔드 데모 애플리케이션입니다.

## 🌟 주요 기능

- **SAGE 프로토콜 통합**: RFC-9421 기반 HTTP 메시지 서명을 통한 안전한 에이전트 간 통신
- **실시간 로그 모니터링**: WebSocket을 통한 에이전트 간 통신 로그 실시간 표시
- **시나리오 데모**: 숙소 예약, 배송, 결제 등 실제 사용 사례 시뮬레이션
- **SAGE ON/OFF 비교**: 프로토콜 활성화 여부에 따른 보안 차이 시연

## 🚀 빠른 시작

### 1. 프로젝트 클론 및 의존성 설치
```bash
git clone https://github.com/SAGE-X-project/sage-fe.git
cd sage-fe
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env.local
# .env.local 파일을 열어 필요한 설정 수정
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📋 환경변수 설정 가이드

`.env.local` 파일 생성 및 설정:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8086
NEXT_PUBLIC_API_ENDPOINT=/send/prompt

# WebSocket Configuration (실시간 로그)
NEXT_PUBLIC_WS_URL=ws://localhost:8085
NEXT_PUBLIC_WS_ENDPOINT=/ws

# WebSocket Settings
NEXT_PUBLIC_WS_RECONNECT_INTERVAL=1000      # 재연결 시도 간격 (ms)
NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS=5      # 최대 재연결 시도 횟수
NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL=30000      # 하트비트 간격 (ms)

# Environment
NEXT_PUBLIC_ENV=development                  # development | staging | production

# Feature Flags
NEXT_PUBLIC_ENABLE_SAGE_PROTOCOL=true        # SAGE 프로토콜 활성화
NEXT_PUBLIC_ENABLE_REALTIME_LOGS=true        # 실시간 로그 활성화
```

## 🧪 테스트 실행 방법

### 방법 1: 프론트엔드만 테스트 (백엔드 없이)

백엔드 없이 UI와 데모 기능만 테스트:

```bash
# WebSocket 비활성화
echo "NEXT_PUBLIC_ENABLE_REALTIME_LOGS=false" >> .env.local

# 개발 서버 실행
npm run dev
```

페이지에서 "데모 실행" 버튼으로 하드코딩된 시나리오 테스트 가능

### 방법 2: 전체 시스템 통합 테스트

#### Step 1: 백엔드 서버 실행 (sage-multi-agent)

각각 다른 터미널에서 실행:

```bash
# Terminal 1: Root Agent (메인 라우터 + WebSocket 서버)
cd sage-multi-agent
export GOOGLE_API_KEY=your_api_key
go run root/main.go --port 8080 --ws-port 8085 --skip-verification

# Terminal 2: Client Server (프론트엔드 API 연결)
go run client/main.go --port 8086 --root-url http://localhost:8080

# Terminal 3: Ordering Agent
export GOOGLE_API_KEY=your_api_key
go run ordering/main.go --port 8083

# Terminal 4: Planning Agent
export GOOGLE_API_KEY=your_api_key
go run planning/main.go --port 8084
```

#### Step 2: 프론트엔드 실행

```bash
cd sage-fe
npm run dev
```

#### Step 3: 테스트 수행

1. http://localhost:3000 접속
2. 헤더에서 WebSocket 연결 상태 확인 (녹색: 연결됨)
3. SAGE 프로토콜 ON/OFF 토글
4. 시나리오 선택 (숙소/배송/결제)
5. 메시지 입력 및 전송
6. 우측 패널에서 실시간 로그 확인

## 🏗️ 프로젝트 구조

```
sage-fe/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/send-prompt/       # 백엔드 API 프록시
│   │   ├── page.tsx               # 메인 페이지
│   │   └── layout.tsx             # 레이아웃
│   ├── components/                # UI 컴포넌트
│   │   ├── AgentFlowVisualization.tsx  # 에이전트 플로우 시각화
│   │   ├── AgentLog.tsx               # 로그 표시
│   │   ├── ConnectionStatus.tsx       # 연결 상태 표시
│   │   └── MessageFlow.tsx            # 채팅 메시지 표시
│   ├── hooks/
│   │   └── useWebSocket.ts       # WebSocket 커스텀 훅
│   ├── lib/
│   │   ├── sendPrompt.ts         # API 통신 유틸리티
│   │   └── websocket/            # WebSocket 관리
│   │       ├── WebSocketManager.ts  # WebSocket 매니저 클래스
│   │       └── types.ts             # WebSocket 타입 정의
│   └── types/                    # TypeScript 타입 정의
├── .env.example                  # 환경변수 예시
├── .env.local                    # 실제 환경변수 (git ignore)
├── TEST_GUIDE.md                 # 상세 테스트 가이드
└── BACKEND_INTEGRATION.md        # 백엔드 연동 문서
```

## 🔧 주요 기술 스택

- **Framework**: Next.js 15.4.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **WebSocket**: reconnecting-websocket (자동 재연결)
- **State Management**: React Hooks
- **Package Manager**: npm

## 🚦 포트 사용 현황

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **Frontend** (Next.js) | 3000 | 웹 UI |
| **Root Agent** | 8080 | 메인 라우터 에이전트 |
| **Ordering Agent** | 8083 | 주문 처리 에이전트 |
| **Planning Agent** | 8084 | 계획 수립 에이전트 |
| **WebSocket Server** | 8085 | 실시간 로그 브로드캐스팅 |
| **Client Server** | 8086 | 프론트엔드-백엔드 연결 API |

## 🐛 문제 해결

### "백엔드 서버에 연결할 수 없습니다"
```bash
# Client Server가 실행 중인지 확인
lsof -i :8086

# 서버 시작
cd sage-multi-agent
go run client/main.go --port 8086
```

### WebSocket 연결 실패
```bash
# WebSocket 서버 실행 확인
lsof -i :8085

# Root Agent와 WebSocket 서버 시작
go run root/main.go --ws-port 8085
```

### 환경변수가 적용되지 않음
```bash
# .next 캐시 삭제 후 재시작
rm -rf .next
npm run dev
```

## 📊 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 프로덕션 실행
```bash
npm start
```

### Docker 빌드 (선택사항)
```bash
docker build -t sage-fe .
docker run -p 3000:3000 --env-file .env.local sage-fe
```

## 📚 관련 문서

- [상세 테스트 가이드](./TEST_GUIDE.md) - 테스트 시나리오 및 디버깅
- [백엔드 연동 문서](./BACKEND_INTEGRATION.md) - sage-multi-agent와의 통합 상세
- [SAGE 프로토콜 문서](../sage/docs/) - SAGE 프로토콜 기술 사양

## ✅ 주의사항

- 모든 백엔드 에이전트가 실행되어야 정상 동작합니다
- Google Gemini API 키가 필요합니다 ([발급 링크](https://ai.google.dev/gemini-api/docs/api-key))
- WebSocket 연결은 자동으로 재연결을 시도합니다 (최대 5회)
- SAGE 프로토콜 ON/OFF는 실시간으로 백엔드에 전달됩니다

## 🤝 기여 방법

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

This project is part of the SAGE-X demonstration system.

---

Enjoy using the SAGE Multi-Agent demo! 🚀