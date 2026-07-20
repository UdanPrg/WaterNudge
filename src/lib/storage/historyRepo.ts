import { HISTORY_MAX_DAYS, STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage/storage";
import type { HistoryDay } from "@/types";

export async function getHistory(): Promise<HistoryDay[]> {
  const stored = await getItem<HistoryDay[]>(STORAGE_KEYS.history);
  return stored ?? [];
}

export async function appendHistoryDay(day: HistoryDay): Promise<void> {
  const history = await getHistory();
  const withoutSameDate = history.filter((h) => h.date !== day.date);
  const next = [...withoutSameDate, day]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, HISTORY_MAX_DAYS);
  await setItem(STORAGE_KEYS.history, next);
}
