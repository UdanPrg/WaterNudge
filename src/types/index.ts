export interface Settings {
  goalMl: number;
  glassMl: number;
  windowHours: number;
  taperMinutes: number;
  quietStartMinutes: number; // minutes since local midnight
  quietEndMinutes: number; // minutes since local midnight
  sound: boolean;
  vibration: boolean;
  fallbackWakeHour: number; // hour (0-23) auto-applied if "Me levanté" is never tapped
  /** Content URI of the chosen alarm ringtone; null = system default alarm sound. */
  alarmSoundUri: string | null;
}

export interface Entry {
  ts: number; // epoch ms
  ml: number;
}

export interface TodayRecord {
  date: string; // YYYY-MM-DD, local
  wakeStartTime: number | null; // epoch ms
  wakeAutoApplied: boolean;
  entries: Entry[];
  totalMl: number;
  goalMl: number; // goal captured at schedule-generation time
  goalReachedAt: number | null;
  scheduledNotificationIds: string[];
}

export interface HistoryDay {
  date: string;
  totalMl: number;
  goalMl: number;
}

export interface AppMeta {
  onboardingComplete: boolean;
  schemaVersion: number;
}

export interface DoseSlot {
  doseIndex: number; // 1-based, 1 = wake-up dose
  time: number; // epoch ms; for doseIndex 1 this equals wakeStartTime
  suggestedAmountMl: number;
  plannedCumulativeMl: number;
  isWakeDose: boolean;
}

export interface ScheduleResult {
  wakeStartTime: number;
  numberOfDoses: number;
  suggestedAmountPerDoseMl: number;
  wakeDose: DoseSlot;
  scheduledDoses: DoseSlot[]; // doses 2..N that get OS alarms (post quiet-hours/past-time filtering)
}
