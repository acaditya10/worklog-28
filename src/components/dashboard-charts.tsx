"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Entry } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { startOfDay, subDays } from "date-fns";

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#fb923c", "#34d399", "#60a5fa"];

export function DashboardCharts({ entries }: { entries: Entry[] }) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const pieData = useMemo(() => {
    const categoryTime: Record<string, number> = {};
    entries.forEach((e) => {
      const dur = e.duration || 0;
      if (dur > 0) {
        categoryTime[e.category] = (categoryTime[e.category] || 0) + dur;
      }
    });
    return Object.entries(categoryTime)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  const barData = useMemo(() => {
    const today = startOfDay(new Date());
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
    
    return last7Days.map(date => {
      const dayEntries = entries.filter(e => startOfDay(e.createdAt).getTime() === date.getTime());
      const mins = dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0);
      return {
        date: formatDate(date).split(",")[0], // e.g., "Mar 9"
        hours: Number((mins / 60).toFixed(1))
      };
    });
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 font-medium text-zinc-200 transition-colors hover:bg-white/[0.04] lg:hidden"
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-indigo-400" />
          Analytics & Charts
        </div>
        {isMobileExpanded ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
      </button>

      {/* Charts Container */}
      <div className={`flex-col gap-6 lg:flex ${isMobileExpanded ? 'flex' : 'hidden'}`}>
        {/* Bar Chart */}
        <div className="w-full rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-3xl">
          <h3 className="mb-6 text-sm font-semibold text-zinc-100">Hours Last 7 Days</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Bar dataKey="hours" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="w-full rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-3xl">
          <h3 className="mb-6 text-sm font-semibold text-zinc-100">Time by Category</h3>
          {pieData.length > 0 ? (
            <div className="h-[250px] flex flex-col items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    formatter={(value: any) => [`${(Number(value) / 60).toFixed(1)} hrs`, 'Time']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] text-zinc-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-sm text-zinc-500">
              No time data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
