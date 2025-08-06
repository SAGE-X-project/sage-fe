export async function sendPrompt(prompt: string): Promise<string> {
  try {
    console.log("Sending request to Next.js API route");
    console.log("Request payload:", { prompt });

    const res = await fetch("/api/send-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("API Response:", data);

    // Next.js API Route를 통해 받은 응답 처리
    if (typeof data === "string") {
      return data;
    }

    // 백엔드 서버의 응답 구조에 맞게 처리
    return (
      data.response ||
      data.result ||
      data.message ||
      data.text ||
      JSON.stringify(data)
    );
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
