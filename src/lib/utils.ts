import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function categoryColor(category: string): string {
  const colors = [
    "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    "bg-amber-500/15 text-amber-400 border-amber-500/20",
    "bg-rose-500/15 text-rose-400 border-rose-500/20",
    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    "bg-violet-500/15 text-violet-400 border-violet-500/20",
    "bg-orange-500/15 text-orange-400 border-orange-500/20",
    "bg-pink-500/15 text-pink-400 border-pink-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}