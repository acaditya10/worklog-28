"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PenLine, LayoutDashboard } from "lucide-react";

export function Nav() {
  const pathname = usePathname();

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
      </div>
    </nav>
  );
}