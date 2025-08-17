// API Request/Response types for backend communication

export interface PromptRequest {
  prompt: string;
  sageEnabled?: boolean;
  scenario?: "accommodation" | "delivery" | "payment";
  metadata?: {
    userId?: string;
    sessionId?: string;
    timestamp?: string;
  };
}

export interface PromptResponse {
  response?: string;
  result?: string;
  message?: string;
  text?: string;
  error?: string;
  logs?: AgentLogData[];
  sageVerification?: SageVerificationResult;
}

export interface AgentLogData {
  type: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  messageId?: string;
  originalPrompt?: string;
  tamperedPrompt?: string;
  sageSignature?: string;
  verificationStatus?: "valid" | "invalid" | "unchecked";
}

export interface SageVerificationResult {
  enabled: boolean;
  verified: boolean;
  signature?: string;
  agentDID?: string;
  timestamp?: string;
  error?: string;
}