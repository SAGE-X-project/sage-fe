"use client";

import { ChatMessage } from "@/types/Message";
import TypingAnimation from "./TypingAnimation";

interface ChatBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
  showTyping?: boolean;
  onTypingUpdate?: () => void;
}

export default function ChatBubble({
  message,
  isLatest = false,
  showTyping = false,
  onTypingUpdate,
}: ChatBubbleProps) {
  const isUser = message.sender === "user";
  const isError = message.sender === "error";

  const getBubbleClass = () => {
    if (isError) return "sage-message-error";
    if (isUser) return "sage-message-user";
    return "sage-message-agent";
  };

  const getProfileEmoji = () => {
    if (isError) return "⚠️";
    if (isUser) return "🙋‍♂️";
    return "🤖";
  };

  const getAlignment = () => {
    return isUser ? "self-end items-end" : "self-start items-start";
  };

  return (
    <div className={`flex flex-col gap-1 max-w-[80%] ${getAlignment()}`}>
      {/* 프로필 이름 */}
      <div
        className={`sage-body-small font-bold px-2 ${
          isUser ? "text-right" : "text-left"
        }`}
      >
        <span className="mr-1">{getProfileEmoji()}</span>
        {message.senderName}
      </div>

      {/* 메시지 말풍선 */}
      <div
        className={`sage-message ${getBubbleClass()} ${
          isUser ? "ml-auto" : "mr-auto"
        }`}
      >
        {showTyping && isLatest && !isUser ? (
          <TypingAnimation
            text={message.content}
            speed={20}
            onTextUpdate={onTypingUpdate}
          />
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>

      {/* 타임스탬프 */}
      <div
        className={`sage-caption px-2 ${
          isUser ? "text-right" : "text-left"
        }`}
      >
        {message.timestamp.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
