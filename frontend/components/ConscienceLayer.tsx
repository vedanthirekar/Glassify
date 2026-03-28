"use client";

import { useState, useCallback } from "react";
import { useSession } from "@/context/SessionContext";
import { evaluateRequest, Message } from "@/lib/api";
import { saveSession, updateSession } from "@/lib/storage";
import MoodCheckIn from "./MoodCheckIn";
import ChatInterface from "./ChatInterface";
import DecisionView from "./DecisionView";
import TimerOverlay from "./TimerOverlay";
import PostSession from "./PostSession";
import UrgeSurfing from "./UrgeSurfing";

type Stage = "mood" | "chat" | "decision" | "urge_surfing" | "timer" | "post_session";

interface DecisionResult {
  decision: "allow" | "reflect" | "redirect";
  time_granted_minutes: number | null;
  message: string;
  insight: string | null;
  alternatives: string[];
}

let sessionIdRef = "";

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ConscienceLayer() {
  const { activeApp, closeApp, getTodayCount, getLastHourCount } = useSession();
  const [stage, setStage] = useState<Stage>("mood");
  const [mood, setMood] = useState<number>(3);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [followedUp, setFollowedUp] = useState(false);
  const [urgeSurfed, setUrgeSurfed] = useState(false);

  const handleClose = useCallback(() => {
    setStage("mood");
    setDecision(null);
    setMessages([]);
    setFollowedUp(false);
    setUrgeSurfed(false);
    closeApp();
  }, [closeApp]);

  const handleMoodComplete = useCallback((selectedMood: number) => {
    setMood(selectedMood);
    setStage("chat");
  }, []);

  const handleMessageSubmit = useCallback(
    async (userText: string) => {
      if (!activeApp) return;
      setIsLoading(true);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const newMessages: Message[] = [...messages, { role: "user", content: userText }];
      setMessages(newMessages);

      // Create session on first user message
      if (messages.length === 0) {
        sessionIdRef = genId();
      }

      try {
        const result = await evaluateRequest({
          app: activeApp,
          mood,
          messages: newMessages,
          history: {
            opens_today: getTodayCount(activeApp),
            opens_last_hour: getLastHourCount(activeApp),
            time_of_day: timeStr,
          },
        });

        if (result.type === "follow_up") {
          // Claude wants to ask a follow-up question
          const followUpMessage: Message = {
            role: "assistant",
            content: result.follow_up_question,
          };
          setMessages([...newMessages, followUpMessage]);
          setFollowedUp(true);
          // Stay in chat stage
        } else {
          // Final decision
          const decisionResult: DecisionResult = {
            decision: result.decision,
            time_granted_minutes: result.time_granted_minutes,
            message: result.message,
            insight: result.insight,
            alternatives: result.alternatives,
          };

          saveSession({
            id: sessionIdRef,
            timestamp: now.toISOString(),
            app: activeApp,
            mood_before: mood,
            reason: userText,
            decision: result.decision,
            time_granted: result.time_granted_minutes,
            mood_after: null,
            completed: false,
            followed_up: followedUp,
            urge_surfed: false,
          });

          setDecision(decisionResult);
          setStage("decision");
        }
      } catch (err) {
        console.error(err);
        // Fail open — don't block user if API is down
        const fallback: DecisionResult = {
          decision: "allow",
          time_granted_minutes: 10,
          message: "I couldn't connect right now, so go ahead. Try to be intentional! 🌱",
          insight: null,
          alternatives: [],
        };
        saveSession({
          id: sessionIdRef,
          timestamp: now.toISOString(),
          app: activeApp,
          mood_before: mood,
          reason: userText,
          decision: "allow",
          time_granted: 10,
          mood_after: null,
          completed: false,
          followed_up: followedUp,
          urge_surfed: false,
        });
        setDecision(fallback);
        setStage("decision");
      } finally {
        setIsLoading(false);
      }
    },
    [activeApp, mood, messages, followedUp, getTodayCount, getLastHourCount]
  );

  const handleAllow = useCallback(() => setStage("timer"), []);

  const handleDismiss = useCallback(() => {
    updateSession(sessionIdRef, { completed: true });
    handleClose();
  }, [handleClose]);

  const handleUrgeSurf = useCallback(() => {
    setUrgeSurfed(true);
    updateSession(sessionIdRef, { urge_surfed: true });
    setStage("urge_surfing");
  }, []);

  const handleUrgeSurfComplete = useCallback(
    (urgePassedOrWantsToOpen: boolean) => {
      if (urgePassedOrWantsToOpen) {
        // Urge passed — close
        updateSession(sessionIdRef, { completed: true });
        handleClose();
      } else {
        // Still wants to open — allow with timer
        setDecision((prev) =>
          prev ? { ...prev, decision: "allow", time_granted_minutes: 10 } : null
        );
        setStage("timer");
      }
    },
    [handleClose]
  );

  const handleOverride = useCallback(() => {
    updateSession(sessionIdRef, { decision: "allow", time_granted: 10 });
    setDecision((prev) =>
      prev ? { ...prev, decision: "allow", time_granted_minutes: 10 } : null
    );
    setStage("timer");
  }, []);

  const handleTimerComplete = useCallback(() => setStage("post_session"), []);

  const handlePostSessionComplete = useCallback(
    (moodAfter: number) => {
      updateSession(sessionIdRef, { mood_after: moodAfter, completed: true });
      handleClose();
    },
    [handleClose]
  );

  if (!activeApp) return null;

  const STAGE_TITLES: Record<Stage, string> = {
    mood: "Check in",
    chat: "MindGate",
    decision: "MindGate says...",
    urge_surfing: "90-second pause",
    timer: `Using ${activeApp}`,
    post_session: "How was it?",
  };

  const progressStages: Stage[] = ["mood", "chat", "decision"];
  const progressIndex = progressStages.indexOf(stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={stage === "mood" ? handleClose : undefined}
      />

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

        {/* Progress dots */}
        <div className="flex gap-1.5 px-5 py-2">
          {progressStages.map((s, i) => (
            <div
              key={s}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                stage === s
                  ? "bg-violet-400"
                  : progressIndex > i || !progressStages.includes(stage)
                  ? "bg-violet-400/50"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pb-5 max-h-[520px] overflow-y-auto">
          {stage === "mood" && (
            <MoodCheckIn appName={activeApp} onComplete={handleMoodComplete} />
          )}
          {stage === "chat" && (
            <ChatInterface
              appName={activeApp}
              mood={mood}
              messages={messages}
              onSubmit={handleMessageSubmit}
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
              onUrgeSurf={handleUrgeSurf}
            />
          )}
          {stage === "urge_surfing" && (
            <UrgeSurfing onComplete={handleUrgeSurfComplete} />
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
