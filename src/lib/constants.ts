import type { Settings } from "@/types";

export const STORAGE_KEYS = {
  settings: "waternudge:settings",
  today: "waternudge:today",
  history: "waternudge:history",
  appMeta: "waternudge:appMeta",
} as const;

export const DEFAULT_SETTINGS: Settings = {
  goalMl: 3000,
  glassMl: 250,
  windowHours: 15,
  taperMinutes: 120,
  quietStartMinutes: 21 * 60, // 21:00
  quietEndMinutes: 6 * 60, // 06:00
  sound: true,
  vibration: true,
  fallbackWakeHour: 7,
  alarmSoundUri: null,
};

export const HISTORY_MAX_DAYS = 7;

export const SCHEMA_VERSION = 1;

export const ALARM_CHANNEL_ID = "hydration-alarm";

export const ALARM_RING_MAX_MS = 2 * 60 * 1000; // 2 min safety cap
export const SNOOZE_MINUTES = 3;

export const NOTIFEE_ACTION_HYDRATED = "hydrated";
export const NOTIFEE_ACTION_SNOOZE = "snooze";

export const MIN_GLASS_ML = 50;
export const MIN_TAPER_BUFFER_MINUTES = 30;
