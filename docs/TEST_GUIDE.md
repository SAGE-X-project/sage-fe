# SAGE Frontend 테스트 실행 가이드

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
cd sage-fe
npm install
```

### 2. 환경변수 설정
```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

---

## 📋 환경변수 설정 가이드

### .env.local 파일 구조

```env
# ===========================================
# Backend API Configuration
# ===========================================
# 백엔드 API 서버 주소 (sage-multi-agent/client)
NEXT_PUBLIC_API_URL=http://localhost:8086

# API 엔드포인트 경로
NEXT_PUBLIC_API_ENDPOINT=/send/prompt

# ===========================================
# WebSocket Configuration
# ===========================================
# WebSocket 서버 주소 (실시간 로그용)
NEXT_PUBLIC_WS_URL=ws://localhost:8085

# WebSocket 엔드포인트 경로
NEXT_PUBLIC_WS_ENDPOINT=/ws

# ===========================================
# WebSocket Settings
# ===========================================
# 재연결 시도 간격 (밀리초)
NEXT_PUBLIC_WS_RECONNECT_INTERVAL=1000

# 최대 재연결 시도 횟수
NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS=5

# 하트비트 전송 간격 (밀리초)
NEXT_PUBLIC_WS_HEARTBEAT_INTERVAL=30000

# ===========================================
# Environment
# ===========================================
# 실행 환경 (development | staging | production)
NEXT_PUBLIC_ENV=development

# ===========================================
# Feature Flags
# ===========================================
# SAGE 프로토콜 활성화 여부
NEXT_PUBLIC_ENABLE_SAGE_PROTOCOL=true

# 실시간 로그 표시 활성화 여부
NEXT_PUBLIC_ENABLE_REALTIME_LOGS=true
```

### 환경별 설정 예시

#### 🔧 로컬 개발 환경
```env
NEXT_PUBLIC_API_URL=http://localhost:8086
NEXT_PUBLIC_WS_URL=ws://localhost:8085
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_ENABLE_SAGE_PROTOCOL=true
NEXT_PUBLIC_ENABLE_REALTIME_LOGS=true
```

#### 🧪 테스트 환경
```env
NEXT_PUBLIC_API_URL=http://test-server.example.com:8086
NEXT_PUBLIC_WS_URL=ws://test-server.example.com:8085
NEXT_PUBLIC_ENV=staging
NEXT_PUBLIC_ENABLE_SAGE_PROTOCOL=true
NEXT_PUBLIC_ENABLE_REALTIME_LOGS=true
```

#### 🚀 프로덕션 환경
```env
NEXT_PUBLIC_API_URL=https://api.sage-demo.com
NEXT_PUBLIC_WS_URL=wss://ws.sage-demo.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_ENABLE_SAGE_PROTOCOL=true
NEXT_PUBLIC_ENABLE_REALTIME_LOGS=false
```

---

## 🧪 테스트 시나리오

### 1. 백엔드 없이 프론트엔드만 테스트

백엔드 서버 없이 UI와 데모 기능만 테스트하려면:

```bash
# WebSocket 비활성화
NEXT_PUBLIC_ENABLE_REALTIME_LOGS=false
```

이 상태에서 "데모 실행" 버튼을 사용하여 하드코딩된 시나리오를 테스트할 수 있습니다.

### 2. 전체 시스템 통합 테스트

#### Step 1: 백엔드 서버 실행
```bash
# 터미널 1: Root Agent
cd sage-multi-agent
go run root/main.go --port 8080 --ws-port 8085 --skip-verification

# 터미널 2: Client Server (프론트엔드 연결용)
go run client/main.go --port 8086 --root-url http://localhost:8080

# 터미널 3: Ordering Agent
go run ordering/main.go --port 8083

# 터미널 4: Planning Agent
go run planning/main.go --port 8084
```

#### Step 2: 프론트엔드 실행
```bash
cd sage-fe
npm run dev
```

#### Step 3: 테스트 수행
1. http://localhost:3000 접속
2. WebSocket 연결 상태 확인 (헤더의 상태 표시)
3. SAGE 프로토콜 ON/OFF 토글
4. 시나리오 선택 (숙소/배송/결제)
5. 메시지 입력 및 전송
6. 실시간 로그 확인

---

## 🔍 디버깅 가이드

### 브라우저 콘솔 확인 사항

1. **WebSocket 연결 로그**
```javascript
// 정상 연결
WebSocket connected
WebSocket 연결됨

// 연결 실패
WebSocket error: Failed to connect
WebSocket 연결 오류
```

2. **API 요청/응답 로그**
```javascript
// 요청
Sending request to Next.js API route
Request payload: {prompt: "...", sageEnabled: true}

// 응답
API Response: {response: "...", logs: [...]}
```

### 네트워크 탭 확인 사항

1. **API 요청**
   - URL: `http://localhost:3000/api/send-prompt`
   - Method: POST
   - Headers: `X-SAGE-Enabled`, `X-Scenario`

2. **WebSocket 연결**
   - URL: `ws://localhost:8085/ws`
   - Status: 101 (Switching Protocols)
   - Messages: 실시간 로그 스트림

---

## 🐛 일반적인 문제 해결

### 1. "백엔드 서버에 연결할 수 없습니다"

**원인**: 백엔드 서버가 실행되지 않음

**해결**:
```bash
# Client Server가 8086 포트에서 실행 중인지 확인
lsof -i :8086

# 서버 시작
cd sage-multi-agent
go run client/main.go --port 8086
```

### 2. WebSocket 연결 실패

**원인**: WebSocket 서버가 실행되지 않음

**해결**:
```bash
# WebSocket 서버가 8085 포트에서 실행 중인지 확인
lsof -i :8085

# Root Agent와 함께 WebSocket 서버 시작
go run root/main.go --ws-port 8085
```

### 3. CORS 오류

**원인**: 백엔드 서버의 CORS 설정 문제

**해결**: 백엔드에서 CORS 헤더 추가
```go
w.Header().Set("Access-Control-Allow-Origin", "*")
w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-SAGE-Enabled, X-Scenario")
```

### 4. 환경변수가 적용되지 않음

**원인**: Next.js 캐시 문제

**해결**:
```bash
# 개발 서버 재시작
npm run dev

# 또는 .next 폴더 삭제 후 재시작
rm -rf .next
npm run dev
```

---

## 📊 성능 테스트

### 부하 테스트
```bash
# Apache Bench 사용
ab -n 100 -c 10 -p request.json -T application/json http://localhost:3000/api/send-prompt

# request.json 내용
{
  "prompt": "테스트 메시지",
  "sageEnabled": true,
  "scenario": "accommodation"
}
```

### WebSocket 연결 테스트
```bash
# wscat 설치
npm install -g wscat

# WebSocket 연결 테스트
wscat -c ws://localhost:8085/ws
```

---

## 🚦 포트 사용 현황

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Frontend (Next.js) | 3000 | 웹 UI |
| Root Agent | 8080 | 메인 에이전트 |
| Ordering Agent | 8083 | 주문 처리 에이전트 |
| Planning Agent | 8084 | 계획 수립 에이전트 |
| WebSocket Server | 8085 | 실시간 로그 |
| Client Server | 8086 | 프론트엔드 API 연결 |

---

## 📝 테스트 체크리스트

### 기본 기능
- [ ] 페이지 로드 확인
- [ ] UI 컴포넌트 렌더링 확인
- [ ] 데모 데이터 로드 확인

### WebSocket 연결
- [ ] 연결 상태 표시 확인
- [ ] 자동 재연결 동작 확인
- [ ] 실시간 로그 수신 확인

### SAGE 프로토콜
- [ ] SAGE ON 모드 동작 확인
- [ ] SAGE OFF 모드 동작 확인
- [ ] 서명 검증 결과 표시 확인

### 시나리오 테스트
- [ ] 숙소 예약 시나리오
- [ ] 배송지 변조 시나리오
- [ ] 결제 정보 변조 시나리오

### 에러 처리
- [ ] 백엔드 미실행 시 에러 메시지
- [ ] 네트워크 오류 처리
- [ ] 타임아웃 처리

---

## 📚 추가 리소스

- [Next.js 환경변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [WebSocket API 문서](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [SAGE 백엔드 연동 가이드](./BACKEND_INTEGRATION.md)