"use client";

import { useState, useEffect, useMemo } from "react";
import { getEntries, updateEntry, deleteEntry } from "@/lib/firebase";
import { downloadCSV } from "@/lib/export-csv";
import { SummarySection } from "@/components/summary-section";
import { EditDialog } from "@/components/edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  categoryColor,
  formatDuration,
  formatDate,
  formatTime,
} from "@/lib/utils";
import { Search, LayoutList, Loader2, Clock, Download } from "lucide-react";
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

  useEffect(() => {
    load();
  }, []);

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
    downloadCSV(filtered);
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
            <h2 className="text-sm font-medium text-zinc-300">All Entries</h2>
            <span className="text-xs text-zinc-600">
              ({filtered.length})
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
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed"
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
              className="border-zinc-800 bg-zinc-900/50 pl-9 text-sm placeholder:text-zinc-600"
            />
          </div>
          </div>
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                !selectedCategory
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
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
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
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
        <div className="flex flex-col items-center py-16 text-center">
          <LayoutList className="mb-3 h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-500">No entries found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateEntries]) => (
            <div key={date}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-xs font-medium text-zinc-500">{date}</h3>
                <div className="h-px flex-1 bg-zinc-800/50" />
                <span className="text-[10px] text-zinc-600">
                  {dateEntries.length} entries
                </span>
              </div>
              <div className="space-y-1.5">
                {dateEntries.map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => setEditEntry(entry)}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-zinc-900/20 px-4 py-3 transition-all hover:border-zinc-800 hover:bg-zinc-900/50"
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