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
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4">
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
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 blur transition duration-500 group-focus-within:opacity-100" />
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Fixed the auth bug on login page, took about 2 hours. Then had a standup meeting for 15 min. After that reviewed John's PR for the payments module..."
            className="relative min-h-[160px] resize-none rounded-3xl border border-white/10 bg-white/[0.02] p-5 pb-16 text-base leading-relaxed text-zinc-100 placeholder:text-zinc-600 shadow-inner backdrop-blur-xl transition-all duration-300 focus-visible:border-white/20 focus-visible:bg-white/[0.04] focus-visible:ring-0"
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
              className="rounded-xl bg-white/10 text-white shadow-sm ring-1 ring-white/10 hover:bg-white/20 hover:ring-white/20 disabled:opacity-40 transition-all duration-300"
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
            <h2 className="text-sm font-medium text-zinc-200">
              Today — {formatDate(new Date())}
            </h2>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
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
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-white/5 bg-white/[0.01] shadow-inner mt-6">
          <div className="mb-4 rounded-full bg-white/5 p-4 shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/10">
            <Send className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-base font-medium text-zinc-300">No entries yet today</p>
          <p className="mt-1 text-sm text-zinc-500">
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