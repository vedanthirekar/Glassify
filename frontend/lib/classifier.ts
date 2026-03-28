export type ReasonCategory = "intentional" | "boredom" | "avoidance" | "emotional" | "habit";

const PATTERNS: Record<ReasonCategory, RegExp> = {
  intentional: /\b(reply|replying|dm|message|post|upload|share|check\s+(the\s+)?(event|time|price|info|result|score|news|weather)|coordinate|plan|schedule|confirm|rsvp|follow\s+up|reach\s+out|respond|send)\b/i,
  avoidance: /\b(procrastinat|avoid|putting\s+off|don.t\s+want\s+to|taking\s+a\s+break\s+from|escape|distract|instead\s+of\s+work|instead\s+of\s+study|don.t\s+feel\s+like)\b/i,
  emotional: /\b(stress|anxious|anxiety|sad|lonely|depress|overwhelm|upset|worried|nervous|scared|angry|frustrated|down|bad\s+day|hard\s+day|rough)\b/i,
  boredom: /\b(bored|boring|nothing\s+to\s+do|kill\s+time|wasting\s+time|just\s+want|mindless|scroll|nothing\s+else|no\s+reason|don.t\s+know)\b/i,
  habit: /\b(habit|automatically|always\s+do|muscle\s+memory|reflex|just\s+checking|just\s+a\s+quick|out\s+of\s+habit|without\s+thinking)\b/i,
};

export function classifyReason(reason: string): ReasonCategory {
  if (!reason || reason.trim().length < 3) return "habit";

  for (const [category, pattern] of Object.entries(PATTERNS) as [ReasonCategory, RegExp][]) {
    if (pattern.test(reason)) return category;
  }

  // Short vague responses default to habit
  if (reason.trim().split(/\s+/).length <= 3) return "habit";

  return "intentional";
}

export const CATEGORY_LABELS: Record<ReasonCategory, string> = {
  intentional: "Intentional",
  boredom: "Boredom",
  avoidance: "Avoidance",
  emotional: "Emotional",
  habit: "Habit",
};

export const CATEGORY_COLORS: Record<ReasonCategory, string> = {
  intentional: "#34d399",
  boredom: "#fbbf24",
  avoidance: "#f97316",
  emotional: "#a78bfa",
  habit: "#94a3b8",
};
