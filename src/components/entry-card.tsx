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
      className="group cursor-pointer rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
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
        <button className="shrink-0 rounded-lg p-1.5 text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-300">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}