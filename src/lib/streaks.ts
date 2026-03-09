import { Entry } from "./types";
import { startOfDay, differenceInDays } from "date-fns";

export function calculateStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;

  // Get unique dates (normalized to start of day), sorted descending
  const uniqueDates = Array.from(
    new Set(entries.map((e) => startOfDay(e.createdAt).getTime()))
  ).sort((a, b) => b - a);

  if (uniqueDates.length === 0) return 0;

  const today = startOfDay(new Date()).getTime();
  const mostRecent = uniqueDates[0];

  const diffFromToday = Math.abs(differenceInDays(today, mostRecent));
  
  // If the most recent entry is older than yesterday, the streak is broken (0)
  if (diffFromToday > 1) return 0;

  let currentStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1];
    const currDate = uniqueDates[i];
    
    // If the difference is exactly one day, the streak continues
    if (Math.abs(differenceInDays(prevDate, currDate)) === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}
