"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/Message";
import ChatBubble from "./ChatBubble";

interface MessageFlowProps {
  messages: ChatMessage[];
  showTypingForLatest?: boolean;
}

export default function MessageFlow({
  messages,
  showTypingForLatest = true,
}: MessageFlowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 타이핑 애니메이션 중에도 스크롤 유지
  const handleTypingUpdate = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-4 p-6 bg-gray-50 rounded-xl shadow-inner h-[600px] overflow-y-auto w-full"
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          대화를 시작해보세요! 💬
        </div>
      ) : (
        messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            message={message}
            isLatest={index === messages.length - 1}
            showTyping={showTypingForLatest && index === messages.length - 1}
            onTypingUpdate={handleTypingUpdate}
          />
        ))
      )}
    </div>
  );
}
