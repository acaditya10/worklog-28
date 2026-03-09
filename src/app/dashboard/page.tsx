"use client";

import { useState, useEffect, useMemo } from "react";
import { getEntries, updateEntry, deleteEntry, getSummaryId, db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { downloadCSV } from "@/lib/export-csv";
import { SummarySection } from "@/components/summary-section";
import { EditDialog } from "@/components/edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  categoryColor,
  formatDuration,
  formatDate,
  formatTime,
} from "@/lib/utils";
import { Search, LayoutList, Loader2, Clock, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Entry } from "@/lib/types";

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null,
  );
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (Object.keys(grouped).length > 0) {
      loadSummaries();
    }
  }, [entries]);

  async function loadSummaries() {
    const dates = Object.keys(grouped);
    const newSummaries: Record<string, string> = {};
    for (const dateStr of dates) {
      // dateStr is formatted like 'Mar 9, 2026' via formatDate
      const [mon, dayStr, yearStr] = dateStr.replace(",", "").split(" ");
      const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(mon) + 1;
      const date = new Date(Number(yearStr), monthIdx - 1, Number(dayStr));
      
      const id = getSummaryId("day", date);
      try {
        const snap = await getDoc(doc(db, "summaries", id));
        if (snap.exists()) {
          newSummaries[dateStr] = snap.data().content;
        }
      } catch (err) {
        console.error("Failed to load summary for", dateStr, err);
      }
    }
    setSummaries(newSummaries);
  }

  async function load() {
    setLoading(true);
    const data = await getEntries();
    setEntries(data);
    setLoading(false);
  }

  const categories = useMemo(() => {
    const cats = new Set(entries.map((e) => e.category));
    return Array.from(cats).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch =
        search === "" ||
        e.task.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        !selectedCategory || e.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [entries, search, selectedCategory]);

  const grouped = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    filtered.forEach((e) => {
      const key = formatDate(e.createdAt);
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [filtered]);

  const totalMinutes = useMemo(() => {
    return filtered.reduce((sum, e) => sum + (e.duration || 0), 0);
  }, [filtered]);

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
    await load();
  }

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("No entries to export");
      return;
    }
    downloadCSV(filtered, summaries);
    toast.success(`Exported ${filtered.length} entries to CSV`);
  }

  async function handleDelete(id: string) {
    await deleteEntry(id);
    toast.success("Entry deleted");
    await load();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your AI-generated job sheet
        </p>
      </div>

      {/* Summaries */}
      <SummarySection />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-200">All Entries</h2>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
              {filtered.length}
            </span>
            {totalMinutes > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-600">
                <Clock className="h-3 w-3" />
                {formatDuration(totalMinutes)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="border-white/10 bg-white/5 pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 transition-all focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20 rounded-xl"
            />
          </div>
          </div>
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                !selectedCategory
                  ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat ? null : cat,
                  )
                }
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-white/5 bg-white/[0.01] shadow-inner mt-4">
          <div className="mb-4 rounded-full bg-white/5 p-4 shadow-[0_0_15px_rgba(255,255,255,0.05)] ring-1 ring-white/10">
            <LayoutList className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-base font-medium text-zinc-300">No entries found</p>
          <p className="mt-1 text-sm text-zinc-500">Your work log for this period is empty</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateEntries]) => (
            <div key={date}>
              <div className="mb-2 flex items-stretch gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-medium text-zinc-500">{date}</h3>
                  <Badge variant="outline" className="text-[10px] text-zinc-600 border-zinc-800">
                    {dateEntries.length} entries
                  </Badge>
                </div>
                <div className="flex-1 flex items-center shrink">
                  <div className="h-px w-full bg-gradient-to-r from-zinc-800/50 to-transparent" />
                </div>
                {summaries[date] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[10px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg shrink-0"
                    onClick={() => {
                       toast(`AI Summary: ${date}`, {
                         description: <div className="mt-3 text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar border-t border-white/10 pt-3">{summaries[date]}</div>,
                         duration: 30000,
                         className: "w-full max-w-md sm:max-w-lg md:max-w-xl border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl p-5",
                       });
                    }}
                  >
                    <FileText className="h-3 w-3" />
                    View AI Summary
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                {dateEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setEditEntry(entry)}
                    className="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5"
                  >
                    <span className="shrink-0 text-xs text-zinc-600">
                      {formatTime(entry.createdAt)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-zinc-200">
                          {entry.task}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${categoryColor(entry.category)}`}
                        >
                          {entry.category}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {entry.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-600">
                      {formatDuration(entry.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
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