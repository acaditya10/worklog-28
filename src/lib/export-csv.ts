import type { Entry } from "./types";
import { formatDate, formatTime, formatDuration } from "./utils";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function entriesToCSV(entries: Entry[]): string {
  // Group entries by date (sorted newest first)
  const grouped: Record<string, Entry[]> = {};
  for (const entry of entries) {
    const dateKey = formatDate(entry.createdAt);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  }

  const headers = ["Date", "Task", "Description", "Category", "Duration", "Time"];
  const rows: string[] = [headers.join(",")];

  for (const [date, dayEntries] of Object.entries(grouped)) {
    const totalMinutes = dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0);

    // Day summary row
    rows.push(
      [
        escapeCSV(date),
        escapeCSV(`[${dayEntries.length} tasks]`),
        "",
        "",
        escapeCSV(formatDuration(totalMinutes)),
        "",
      ].join(","),
    );

    // Individual task sub-rows (date column left empty)
    for (const entry of dayEntries) {
      rows.push(
        [
          "",
          escapeCSV(entry.task),
          escapeCSV(entry.description),
          escapeCSV(entry.category),
          escapeCSV(formatDuration(entry.duration)),
          escapeCSV(formatTime(entry.createdAt)),
        ].join(","),
      );
    }
  }

  return rows.join("\n");
}

export function downloadCSV(entries: Entry[], filename?: string) {
  const csv = entriesToCSV(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `worklog_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
