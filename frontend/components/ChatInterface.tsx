"use client";

import { useState } from "react";

interface ChatInterfaceProps {
  appName: string;
  mood: number;
  onSubmit: (reason: string) => void;
  isLoading: boolean;
}

const MOOD_EMOJIS: Record<number, string> = { 1: "😔", 2: "😟", 3: "😐", 4: "🙂", 5: "😊" };

export default function ChatInterface({ appName, mood, onSubmit, isLoading }: ChatInterfaceProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (reason.trim() && !isLoading) onSubmit(reason.trim());
  };

  return (
    <div className="flex flex-col gap-5 py-2">
      {/* Conscience message */}
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg flex-shrink-0 shadow-lg">
          🌱
        </div>
        <div className="bg-white/15 rounded-2xl rounded-tl-sm px-4 py-3 flex-1">
          <p className="text-white text-sm leading-relaxed">
            Hey {MOOD_EMOJIS[mood]} — I see you want to open{" "}
            <span className="font-semibold">{appName}</span>. That's totally okay.
            <br />
            <br />
            What's the plan — what do you want to do there?
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={`e.g. "reply to a DM from my friend about plans"`}
          rows={3}
          disabled={isLoading}
          className="w-full bg-white/10 text-white placeholder-white/40 text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400/50 disabled:opacity-50"
        />

        {isLoading ? (
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              🌱
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition"
          >
            Ask MindGate
          </button>
        )}
      </div>
    </div>
  );
}
