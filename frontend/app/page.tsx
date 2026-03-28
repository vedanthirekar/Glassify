"use client";

import { useState } from "react";
import PhoneMockup from "@/components/PhoneMockup";
import ConscienceLayer from "@/components/ConscienceLayer";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

type Tab = "home" | "analytics";

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center">
      {/* Top nav */}
      <header className="w-full max-w-4xl flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-white font-bold text-xl tracking-tight">MindGate</span>
        </div>
        <p className="text-white/40 text-sm hidden sm:block">
          Your AI conscience for mindful social media use
        </p>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8">
        <button
          onClick={() => setTab("home")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === "home" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
          }`}
        >
          📱 Simulation
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
            tab === "analytics" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
          }`}
        >
          📊 My Patterns
        </button>
      </div>

      {/* Main content */}
      <main className="w-full max-w-4xl px-4 pb-12 flex flex-col items-center gap-8">
        {tab === "home" && (
          <>
            <div className="text-center text-white/50 text-sm max-w-xs">
              Tap any social media app to experience the MindGate conscience layer
            </div>
            <PhoneMockup />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl text-center">
              {[
                { icon: "⏸", title: "Intentional Pause", desc: "A moment between impulse and action" },
                { icon: "🧠", title: "AI Conscience", desc: "Evaluates your reason with empathy" },
                { icon: "📊", title: "Pattern Insights", desc: "Understand your usage over time" },
              ].map((f) => (
                <div key={f.title} className="bg-white/5 rounded-2xl p-5">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <div className="text-white text-sm font-semibold">{f.title}</div>
                  <div className="text-white/40 text-xs mt-1">{f.desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "analytics" && (
          <div className="w-full max-w-xl">
            <AnalyticsDashboard />
          </div>
        )}
      </main>

      {/* Conscience layer — renders as overlay when an app is active */}
      <ConscienceLayer />
    </div>
  );
}
