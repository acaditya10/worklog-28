"use client";

import { Badge } from "@/components/ui/badge";
import { categoryColor, formatDuration, formatTime } from "@/lib/utils";
import { Pencil } from "lucide-react";
import type { Entry } from "@/lib/types";

interface Props {
  entry: Entry;
  onEdit: (entry: Entry) => void;
}

export function EntryCard({ entry, onEdit }: Props) {
  return (
    <div
      onClick={() => onEdit(entry)}
      className="group relative cursor-pointer rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-100">
              {entry.task}
            </h4>
            <Badge
              variant="outline"
              className={categoryColor(entry.category)}
            >
              {entry.category}
            </Badge>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            {entry.description}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
            <span>{formatTime(entry.createdAt)}</span>
            {entry.duration && <span>{formatDuration(entry.duration)}</span>}
          </div>
        </div>
        <button className="shrink-0 rounded-xl p-2 text-zinc-500 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white/10 hover:text-white">
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}