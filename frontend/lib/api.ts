export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface EvaluateRequest {
  app: string;
  mood: number;
  messages: Message[];
  history: {
    opens_today: number;
    opens_last_hour: number;
    time_of_day: string;
  };
}

// Claude can return either a follow-up question or a final decision
export type EvaluateResponse =
  | { type: "follow_up"; follow_up_question: string }
  | {
      type: "decision";
      decision: "allow" | "reflect" | "redirect";
      time_granted_minutes: number | null;
      message: string;
      insight: string | null;
      alternatives: string[];
    };

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

export interface InsightsRequest {
  total: number;
  intentional: number;
  reactive: number;
  mood_drops: number;
  peak_hour: string;
  best_days: string[];
  urge_surf_wins: number;
  mind_score: number;
}

export async function getInsights(req: InsightsRequest): Promise<{ narrative: string }> {
  const res = await fetch("http://localhost:8000/api/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) throw new Error(`Insights API error ${res.status}`);
  return res.json();
}
