# SAGE Demo Agents Setup Guide

데모를 위한 SAGE 에이전트 메타데이터 및 등록 가이드입니다.

## 📋 개요

이 문서는 SAGE 다중 에이전트 시스템 데모를 위한 에이전트 등록 및 설정 방법을 설명합니다.

## 🎯 데모 에이전트 구성

### 에이전트 목록

| 에이전트 | DID | 포트 | 역할 |
|---------|-----|------|------|
| **Root Orchestrator** | `did:sage:ethereum:0x1234...7890` | 8080 | 메인 라우터, 작업 분배 |
| **Ordering Agent** | `did:sage:ethereum:0x2345...8901` | 8083 | 주문/구매 처리 |
| **Planning Agent** | `did:sage:ethereum:0x3456...9012` | 8084 | 여행/일정 계획 |

### 데모 시나리오

1. **숙소 예약** - Planning Agent 활용
2. **배송 주문** - Ordering Agent 활용  
3. **결제 처리** - Ordering Agent 활용

## 🚀 빠른 설정

### 옵션 1: 자동 설정 스크립트

```bash
cd sage-fe

# 실행 권한 부여
chmod +x register-demo-agents.sh

# 스크립트 실행
./register-demo-agents.sh

# 옵션 5 선택 (Complete demo setup)
```

### 옵션 2: 수동 설정

#### 1. 데모 키 생성

```bash
# 디렉토리 생성
mkdir -p demo-keys

# 각 에이전트용 키 생성 (Ed25519)
openssl genpkey -algorithm Ed25519 -out demo-keys/root_agent.key
openssl genpkey -algorithm Ed25519 -out demo-keys/ordering_agent.key
openssl genpkey -algorithm Ed25519 -out demo-keys/planning_agent.key
```

#### 2. 환경 파일 생성

`.env.demo` 파일 생성:

```env
# Blockchain Configuration
BLOCKCHAIN_NETWORK=local
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
RPC_URL=http://localhost:8545

# Agent DIDs
ROOT_AGENT_DID=did:sage:ethereum:0x1234567890123456789012345678901234567890
ORDERING_AGENT_DID=did:sage:ethereum:0x2345678901234567890123456789012345678901
PLANNING_AGENT_DID=did:sage:ethereum:0x3456789012345678901234567890123456789012

# Agent Endpoints
ROOT_AGENT_URL=http://localhost:8080
ORDERING_AGENT_URL=http://localhost:8083
PLANNING_AGENT_URL=http://localhost:8084

# API Keys
GOOGLE_API_KEY=your_gemini_api_key_here

# SAGE Protocol
SAGE_ENABLED=true
SAGE_VERIFICATION_REQUIRED=true
```

#### 3. 키 파일 복사

```bash
# sage-multi-agent로 키 복사
cp -r demo-keys ../sage-multi-agent/keys/
```

## 📦 파일 구조

```
sage-fe/
├── demo-agents-metadata.json    # 에이전트 메타데이터
├── demo-agents-config.go        # Go 설정 파일
├── register-demo-agents.sh      # 등록 스크립트
├── .env.demo                    # 환경 설정
└── demo-keys/                   # 데모 키 파일
    ├── root_agent.key
    ├── ordering_agent.key
    └── planning_agent.key
```

## 🔧 sage-multi-agent 통합

### 1. 설정 파일 업데이트

`sage-multi-agent/configs/agent_config.yaml` 업데이트:

```yaml
agents:
  root:
    did: "did:sage:ethereum:0x1234567890123456789012345678901234567890"
    name: "SAGE Root Orchestrator"
    endpoint: "http://localhost:8080"
    key_file: "keys/root_agent.key"
    
  ordering:
    did: "did:sage:ethereum:0x2345678901234567890123456789012345678901"
    name: "SAGE Ordering Agent"
    endpoint: "http://localhost:8083"
    key_file: "keys/ordering_agent.key"
    
  planning:
    did: "did:sage:ethereum:0x3456789012345678901234567890123456789012"
    name: "SAGE Planning Agent"
    endpoint: "http://localhost:8084"
    key_file: "keys/planning_agent.key"
```

### 2. 에이전트 실행

```bash
# Terminal 1: Root Agent
cd sage-multi-agent
export GOOGLE_API_KEY=your_api_key
go run root/main.go --skip-verification

# Terminal 2: Ordering Agent
go run ordering/main.go --skip-verification

# Terminal 3: Planning Agent  
go run planning/main.go --skip-verification

# Terminal 4: Client Server
go run client/main.go
```

## 🔐 블록체인 등록 (선택사항)

### Hardhat 로컬 네트워크 사용

```bash
# SAGE 컨트랙트 디렉토리로 이동
cd ../sage/contracts/ethereum

# Hardhat 노드 시작
npx hardhat node

# 컨트랙트 배포
npx hardhat run scripts/deploy.js --network localhost

# 에이전트 등록
npx hardhat run scripts/register-agents.js --network localhost
```

### Kaia 테스트넷 사용

```bash
# sage-multi-agent CLI 사용
cd sage-multi-agent

# Root Agent 등록
go run cli/register/main.go \
  --network kaia \
  --did "did:sage:ethereum:0x1234567890123456789012345678901234567890" \
  --name "SAGE Root Orchestrator" \
  --endpoint "http://localhost:8080"
```

## ⚠️ 주의사항

1. **데모 전용**: 제공된 키와 DID는 데모 전용입니다. 프로덕션에서 사용하지 마세요.
2. **로컬 테스트**: 기본 설정은 로컬 환경 테스트용입니다.
3. **API 키**: Google Gemini API 키는 별도로 발급받아야 합니다.
4. **포트 충돌**: 지정된 포트(8080, 8083, 8084, 8085, 8086)가 사용 중이지 않은지 확인하세요.

## 🧪 테스트 검증

### 1. 에이전트 상태 확인

```bash
# 각 에이전트 health check
curl http://localhost:8080/health
curl http://localhost:8083/health
curl http://localhost:8084/health
```

### 2. DID 검증

```bash
# DID 형식 검증
echo "did:sage:ethereum:0x1234567890123456789012345678901234567890" | \
  grep -E "^did:sage:(ethereum|kaia):0x[a-fA-F0-9]{40}$"
```

### 3. SAGE 서명 테스트

```bash
# 프론트엔드에서 SAGE ON/OFF 토글 후 요청 전송
# 브라우저 개발자 도구에서 X-SAGE-Enabled 헤더 확인
```

## 📚 관련 문서

- [demo-agents-metadata.json](./demo-agents-metadata.json) - 상세 메타데이터
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - 백엔드 통합 가이드
- [TEST_GUIDE.md](./TEST_GUIDE.md) - 테스트 가이드
- [sage-multi-agent README](../sage-multi-agent/README.md) - 백엔드 문서

## 🤝 문제 해결

### "Agent registration failed"
- 블록체인 네트워크가 실행 중인지 확인
- 컨트랙트가 배포되었는지 확인
- Gas 비용을 위한 잔액 확인

### "Key verification failed"
- 키 파일 경로 확인
- 키 파일 권한 확인 (600 권장)
- Ed25519 형식인지 확인

### "DID already registered"
- 다른 DID 사용 또는 기존 등록 삭제
- `--force` 플래그 사용 (덮어쓰기)

---

데모 설정에 대한 추가 질문은 이슈를 생성해주세요.