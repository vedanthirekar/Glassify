"use client";

interface AppIconProps {
  name: string;
  icon: string;
  color: string;
  isSocial: boolean;
  onClick: () => void;
}

export default function AppIcon({ name, icon, color, isSocial, onClick }: AppIconProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md transition-transform group-active:scale-90 group-hover:scale-105 ${color}`}
      >
        {icon}
      </div>
      <span className="text-white text-[10px] font-medium drop-shadow">{name}</span>
    </button>
  );
}
