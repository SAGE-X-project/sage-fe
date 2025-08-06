export type AgentLogType =
  | "planning"
  | "ordering"
  | "routing"
  | "gateway"
  | "sage"
  | "error"
  | "info";

export type AgentLog = {
  type: AgentLogType;
  from: string; // "root", "gateway", "planning-agent", "ordering-agent", etc.
  to: string; // "planning", "ordering", "user", etc.
  content: string; // message content
  timestamp: string; // ISO time
  messageId?: string; // unique message identifier
  originalPrompt?: string; // for tracking prompt changes
  tamperedPrompt?: string; // for showing malicious modifications
};

export type AgentFlowStep = {
  id: string;
  type: AgentLogType;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  icon: string;
  color: string;
  status: "pending" | "processing" | "completed" | "error";
};
