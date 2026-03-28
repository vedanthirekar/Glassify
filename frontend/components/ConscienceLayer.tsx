"use client";

import { useState, useCallback } from "react";
import { useSession } from "@/context/SessionContext";
import { evaluateRequest, EvaluateResponse } from "@/lib/api";
import { saveSession, updateSession } from "@/lib/storage";
import MoodCheckIn from "./MoodCheckIn";
import ChatInterface from "./ChatInterface";
import DecisionView from "./DecisionView";
import TimerOverlay from "./TimerOverlay";
import PostSession from "./PostSession";

type Stage = "mood" | "chat" | "decision" | "timer" | "post_session";

let sessionIdRef = "";

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ConscienceLayer() {
  const { activeApp, closeApp, getTodayCount, getLastHourCount } = useSession();
  const [stage, setStage] = useState<Stage>("mood");
  const [mood, setMood] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [decision, setDecision] = useState<EvaluateResponse | null>(null);

  const handleClose = useCallback(() => {
    setStage("mood");
    setDecision(null);
    closeApp();
  }, [closeApp]);

  const handleMoodComplete = useCallback((selectedMood: number) => {
    setMood(selectedMood);
    setStage("chat");
  }, []);

  const handleReasonSubmit = useCallback(
    async (reason: string) => {
      if (!activeApp) return;
      setIsLoading(true);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      sessionIdRef = genId();

      try {
        const result = await evaluateRequest({
          app: activeApp,
          mood,
          reason,
          history: {
            opens_today: getTodayCount(activeApp),
            opens_last_hour: getLastHourCount(activeApp),
            time_of_day: timeStr,
          },
        });

        saveSession({
          id: sessionIdRef,
          timestamp: now.toISOString(),
          app: activeApp,
          mood_before: mood,
          reason,
          decision: result.decision,
          time_granted: result.time_granted_minutes,
          mood_after: null,
          completed: false,
        });

        setDecision(result);
        setStage("decision");
      } catch (err) {
        console.error(err);
        // Fail open — don't block user if API is down
        setDecision({
          decision: "allow",
          time_granted_minutes: 10,
          message: "I couldn't connect right now, so go ahead. Try to be intentional! 🌱",
          insight: null,
          alternatives: [],
        });
        setStage("decision");
      } finally {
        setIsLoading(false);
      }
    },
    [activeApp, mood, getTodayCount, getLastHourCount]
  );

  const handleAllow = useCallback(() => {
    setStage("timer");
  }, []);

  const handleDismiss = useCallback(() => {
    updateSession(sessionIdRef, { completed: true });
    handleClose();
  }, [handleClose]);

  const handleOverride = useCallback(() => {
    // Emergency override — still log it but allow
    updateSession(sessionIdRef, {
      decision: "allow",
      time_granted: 10,
      completed: false,
    });
    setDecision((prev) =>
      prev
        ? { ...prev, decision: "allow", time_granted_minutes: 10 }
        : null
    );
    setStage("timer");
  }, []);

  const handleTimerComplete = useCallback(() => {
    setStage("post_session");
  }, []);

  const handlePostSessionComplete = useCallback((moodAfter: number) => {
    updateSession(sessionIdRef, { mood_after: moodAfter, completed: true });
    handleClose();
  }, [handleClose]);

  if (!activeApp) return null;

  const STAGE_TITLES: Record<Stage, string> = {
    mood: "Check in",
    chat: "What's the plan?",
    decision: "MindGate says...",
    timer: `Using ${activeApp}`,
    post_session: "How was it?",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={stage === "mood" ? handleClose : undefined}
      />

      {/* Modal — constrained to phone width */}
      <div className="relative w-[310px] bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="text-white font-semibold text-sm">MindGate</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs">{STAGE_TITLES[stage]}</span>
            <button
              onClick={handleClose}
              className="text-white/40 hover:text-white/70 text-lg leading-none transition"
            >
              ×
            </button>
          </div>
        </div>

        {/* Stage progress dots */}
        <div className="flex gap-1.5 px-5 py-2">
          {(["mood", "chat", "decision"] as Stage[]).map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                stage === s
                  ? "bg-violet-400"
                  : ["mood", "chat", "decision", "timer", "post_session"].indexOf(stage) > i
                  ? "bg-violet-400/50"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pb-5 max-h-[500px] overflow-y-auto">
          {stage === "mood" && (
            <MoodCheckIn appName={activeApp} onComplete={handleMoodComplete} />
          )}
          {stage === "chat" && (
            <ChatInterface
              appName={activeApp}
              mood={mood}
              onSubmit={handleReasonSubmit}
              isLoading={isLoading}
            />
          )}
          {stage === "decision" && decision && (
            <DecisionView
              appName={activeApp}
              response={decision}
              onAllow={handleAllow}
              onDismiss={handleDismiss}
              onOverride={handleOverride}
            />
          )}
          {stage === "timer" && decision?.time_granted_minutes && (
            <TimerOverlay
              appName={activeApp}
              minutes={decision.time_granted_minutes}
              onComplete={handleTimerComplete}
            />
          )}
          {stage === "post_session" && (
            <PostSession
              appName={activeApp}
              moodBefore={mood}
              onComplete={handlePostSessionComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
