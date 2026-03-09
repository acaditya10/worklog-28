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
            className="text-zinc-500 hover:text-zinc-300"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(edited)}
            disabled={loading || edited.length === 0}
            className="bg-indigo-600 text-white hover:bg-indigo-500"
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
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
          >
            {editingIndex === i ? (
              <div className="space-y-2">
                <Input
                  value={entry.task}
                  onChange={(e) => updateEntry(i, "task", e.target.value)}
                  placeholder="Task name"
                  className="border-zinc-700 bg-zinc-800 text-sm"
                />
                <Input
                  value={entry.description}
                  onChange={(e) =>
                    updateEntry(i, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="border-zinc-700 bg-zinc-800 text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    value={entry.category}
                    onChange={(e) =>
                      updateEntry(i, "category", e.target.value)
                    }
                    placeholder="Category"
                    className="border-zinc-700 bg-zinc-800 text-sm"
                  />
                  <Input
                    value={entry.duration ?? ""}
                    onChange={(e) =>
                      updateEntry(i, "duration", e.target.value)
                    }
                    placeholder="Minutes"
                    type="number"
                    className="w-28 border-zinc-700 bg-zinc-800 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingIndex(null)}
                  className="text-xs text-indigo-400"
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
                    className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeEntry(i)}
                    className="rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
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