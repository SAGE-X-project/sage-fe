export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "error";
  senderName: string;
  content: string;
  timestamp: Date;
}

export type MessageType = "user" | "agent" | "error";
