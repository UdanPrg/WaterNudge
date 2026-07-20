import { appendHistoryDay } from "@/lib/storage/historyRepo";
import { blankToday, getToday, saveToday } from "@/lib/storage/todayRepo";
import { toDateKey } from "@/lib/time";
import type { TodayRecord } from "@/types";

export interface RolloverResult {
  rolledOver: boolean;
  today: TodayRecord;
}

/**
 * Archives the previous day (if any) into history and starts a fresh blank
 * "today" the moment a new local calendar date is observed. Runs lazily on
 * every app foreground/launch rather than a background midnight timer, since
 * no process is guaranteed to be running at midnight. Only the most recent
 * snapshot is archived if more than one day elapsed without opening the app.
 */
export async function detectAndRollover(goalMl: number): Promise<RolloverResult> {
  const todayKey = toDateKey(new Date());
  const existing = await getToday();

  if (existing && existing.date === todayKey) {
    return { rolledOver: false, today: existing };
  }

  if (existing) {
    await appendHistoryDay({
      date: existing.date,
      totalMl: existing.totalMl,
      goalMl: existing.goalMl,
    });
  }

  const fresh = blankToday(todayKey, goalMl);
  await saveToday(fresh);
  return { rolledOver: true, today: fresh };
}
