"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { EntryPreview } from "@/components/entry-preview";
import { EntryCard } from "@/components/entry-card";
import { EditDialog } from "@/components/edit-dialog";
import {
  saveEntries,
  getTodayEntries,
  updateEntry,
  deleteEntry,
} from "@/lib/firebase";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { ParsedEntry, Entry } from "@/lib/types";

export default function LogPage() {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<ParsedEntry[] | null>(null);
  const [todayEntries, setTodayEntries] = useState<Entry[]>([]);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);

  useEffect(() => {
    loadToday();
  }, []);

  async function loadToday() {
    const entries = await getTodayEntries();
    setTodayEntries(entries);
  }

  async function handleParse() {
    if (!text.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreview(data.entries);
    } catch {
      toast.error("Failed to parse your input. Try again.");
    }
    setParsing(false);
  }

  async function handleConfirm(entries: ParsedEntry[]) {
    setSaving(true);
    try {
      await saveEntries(text, entries);
      toast.success(`Saved ${entries.length} entries`);
      setText("");
      setPreview(null);
      await loadToday();
    } catch {
      toast.error("Failed to save entries");
    }
    setSaving(false);
  }

  async function handleEditSave(
    id: string,
    data: {
      task: string;
      description: string;
      category: string;
      duration: number | null;
    },
  ) {
    await updateEntry(id, data);
    toast.success("Entry updated");
    await loadToday();
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
    toast.success("Entry deleted");
    await loadToday();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleParse();
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Log your work
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Describe what you did — AI will structure it for you
        </p>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Fixed the auth bug on login page, took about 2 hours. Then had a standup meeting for 15 min. After that reviewed John's PR for the payments module..."
            className="min-h-[140px] resize-none border-zinc-800 bg-zinc-900/50 pb-14 text-sm leading-relaxed placeholder:text-zinc-600 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            disabled={parsing || preview !== null}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[10px] text-zinc-700">
              {text.length > 0 ? "⌘ + Enter" : ""}
            </span>
            <Button
              size="sm"
              onClick={handleParse}
              disabled={!text.trim() || parsing || preview !== null}
              className="bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              {parsing ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              {parsing ? "Parsing..." : "Parse with AI"}
            </Button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <EntryPreview
          entries={preview}
          onConfirm={handleConfirm}
          onDiscard={() => setPreview(null)}
          loading={saving}
        />
      )}

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-400">
              Today — {formatDate(new Date())}
            </h2>
            <span className="text-xs text-zinc-600">
              {todayEntries.length}{" "}
              {todayEntries.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="space-y-2">
            {todayEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={setEditEntry}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayEntries.length === 0 && !preview && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900">
            <Send className="h-5 w-5 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">No entries yet today</p>
          <p className="mt-1 text-xs text-zinc-600">
            Start by describing what you&apos;ve been working on
          </p>
        </div>
      )}

      {/* Edit dialog */}
      <EditDialog
        entry={editEntry}
        open={editEntry !== null}
        onClose={() => setEditEntry(null)}
        onSave={handleEditSave}
        onDelete={handleDelete}
      />
    </div>
  );
}