import { STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage/storage";
import { toDateKey } from "@/lib/time";
import type { Entry, TodayRecord } from "@/types";

export function blankToday(dateKey: string, goalMl: number): TodayRecord {
  return {
    date: dateKey,
    wakeStartTime: null,
    wakeAutoApplied: false,
    entries: [],
    totalMl: 0,
    goalMl,
    goalReachedAt: null,
    scheduledNotificationIds: [],
  };
}

export async function getToday(): Promise<TodayRecord | null> {
  return getItem<TodayRecord>(STORAGE_KEYS.today);
}

export async function saveToday(today: TodayRecord): Promise<void> {
  await setItem(STORAGE_KEYS.today, today);
}

/** Ensures a today record exists for the current local date, creating a blank one if needed. */
export async function ensureToday(goalMl: number): Promise<TodayRecord> {
  const existing = await getToday();
  const todayKey = toDateKey(new Date());
  if (existing && existing.date === todayKey) return existing;
  const fresh = blankToday(todayKey, goalMl);
  await saveToday(fresh);
  return fresh;
}

export async function setWakeStartTime(
  wakeStartTime: number,
  autoApplied: boolean
): Promise<TodayRecord> {
  const today = await ensureToday(0);
  const next: TodayRecord = { ...today, wakeStartTime, wakeAutoApplied: autoApplied };
  await saveToday(next);
  return next;
}

export async function addEntry(ml: number): Promise<TodayRecord> {
  const today = await getToday();
  if (!today) throw new Error("addEntry called before today record exists");
  const entry: Entry = { ts: Date.now(), ml };
  const totalMl = today.totalMl + ml;
  const next: TodayRecord = {
    ...today,
    entries: [...today.entries, entry],
    totalMl,
    goalReachedAt:
      today.goalReachedAt ?? (totalMl >= today.goalMl ? Date.now() : null),
  };
  await saveToday(next);
  return next;
}

export async function undoLastEntry(): Promise<TodayRecord | null> {
  const today = await getToday();
  if (!today || today.entries.length === 0) return today;
  const removed = today.entries[today.entries.length - 1];
  const next: TodayRecord = {
    ...today,
    entries: today.entries.slice(0, -1),
    totalMl: Math.max(0, today.totalMl - removed.ml),
    goalReachedAt:
      today.totalMl - removed.ml < today.goalMl ? null : today.goalReachedAt,
  };
  await saveToday(next);
  return next;
}

export async function markGoalReached(ts: number): Promise<TodayRecord> {
  const today = await getToday();
  if (!today) throw new Error("markGoalReached called before today record exists");
  const next: TodayRecord = { ...today, goalReachedAt: ts };
  await saveToday(next);
  return next;
}

export async function setScheduledNotificationIds(
  ids: string[]
): Promise<TodayRecord> {
  const today = await getToday();
  if (!today)
    throw new Error("setScheduledNotificationIds called before today record exists");
  const next: TodayRecord = { ...today, scheduledNotificationIds: ids };
  await saveToday(next);
  return next;
}
