import { NextRequest, NextResponse } from "next/server";
import { PromptRequest, PromptResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body: PromptRequest = await request.json();
    
    // Get backend URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8086";
    const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || "/send/prompt";
    
    console.log(`Forwarding request to backend: ${backendUrl}${endpoint}`);
    console.log("Request body:", body);

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add SAGE protocol header if enabled
        ...(body.sageEnabled && { "X-SAGE-Enabled": "true" }),
        ...(body.scenario && { "X-Scenario": body.scenario }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      
      // Try to parse backend error
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(
          { error: errorJson.error || errorJson.message || "Backend request failed" },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { error: `Backend error: ${errorText}` },
          { status: response.status }
        );
      }
    }

    const data: PromptResponse = await response.json();
    console.log("Backend response:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    
    // Detailed error handling
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { 
          error: "백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.",
          details: error.message 
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "요청 처리 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
