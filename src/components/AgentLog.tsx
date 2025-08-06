// src/components/AgentLog.tsx
import clsx from "clsx";

type AgentMessage = {
  type: string;
  content: string;
  timestamp: string;
  [key: string]: unknown;
};

function parseMessage(raw: string): AgentMessage | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AgentLog({ messages }: { messages: string[] }) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl h-96 overflow-auto font-mono text-sm space-y-2">
      {messages.map((msg, idx) => {
        const parsed = parseMessage(msg);
        if (!parsed) {
          return (
            <p key={idx} className="text-red-600">
              Invalid JSON: {msg}
            </p>
          );
        }

        return (
          <div
            key={idx}
            className={clsx(
              "p-2 rounded-md border",
              parsed.type === "error"
                ? "bg-red-100 border-red-300"
                : parsed.type === "info"
                ? "bg-blue-100 border-blue-300"
                : "bg-white border-gray-300"
            )}
          >
            <div className="text-xs text-gray-500">{parsed.timestamp}</div>
            <div>
              <strong className="text-gray-800">{parsed.type}</strong>:{" "}
              {parsed.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
