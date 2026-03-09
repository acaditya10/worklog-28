"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, FileText } from "lucide-react";
import { getSummary, saveSummary, getEntries } from "@/lib/firebase";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import ReactMarkdown from "react-markdown";
import type { Summary, Entry } from "@/lib/types";

const TABS = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
] as const;

function getRange(type: Summary["type"]): { start: Date; end: Date } {
  const now = new Date();
  switch (type) {
    case "day":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "all":
      return { start: new Date(2020, 0, 1), end: now };
  }
}

export function SummarySection() {
  const [activeTab, setActiveTab] = useState<Summary["type"]>("day");
  const [summaries, setSummaries] = useState<
    Record<string, Summary | null>
  >({});
  const [loading, setLoading] = useState<string | null>(null);

  const loadSummary = useCallback(async (type: Summary["type"]) => {
    setSummaries((prev) => {
      if (prev[type] !== undefined) return prev;
      getSummary(type).then((cached) => {
        setSummaries((p) => ({ ...p, [type]: cached }));
      });
      return prev;
    });
  }, []);

  useEffect(() => {
    loadSummary(activeTab);
  }, [activeTab, loadSummary]);

  async function regenerate(type: Summary["type"]) {
    setLoading(type);
    try {
      const { start, end } = getRange(type);
      const entries = await getEntries(start, end);

      if (entries.length === 0) {
        setSummaries((prev) => ({
          ...prev,
          [type]: {
            id: "",
            type,
            content: "No entries found for this period.",
            rangeStart: start,
            rangeEnd: end,
            generatedAt: new Date(),
          },
        }));
        setLoading(null);
        return;
      }

      const payload = entries.map((e: Entry) => ({
        task: e.task,
        description: e.description,
        category: e.category,
        duration: e.duration,
        createdAt: e.createdAt.toISOString(),
      }));

      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload, type }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      await saveSummary(type, data.content, start, end);

      setSummaries((prev) => ({
        ...prev,
        [type]: {
          id: "",
          type,
          content: data.content,
          rangeStart: start,
          rangeEnd: end,
          generatedAt: new Date(),
        },
      }));
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
    setLoading(null);
  }

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-4 sm:p-6">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as Summary["type"])}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-auto w-full bg-zinc-900 p-1 sm:w-auto">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 sm:flex-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => regenerate(activeTab)}
            disabled={loading !== null}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {loading === activeTab ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            {loading === activeTab ? "Generating..." : "Refresh"}
          </Button>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {loading === tab.value ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <p className="text-sm text-zinc-500">
                    Generating summary with AI...
                  </p>
                </div>
              </div>
            ) : summaries[tab.value] ? (
              <div className="prose prose-sm prose-invert max-w-none prose-headings:text-zinc-100 prose-headings:font-semibold prose-p:text-zinc-400 prose-strong:text-zinc-200 prose-li:text-zinc-400 prose-hr:border-zinc-800">
                <ReactMarkdown>
                  {summaries[tab.value]!.content}
                </ReactMarkdown>
                <p className="mt-4 text-xs text-zinc-600">
                  Generated{" "}
                  {summaries[tab.value]!.generatedAt.toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="mb-3 h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-500">
                  No summary yet
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Click refresh to generate one
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}