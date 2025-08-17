import { PromptRequest, PromptResponse } from "@/types/api";

export interface SendPromptOptions {
  sageEnabled?: boolean;
  scenario?: "accommodation" | "delivery" | "payment";
  metadata?: {
    userId?: string;
    sessionId?: string;
  };
}

export async function sendPrompt(
  prompt: string,
  options: SendPromptOptions = {}
): Promise<PromptResponse> {
  try {
    console.log("Sending request to Next.js API route");
    
    const request: PromptRequest = {
      prompt,
      sageEnabled: options.sageEnabled ?? true,
      scenario: options.scenario,
      metadata: {
        ...options.metadata,
        timestamp: new Date().toISOString(),
      },
    };
    
    console.log("Request payload:", request);

    const res = await fetch("/api/send-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || `HTTP ${res.status}: ${errorText}`);
      } catch {
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
    }

    const data: PromptResponse = await res.json();
    console.log("API Response:", data);

    return data;
  } catch (error) {
    console.error("Error in sendPrompt:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "API 서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요."
      );
    }

    throw error;
  }
}

// Utility function to extract text response
export function extractTextResponse(response: PromptResponse): string {
  if (response.error) {
    throw new Error(response.error);
  }
  
  return (
    response.response ||
    response.result ||
    response.message ||
    response.text ||
    JSON.stringify(response)
  );
}
