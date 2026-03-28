export interface EvaluateRequest {
  app: string;
  mood: number;
  reason: string;
  history: {
    opens_today: number;
    opens_last_hour: number;
    time_of_day: string;
  };
}

export interface EvaluateResponse {
  decision: "allow" | "reflect" | "redirect";
  time_granted_minutes: number | null;
  message: string;
  insight: string | null;
  alternatives: string[];
}

export async function evaluateRequest(req: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch("http://localhost:8000/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  return res.json();
}
