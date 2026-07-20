import { DEFAULT_SETTINGS, STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage/storage";
import type { Settings } from "@/types";

export async function getSettings(): Promise<Settings> {
  const stored = await getItem<Partial<Settings>>(STORAGE_KEYS.settings);
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await setItem(STORAGE_KEYS.settings, settings);
}

export async function updateSettings(
  patch: Partial<Settings>
): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await saveSettings(next);
  return next;
}
