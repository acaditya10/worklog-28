"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Pencil } from "lucide-react";
import { categoryColor, formatDuration } from "@/lib/utils";
import type { ParsedEntry } from "@/lib/types";

interface Props {
  entries: ParsedEntry[];
  onConfirm: (entries: ParsedEntry[]) => void;
  onDiscard: () => void;
  loading: boolean;
}

export function EntryPreview({
  entries,
  onConfirm,
  onDiscard,
  loading,
}: Props) {
  const [edited, setEdited] = useState<ParsedEntry[]>(entries);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function updateEntry(index: number, field: keyof ParsedEntry, value: string) {
    setEdited((prev) =>
      prev.map((e, i) =>
        i === index
          ? {
              ...e,
              [field]: field === "duration" ? (value ? Number(value) : null) : value,
            }
          : e,
      ),
    );
  }

  function removeEntry(index: number) {
    setEdited((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-400">
          Parsed {edited.length} {edited.length === 1 ? "entry" : "entries"} —
          review before saving
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDiscard}
            disabled={loading}
            className="rounded-xl border border-transparent text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all duration-300"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(edited)}
            disabled={loading || edited.length === 0}
            className="rounded-xl bg-white/10 text-white shadow-sm ring-1 ring-white/10 hover:bg-white/20 hover:ring-white/20 transition-all duration-300 disabled:opacity-40"
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            {loading ? "Saving..." : "Confirm & Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {edited.map((entry, i) => (
          <div
            key={i}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-inner transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
          >
            {editingIndex === i ? (
              <div className="space-y-2">
                <Input
                  value={entry.task}
                  onChange={(e) => updateEntry(i, "task", e.target.value)}
                  placeholder="Task name"
                  className="rounded-xl border-white/10 bg-black/20 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
                />
                <Input
                  value={entry.description}
                  onChange={(e) =>
                    updateEntry(i, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="rounded-xl border-white/10 bg-black/20 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
                />
                <div className="flex gap-2">
                  <Input
                    value={entry.category}
                    onChange={(e) =>
                      updateEntry(i, "category", e.target.value)
                    }
                    placeholder="Category"
                    className="rounded-xl border-white/10 bg-black/20 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
                  />
                  <Input
                    value={entry.duration ?? ""}
                    onChange={(e) =>
                      updateEntry(i, "duration", e.target.value)
                    }
                    placeholder="Minutes"
                    type="number"
                    className="w-28 rounded-xl border-white/10 bg-black/20 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20 transition-all"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingIndex(null)}
                  className="rounded-xl text-xs text-indigo-300 hover:bg-indigo-500/10 hover:text-indigo-200 transition-all duration-300"
                >
                  Done editing
                </Button>
              </div>
            ) : (
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
                    {entry.duration && (
                      <span className="text-xs text-zinc-500">
                        {formatDuration(entry.duration)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    {entry.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingIndex(i)}
                    className="rounded-xl p-2 text-zinc-500 transition-all duration-300 hover:bg-white/10 hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeEntry(i)}
                    className="rounded-xl p-2 text-zinc-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}