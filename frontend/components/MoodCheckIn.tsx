"use client";

import { useState } from "react";

const MOODS = [
  { value: 1, emoji: "😔", label: "Really down" },
  { value: 2, emoji: "😟", label: "Not great" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Pretty good" },
  { value: 5, emoji: "😊", label: "Great!" },
];

interface MoodCheckInProps {
  appName: string;
  onComplete: (mood: number, context?: string) => void;
}

export default function MoodCheckIn({ appName, onComplete }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [context, setContext] = useState("");

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <div className="text-4xl mb-2">🧠</div>
        <h2 className="text-white text-xl font-semibold">Before you open {appName}...</h2>
        <p className="text-white/60 text-sm mt-1">How are you feeling right now?</p>
      </div>

      <div className="flex gap-3">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelectedMood(m.value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
              selectedMood === m.value
                ? "bg-white/30 scale-110 ring-2 ring-white/50"
                : "hover:bg-white/10"
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-white/70 text-[10px] text-center w-14 leading-tight">
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Anything on your mind? (optional)"
            rows={2}
            className="w-full bg-white/10 text-white placeholder-white/40 text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            onClick={() => onComplete(selectedMood, context || undefined)}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 rounded-xl transition"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
