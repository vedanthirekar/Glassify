"use client";

import { useState } from "react";

const MOODS = [
  { value: 1, emoji: "😔", label: "Worse" },
  { value: 2, emoji: "😟", label: "Meh" },
  { value: 3, emoji: "😐", label: "Same" },
  { value: 4, emoji: "🙂", label: "Better" },
  { value: 5, emoji: "😊", label: "Great" },
];

interface PostSessionProps {
  appName: string;
  moodBefore: number;
  onComplete: (moodAfter: number) => void;
}

export default function PostSession({ appName, moodBefore, onComplete }: PostSessionProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const moodBeforeEmoji = MOODS.find((m) => m.value === moodBefore)?.emoji || "😐";

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div>
        <div className="text-4xl mb-2">🌱</div>
        <h2 className="text-white text-xl font-semibold">Session complete</h2>
        <p className="text-white/60 text-sm mt-1">
          You went in as {moodBeforeEmoji}. How do you feel now?
        </p>
      </div>

      <div className="flex gap-3">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelected(m.value)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
              selected === m.value
                ? "bg-white/30 scale-110 ring-2 ring-white/50"
                : "hover:bg-white/10"
            }`}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="text-white/70 text-[10px] w-12 leading-tight">{m.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="w-full space-y-3 animate-in fade-in duration-300">
          {selected < moodBefore && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-300 text-sm">
              Scrolling left you feeling worse. That&apos;s useful to know. 💛
            </div>
          )}
          {selected >= moodBefore && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-300 text-sm">
              Good — intentional use tends to feel better. 🌱
            </div>
          )}
          <button
            onClick={() => onComplete(selected)}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 rounded-xl transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
