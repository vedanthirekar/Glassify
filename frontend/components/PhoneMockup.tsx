"use client";

import { useSession } from "@/context/SessionContext";
import AppIcon from "./AppIcon";
import AppSimulator from "./AppSimulator";
import MindGateSettings from "./MindGateSettings";
import { useState, useEffect } from "react";

// Social apps — intercepted by MindGate conscience layer
const SOCIAL_APPS = new Set(["Instagram", "TikTok", "X", "YouTube", "Facebook", "Reddit"]);

// These open directly, no conscience gate
const DIRECT_APPS = new Set(["Camera", "Maps", "Calendar"]);

const APPS = [
  { name: "Instagram", icon: "📸", color: "bg-gradient-to-br from-pink-500 to-purple-600" },
  { name: "TikTok", icon: "🎵", color: "bg-black" },
  { name: "X", icon: "𝕏", color: "bg-gray-900" },
  { name: "YouTube", icon: "▶️", color: "bg-red-600" },
  { name: "Facebook", icon: "👤", color: "bg-blue-600" },
  { name: "Reddit", icon: "🤖", color: "bg-orange-500" },
  { name: "Messages", icon: "💬", color: "bg-green-500" },
  { name: "Music", icon: "🎧", color: "bg-pink-600" },
  { name: "Camera", icon: "📷", color: "bg-gray-700" },
  { name: "Maps", icon: "🗺️", color: "bg-blue-400" },
  { name: "Calendar", icon: "📅", color: "bg-white/20" },
  { name: "MindGate", icon: "🌱", color: "bg-gradient-to-br from-violet-600 to-indigo-700" },
];

export default function PhoneMockup() {
  const { openApp } = useSession();
  const [now, setNow] = useState<Date | null>(null);
  const [directApp, setDirectApp] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const dateStr = now
    ? now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
    : "";

  const handleAppTap = (appName: string) => {
    if (appName === "MindGate") {
      setShowSettings(true);
    } else if (DIRECT_APPS.has(appName)) {
      setDirectApp(appName);
    } else if (SOCIAL_APPS.has(appName)) {
      openApp(appName);
    }
    // Messages, Music — no action in this simulation
  };

  return (
    <>
      <div className="relative mx-auto w-[320px]" style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))" }}>
        {/* Phone shell */}
        <div
          className="relative bg-gray-900 rounded-[48px] border-4 border-gray-700 overflow-hidden"
          style={{ height: "680px" }}
        >
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-10" />

          {/* Wallpaper */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />

          {/* Status bar */}
          <div className="relative z-10 flex justify-between items-center px-6 pt-12 pb-2 text-white text-xs font-medium">
            <span>{timeStr}</span>
            <div className="flex gap-1 items-center">
              <span>●●●●</span>
              <span>WiFi</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Date + time hero */}
          <div className="relative z-10 text-center text-white px-4 py-4">
            <div className="text-4xl font-thin">{timeStr}</div>
            <div className="text-sm opacity-70 mt-1">{dateStr}</div>
          </div>

          {/* App grid */}
          <div className="relative z-10 px-5 pt-4">
            <div className="grid grid-cols-4 gap-4">
              {APPS.map((app) => (
                <AppIcon
                  key={app.name}
                  {...app}
                  isSocial={SOCIAL_APPS.has(app.name)}
                  onClick={() => handleAppTap(app.name)}
                />
              ))}
            </div>
          </div>

          {/* Dock */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[280px] z-10">
            <div className="bg-white/20 backdrop-blur rounded-3xl p-3 flex justify-around">
              {["📞", "📧", "🌐", "🎙️"].map((icon, i) => (
                <div
                  key={i}
                  className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl cursor-pointer hover:bg-white/30 transition"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute left-[-6px] top-20 w-1 h-8 bg-gray-600 rounded-l" />
        <div className="absolute left-[-6px] top-32 w-1 h-12 bg-gray-600 rounded-l" />
        <div className="absolute left-[-6px] top-48 w-1 h-12 bg-gray-600 rounded-l" />
        <div className="absolute right-[-6px] top-28 w-1 h-16 bg-gray-600 rounded-r" />
      </div>

      {/* Direct-open app simulation (no timer) */}
      {directApp && (
        <AppSimulator
          appName={directApp}
          onComplete={() => setDirectApp(null)}
        />
      )}

      {/* MindGate settings panel */}
      {showSettings && (
        <MindGateSettings onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
