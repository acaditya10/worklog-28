"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PenLine, LayoutDashboard, Flame } from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function loadStreak() {
      const { getEntries } = await import("@/lib/firebase");
      const { calculateStreak } = await import("@/lib/streaks");
      const entries = await getEntries();
      setStreak(calculateStreak(entries));
    }
    loadStreak();
  }, [pathname]); // Refresh on navigation

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold">
            W
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            worklog
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
              <Flame className="h-3.5 w-3.5 fill-orange-500/50" />
              {streak} Days
            </div>
          )}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              pathname === "/"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <PenLine className="h-3.5 w-3.5" />
            Log
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              pathname === "/dashboard"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
        {/* Missing closing div handled here */}
        </div>
      </div>
    </nav>
  );
}