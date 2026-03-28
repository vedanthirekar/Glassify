"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/lib/api";

interface ChatInterfaceProps {
  appName: string;
  mood: number;
  messages: Message[];
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const MOOD_EMOJIS: Record<number, string> = { 1: "😔", 2: "😟", 3: "😐", 4: "🙂", 5: "😊" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType;
    webkitSpeechRecognition: SpeechRecognitionType;
  }
}

export default function ChatInterface({
  appName,
  mood,
  messages,
  onSubmit,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Opening prompt shown before any conversation
  const openingPrompt = `Hey ${MOOD_EMOJIS[mood]} — what's the plan? What do you want to do on ${appName}?`;

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Conversation history */}
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {/* Always show opening prompt */}
        <div className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
            🌱
          </div>
          <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2 flex-1">
            <p className="text-white text-sm leading-relaxed">{openingPrompt}</p>
          </div>
        </div>

        {/* Subsequent conversation turns */}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
                🌱
              </div>
            )}
            <div
              className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-violet-600/40 text-white rounded-tr-sm"
                  : "bg-white/10 text-white rounded-tl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0">
              🌱
            </div>
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!isLoading && (
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={messages.length > 0 ? "Continue the conversation..." : `e.g. "reply to a DM about plans"`}
              rows={2}
              className="w-full bg-white/10 text-white placeholder-white/40 text-sm rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            />
            {speechSupported && (
              <button
                onClick={toggleMic}
                className={`absolute right-3 top-3 w-7 h-7 rounded-full flex items-center justify-center transition ${
                  isListening
                    ? "bg-red-500 animate-pulse"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                title={isListening ? "Stop listening" : "Speak your answer"}
              >
                <span className="text-sm">{isListening ? "⏹" : "🎤"}</span>
              </button>
            )}
          </div>

          {isListening && (
            <p className="text-violet-300 text-xs text-center animate-pulse">
              Listening... speak your answer
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition text-sm"
          >
            {messages.length === 0 ? "Ask MindGate" : "Send →"}
          </button>
        </div>
      )}
    </div>
  );
}
