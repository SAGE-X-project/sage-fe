# 🤖 SAGE AI Agent Development Guide

## 📋 Overview

SAGE (Secure Agent Guarantee Engine)는 AI 에이전트 간의 안전한 통신과 신뢰성을 보장하는 프로토콜입니다. 이 가이드는 SAGE를 활용한 AI 에이전트 개발 시 필수 기능과 선택적 기능을 구분하여 설명합니다.

## 🏗️ SAGE Architecture Components

```
┌─────────────────────────────────────────────────┐
│                  Blockchain Layer                │
│  (Agent Registration, DID Management, Contracts) │
└─────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────┐
│                   SAGE Protocol                  │
│     (RFC-9421 HTTP Signatures, Verification)     │
└─────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────┐
│                  Agent Framework                 │
│    (Message Handling, Key Management, DID)       │
└─────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────────────────────────────┐
│                Your AI Agent Logic               │
│         (Business Logic, AI Models, APIs)        │
└─────────────────────────────────────────────────┘
```

## ✅ MUST Have (필수 기능)

### 1. **Agent Identity (DID)**
```go
// 에이전트는 반드시 고유한 DID를 가져야 함
type Agent struct {
    DID      string `json:"did"`      // 예: "did:sage:ethereum:0x1234..."
    Name     string `json:"name"`     
    Endpoint string `json:"endpoint"` // 예: "http://localhost:8080"
}
```

**이유**: 에이전트 식별과 신뢰 체인 구축의 기본

### 2. **Key Pair Management**
```go
// Ed25519 키 쌍 생성 및 관리
import "github.com/sage-x-project/sage/crypto/keys"

keyPair, err := keys.GenerateEd25519KeyPair()
privateKey := keyPair.PrivateKey()
publicKey := keyPair.PublicKey()
```

**이유**: 메시지 서명과 검증의 핵심

### 3. **HTTP Message Signing (RFC-9421)**
```go
// 모든 에이전트 간 통신은 서명되어야 함
import "github.com/sage-x-project/sage/core/rfc9421"

verifier := rfc9421.NewHTTPVerifier()
params := &rfc9421.SignatureInputParams{
    CoveredComponents: []string{
        `"@method"`,
        `"@path"`,
        `"content-type"`,
        `"date"`,
        `"x-agent-did"`,
    },
    KeyID:     agentDID,
    Algorithm: "ed25519",
    Created:   time.Now().Unix(),
}

err := verifier.SignRequest(req, "sig1", params, privateKey)
```

**이유**: 메시지 무결성과 발신자 인증 보장

### 4. **Signature Verification**
```go
// 수신한 메시지의 서명 검증
err := verifier.VerifyRequest(req, "sig1", publicKey)
if err != nil {
    // 서명 검증 실패 - 메시지 거부
    return fmt.Errorf("signature verification failed: %w", err)
}
```

**이유**: 변조된 메시지 감지 및 차단

## 👍 SHOULD Have (권장 기능)

### 1. **Blockchain Registration**
```go
// 블록체인에 에이전트 등록
type Registration struct {
    DID         string
    Name        string
    PublicKey   string
    Endpoint    string
    Capabilities map[string]interface{}
}
```

**이유**: 분산 신뢰 네트워크 참여, 공개 검증 가능

### 2. **Message Ordering & Deduplication**
```go
// 메시지 순서 보장 및 중복 제거
import "github.com/sage-x-project/sage/core/message/order"
import "github.com/sage-x-project/sage/core/message/dedupe"

orderManager := order.NewManager()
dedupeDetector := dedupe.NewDetector()

if dedupeDetector.IsDuplicate(messageID) {
    return // 중복 메시지 무시
}
```

**이유**: 재생 공격 방지, 메시지 순서 보장

### 3. **Nonce Management**
```go
// 재생 공격 방지를 위한 Nonce 관리
import "github.com/sage-x-project/sage/core/message/nonce"

nonceManager := nonce.NewManager()
nonce := nonceManager.Generate()
// 요청에 nonce 포함

if !nonceManager.Validate(receivedNonce) {
    return fmt.Errorf("invalid or expired nonce")
}
```

**이유**: 재생 공격 완화

### 4. **Session Management**
```go
// 에이전트 간 세션 관리
import "github.com/sage-x-project/sage/session"

sessionManager := session.NewManager()
session, err := sessionManager.CreateSession(remoteAgentDID)
```

**이유**: 상태 유지, 효율적인 통신

### 5. **Capability Declaration**
```go
// 에이전트 능력 명시
capabilities := map[string]interface{}{
    "type": "ordering",
    "skills": []string{
        "order_processing",
        "payment_handling",
    },
    "version": "1.0.0",
    "maxConcurrentTasks": 10,
}
```

**이유**: 에이전트 발견 및 적절한 태스크 라우팅

## 🎯 OPTIONAL Features (선택 기능)

### 1. **Local Testing Support**
```bash
# 로컬 블록체인으로 테스트
./bin/deploy-local.sh
```

**최근 추가**: 로컬 Hardhat 노드에서 빠른 테스트 지원

### 2. **Query Interface**
```javascript
// 등록된 에이전트 조회
node scripts/query-agents.js
node scripts/query-agents.js by-owner 0x1234...
node scripts/query-agents.js stats
```

**최근 추가**: 다양한 조회 명령어 지원

### 3. **Multi-Chain Support**
```go
// Ethereum, Kaia 등 다중 체인 지원
type ChainConfig struct {
    Chain string // "ethereum" | "kaia" | "solana"
    RPC   string
}
```

### 4. **WebSocket Integration**
```go
// 실시간 로그 및 모니터링
wsServer := websocket.NewLogServer(8085)
wsServer.BroadcastLog(logMessage)
```

### 5. **Handshake Protocol**
```go
// 에이전트 간 초기 핸드셰이크
import "github.com/sage-x-project/sage/handshake"

client := handshake.NewClient()
err := client.Handshake(remoteAgent)
```

### 6. **Key Rotation**
```go
// 주기적인 키 교체
import "github.com/sage-x-project/sage/crypto/rotation"

rotator := rotation.NewRotator()
newKeyPair, err := rotator.RotateKeys(currentKeyPair)
```

### 7. **OIDC Integration**
```go
// Auth0 등 OIDC 제공자 통합
import "github.com/sage-x-project/sage/oidc/auth0"
```

## 📝 Implementation Example

### Minimal SAGE Agent
```go
package main

import (
    "github.com/sage-x-project/sage/crypto/keys"
    "github.com/sage-x-project/sage/core/rfc9421"
)

type MinimalAgent struct {
    DID        string
    privateKey ed25519.PrivateKey
    verifier   *rfc9421.HTTPVerifier
}

func NewMinimalAgent(did string) (*MinimalAgent, error) {
    // MUST: Key generation
    keyPair, err := keys.GenerateEd25519KeyPair()
    if err != nil {
        return nil, err
    }
    
    return &MinimalAgent{
        DID:        did, // MUST: DID
        privateKey: keyPair.PrivateKey().(ed25519.PrivateKey),
        verifier:   rfc9421.NewHTTPVerifier(), // MUST: Verifier
    }, nil
}

func (a *MinimalAgent) SignRequest(req *http.Request) error {
    // MUST: Sign all outgoing requests
    params := &rfc9421.SignatureInputParams{
        CoveredComponents: []string{
            `"@method"`, `"@path"`, `"content-type"`,
        },
        KeyID:     a.DID,
        Algorithm: "ed25519",
    }
    return a.verifier.SignRequest(req, "sig1", params, a.privateKey)
}

func (a *MinimalAgent) VerifyRequest(req *http.Request, publicKey ed25519.PublicKey) error {
    // MUST: Verify all incoming requests
    return a.verifier.VerifyRequest(req, "sig1", publicKey)
}
```

## 🚀 Development Workflow

### 1. **Development Mode** (빠른 개발)
```bash
# Skip verification for quick testing
go run agent/main.go --skip-verification
```

### 2. **Test Mode** (로컬 블록체인)
```bash
# Deploy local contracts
cd sage/contracts/ethereum
./bin/deploy-local.sh

# Register agent
go run cli/register/main.go --did "..." --name "..."

# Run with verification
go run agent/main.go
```

### 3. **Production Mode** (메인넷/테스트넷)
```bash
# Register on blockchain
go run cli/register/main.go --network kaia --did "..."

# Run with full verification
go run agent/main.go --verify-blockchain --verify-signatures
```

## 🔒 Security Considerations

### Critical Security Requirements
1. **절대 개인키를 노출하지 마세요**
2. **프로덕션에서는 항상 서명 검증 활성화**
3. **DID는 변경 불가능하므로 신중히 선택**
4. **Nonce/Timestamp로 재생 공격 방지**

### Best Practices
- 키 저장: Hardware Security Module (HSM) 또는 암호화된 파일 시스템
- 키 교체: 정기적인 키 로테이션 (최소 90일)
- 감사 로그: 모든 서명 검증 실패 기록
- Rate Limiting: DDoS 공격 방지

## 📊 Feature Comparison Table

| Feature | Priority | Development | Testing | Production |
|---------|----------|-------------|---------|------------|
| DID | **MUST** | ✅ | ✅ | ✅ |
| Key Management | **MUST** | ✅ | ✅ | ✅ |
| HTTP Signatures | **MUST** | Optional | ✅ | ✅ |
| Signature Verification | **MUST** | Optional | ✅ | ✅ |
| Blockchain Registration | **SHOULD** | ❌ | Optional | ✅ |
| Message Ordering | **SHOULD** | ❌ | ✅ | ✅ |
| Nonce Management | **SHOULD** | ❌ | ✅ | ✅ |
| Session Management | **SHOULD** | ❌ | Optional | ✅ |
| Capability Declaration | **SHOULD** | ✅ | ✅ | ✅ |
| Local Testing | OPTIONAL | ✅ | ✅ | ❌ |
| Query Interface | OPTIONAL | ✅ | ✅ | ✅ |
| WebSocket Logs | OPTIONAL | ✅ | ✅ | Optional |
| Key Rotation | OPTIONAL | ❌ | ❌ | ✅ |

## 🎯 Quick Decision Guide

### "내 AI 에이전트에 SAGE가 필요한가?"

**YES, if:**
- 다른 에이전트와 통신이 필요함
- 메시지 무결성이 중요함
- 신원 확인이 필요함
- 금융/의료/보안 관련 작업 수행

**NO, if:**
- 단독 실행 에이전트
- 내부 시스템에서만 동작
- 테스트/데모 목적

### "어떤 기능부터 구현해야 하나?"

1. **Phase 1 (MVP)**: DID + Key Management + HTTP Signatures
2. **Phase 2 (Alpha)**: + Signature Verification + Capability Declaration
3. **Phase 3 (Beta)**: + Blockchain Registration + Message Ordering
4. **Phase 4 (Production)**: + All SHOULD features + Selected OPTIONAL features

## 📚 Resources

- [RFC 9421 - HTTP Message Signatures](https://datatracker.ietf.org/doc/html/rfc9421)
- [SAGE Protocol Specification](../sage/docs/)
- [Example Implementations](../sage/examples/)
- [Contract Documentation](../sage/contracts/ethereum/docs/)

---

**Last Updated**: 2024-08-17
**SAGE Version**: 1.0.0