"use client";

import { useState } from "react";
import MessageFlow from "@/components/MessageFlow";
import { sendPrompt } from "@/lib/sendPrompt";
import { ChatMessage } from "@/types/Message";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const createMessage = (
    sender: "user" | "agent" | "error",
    content: string,
    senderName: string
  ): ChatMessage => ({
    id: Date.now().toString() + Math.random(),
    sender,
    senderName,
    content,
    timestamp: new Date(),
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;

    // 사용자 메시지 추가
    setMessages((prev) => [...prev, createMessage("user", userMsg, "사용자")]);
    setInput("");

    try {
      const response = await sendPrompt(userMsg);
      // 에이전트 응답 추가
      setMessages((prev) => [
        ...prev,
        createMessage("agent", response, "SAGE 에이전트"),
      ]);
    } catch (err) {
      // 오류 메시지 추가
      setMessages((prev) => [
        ...prev,
        createMessage("error", (err as Error).message, "시스템"),
      ]);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SAGE 메시지 흐름 시각화</h1>
      <MessageFlow messages={messages} />
      <div className="flex mt-4 gap-2">
        <input
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="예: 강남 근처 숙소 추천해줘"
        />
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          보내기
        </button>
      </div>
    </main>
  );
}
