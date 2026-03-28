"use client";

import { useState } from "react";
import { getPreferences, savePreferences, UserPreferences } from "@/lib/settings";

const SOCIAL_APPS = ["Instagram", "TikTok", "X", "YouTube", "Facebook", "Reddit"];

interface MindGateSettingsProps {
  onClose: () => void;
}

export default function MindGateSettings({ onClose }: MindGateSettingsProps) {
  const [prefs, setPrefs] = useState<UserPreferences>(() => getPreferences());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    savePreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const setLimit = (app: string, minutes: number | null) => {
    setPrefs((prev) => {
      const existing = prev.appLimits.filter((l) => l.app !== app);
      return {
        ...prev,
        appLimits:
          minutes !== null ? [...existing, { app, limitMinutes: minutes }] : existing,
      };
    });
  };

  const getLimit = (app: string): number | null => {
    const entry = prefs.appLimits.find((l) => l.app === app);
    return entry ? entry.limitMinutes : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-[310px] bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[640px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="text-white font-semibold text-sm">MindGate</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs">Preferences</span>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/70 text-lg leading-none transition"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Intention */}
          <div>
            <label className="text-white/50 text-[10px] uppercase tracking-widest mb-2 block">
              What am I trying to build?
            </label>
            <textarea
              value={prefs.personalNote}
              onChange={(e) =>
                setPrefs((prev) => ({ ...prev, personalNote: e.target.value }))
              }
              placeholder="e.g. More focus, calmer mornings, deeper work..."
              rows={2}
              className="w-full bg-white/10 text-white placeholder-white/30 text-sm rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            />
          </div>

          {/* Triggers */}
          <div>
            <label className="text-white/50 text-[10px] uppercase tracking-widest mb-2 block">
              What pulls me in most?
            </label>
            <textarea
              value={prefs.triggers}
              onChange={(e) =>
                setPrefs((prev) => ({ ...prev, triggers: e.target.value }))
              }
              placeholder="e.g. Boredom at 10 pm, anxiety before deadlines..."
              rows={2}
              className="w-full bg-white/10 text-white placeholder-white/30 text-sm rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            />
          </div>

          {/* Daily limits */}
          <div>
            <label className="text-white/50 text-[10px] uppercase tracking-widest mb-3 block">
              Daily app limits
            </label>
            <div className="space-y-1.5">
              {SOCIAL_APPS.map((app) => {
                const limit = getLimit(app);
                return (
                  <div
                    key={app}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2"
                  >
                    <span className="text-white text-sm">{app}</span>
                    <select
                      value={limit ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLimit(app, val === "" ? null : Number(val));
                      }}
                      className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-400/50 border border-white/10"
                    >
                      <option value="">No limit</option>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hr</option>
                      <option value="90">1.5 hrs</option>
                      <option value="120">2 hrs</option>
                    </select>
                  </div>
                );
              })}
            </div>
            <p className="text-white/25 text-[10px] mt-2 leading-relaxed">
              When your daily limit is reached, MindGate activates before opening the app.
            </p>
          </div>

          {/* Personal context shown to Claude */}
          {(prefs.personalNote || prefs.triggers) && (
            <div className="bg-violet-900/20 border border-violet-500/20 rounded-xl px-3 py-3">
              <p className="text-violet-300/70 text-[10px] uppercase tracking-widest mb-1">
                Claude will know
              </p>
              {prefs.personalNote && (
                <p className="text-white/60 text-xs leading-relaxed">
                  <span className="text-white/40">Goal:</span> {prefs.personalNote}
                </p>
              )}
              {prefs.triggers && (
                <p className="text-white/60 text-xs leading-relaxed mt-0.5">
                  <span className="text-white/40">Triggers:</span> {prefs.triggers}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleSave}
            className={`w-full font-medium py-2.5 rounded-xl transition text-sm ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-violet-600 hover:bg-violet-500 text-white"
            }`}
          >
            {saved ? "✓ Saved" : "Save preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
