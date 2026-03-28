"use client";

// EvaluateResponse is always a decision here (follow_up handled in ConscienceLayer)
interface DecisionResponse {
  decision: "allow" | "reflect" | "redirect";
  time_granted_minutes: number | null;
  message: string;
  insight: string | null;
  alternatives: string[];
}

interface DecisionViewProps {
  appName: string;
  response: DecisionResponse;
  onAllow: () => void;
  onDismiss: () => void;
  onOverride: () => void;
  onUrgeSurf: () => void;
}

const DECISION_STYLES = {
  allow: {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    badgeText: "✓ Allowed",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-500",
    btnLabel: "Open App",
  },
  reflect: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    badgeText: "⏸ Let's Reflect",
    btnPrimary: "bg-amber-600 hover:bg-amber-500",
    btnLabel: "I'll close for now",
  },
  redirect: {
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    badgeText: "🔄 Pattern Alert",
    btnPrimary: "bg-rose-600 hover:bg-rose-500",
    btnLabel: "View my patterns",
  },
};

export default function DecisionView({
  appName,
  response,
  onAllow,
  onDismiss,
  onOverride,
  onUrgeSurf,
}: DecisionViewProps) {
  const style = DECISION_STYLES[response.decision];

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg flex-shrink-0">
          🌱
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${style.badge}`}>
          {style.badgeText}
        </span>
      </div>

      {/* Message */}
      <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-4">
        <p className="text-white text-sm leading-relaxed">{response.message}</p>
        {response.insight && (
          <p className="text-white/60 text-xs mt-3 italic border-t border-white/10 pt-3">
            💡 {response.insight}
          </p>
        )}
      </div>

      {/* Alternatives */}
      {response.alternatives.length > 0 && (
        <div className="space-y-2">
          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">
            Instead, you could...
          </p>
          <div className="space-y-1.5">
            {response.alternatives.map((alt, i) => (
              <div
                key={i}
                className="bg-white/10 rounded-xl px-4 py-2 text-white/80 text-sm flex items-start gap-2"
              >
                <span className="text-white/40 mt-0.5">→</span>
                {alt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timer info */}
      {response.decision === "allow" && response.time_granted_minutes && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center">
          <p className="text-emerald-300 text-sm font-medium">
            ⏱ {response.time_granted_minutes} minutes granted
          </p>
          <p className="text-emerald-300/60 text-xs mt-0.5">Timer starts when you open the app</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {response.decision === "allow" ? (
          <button
            onClick={onAllow}
            className={`w-full ${style.btnPrimary} text-white font-medium py-3 rounded-xl transition`}
          >
            Open {appName} →
          </button>
        ) : (
          <>
            {/* Urge surfing — prominent on reflect/redirect */}
            <button
              onClick={onUrgeSurf}
              className="w-full bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-violet-200 font-medium py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>🌊</span>
              Try the 90-second pause
            </button>
            <button
              onClick={onDismiss}
              className="w-full bg-white/10 hover:bg-white/15 text-white/70 font-medium py-2.5 rounded-xl transition text-sm"
            >
              {style.btnLabel}
            </button>
          </>
        )}

        <button
          onClick={onOverride}
          className="w-full text-white/25 hover:text-white/45 text-xs py-1.5 transition"
        >
          Override anyway (emergency)
        </button>
      </div>
    </div>
  );
}
