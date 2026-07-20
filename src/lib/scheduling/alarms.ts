import notifee, {
  AlarmType,
  AndroidCategory,
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  EventType,
  TimestampTrigger,
  TriggerType,
  type Event as NotifeeEvent,
} from "react-native-notify-kit";
import { canScheduleExactAlarms, canUseFullScreenIntent, openSettings } from "react-native-permissions";

import {
  ALARM_CHANNEL_ID,
  NOTIFEE_ACTION_HYDRATED,
  NOTIFEE_ACTION_SNOOZE,
  SNOOZE_MINUTES,
} from "@/lib/constants";
import { addEntry } from "@/lib/storage/todayRepo";
import { addMinutes } from "@/lib/time";
import type { DoseSlot, ScheduleResult } from "@/types";

export interface DoseData {
  [key: string]: string;
  doseIndex: string;
  numberOfDoses: string;
  suggestedAmountMl: string;
  plannedCumulativeMl: string;
  goalMl: string;
  isAlarm: "true";
}

function doseToData(dose: DoseSlot, numberOfDoses: number, goalMl: number): DoseData {
  return {
    doseIndex: String(dose.doseIndex),
    numberOfDoses: String(numberOfDoses),
    suggestedAmountMl: String(dose.suggestedAmountMl),
    plannedCumulativeMl: String(dose.plannedCumulativeMl),
    goalMl: String(goalMl),
    isAlarm: "true",
  };
}

function buildDoseNotification(dose: DoseSlot, numberOfDoses: number, goalMl: number) {
  const data = doseToData(dose, numberOfDoses, goalMl);
  return {
    title: "💧 Hora de hidratarte",
    body: `Vaso ${dose.doseIndex} de ${numberOfDoses}: intenta tomar ~${dose.suggestedAmountMl} mL. Si vas al ritmo, llevarías ~${dose.plannedCumulativeMl} mL de ${goalMl} mL. ¡Vos podés! 🤰`,
    data,
    android: {
      channelId: ALARM_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      category: AndroidCategory.ALARM,
      autoCancel: false,
      ongoing: false,
      pressAction: { id: "default", launchActivity: "default" },
      fullScreenAction: { id: "default", launchActivity: "default" },
      actions: [
        { title: "Aplazar", pressAction: { id: NOTIFEE_ACTION_SNOOZE } },
        { title: "Ya me hidraté", pressAction: { id: NOTIFEE_ACTION_HYDRATED } },
      ],
    },
  };
}

let lastChannelSoundUri: string | null | undefined;

/**
 * Android notification channels can't change their sound once created — the
 * OS silently ignores it. So whenever the chosen sound differs from the one
 * the channel currently has, delete and recreate it (same id, safe for any
 * already-scheduled trigger notifications, which look up the channel by id
 * only when they actually fire).
 */
export async function ensureAlarmChannel(soundUri?: string | null): Promise<void> {
  if (lastChannelSoundUri !== undefined && lastChannelSoundUri === soundUri) return;

  await notifee.deleteChannel(ALARM_CHANNEL_ID);
  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: "Alarmas de hidratación",
    importance: AndroidImportance.HIGH,
    vibration: true,
    vibrationPattern: [400, 250, 400, 250],
    sound: soundUri ?? "default",
  });
  lastChannelSoundUri = soundUri ?? null;
}

export interface PermissionStatus {
  notifications: boolean;
  exactAlarm: boolean;
  fullScreenIntent: boolean;
}

/**
 * Requests the one permission Android lets an app prompt for directly
 * (POST_NOTIFICATIONS on Android 13+). Exact-alarm and full-screen-intent are
 * "special access" permissions with no request dialog — the user must grant
 * them manually via `openExactAlarmSettings()` / `openFullScreenIntentSettings()`.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const result = await notifee.requestPermission();
  return result.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

export async function checkPermissionStatus(): Promise<PermissionStatus> {
  const settings = await notifee.getNotificationSettings();
  const notifications = settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  const exactAlarm = await canScheduleExactAlarms().catch(() => false);
  const fullScreenIntent = await canUseFullScreenIntent().catch(() => false);
  return { notifications, exactAlarm, fullScreenIntent };
}

export function openExactAlarmSettings(): Promise<void> {
  return openSettings("alarms");
}

export function openFullScreenIntentSettings(): Promise<void> {
  return openSettings("fullscreen");
}

export async function cancelAllAlarms(): Promise<void> {
  await notifee.cancelAllNotifications();
}

/** Schedules OS alarms for every dose after the wake-up dose (which is shown in-app instantly). */
export async function scheduleDailyAlarms(
  schedule: ScheduleResult,
  goalMl: number,
  soundUri?: string | null
): Promise<string[]> {
  await ensureAlarmChannel(soundUri);
  const ids: string[] = [];

  for (const dose of schedule.scheduledDoses) {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: dose.time,
      alarmManager: { type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE },
    };
    const notification = buildDoseNotification(dose, schedule.numberOfDoses, goalMl);
    const id = await notifee.createTriggerNotification(notification, trigger);
    ids.push(id);
  }

  return ids;
}

export async function getNextScheduledDose(): Promise<{
  time: number;
  suggestedAmountMl: number;
} | null> {
  const pending = await notifee.getTriggerNotifications();
  if (pending.length === 0) return null;

  let soonest: { time: number; suggestedAmountMl: number } | null = null;
  for (const { notification, trigger } of pending) {
    if (trigger.type !== TriggerType.TIMESTAMP) continue;
    const time = (trigger as TimestampTrigger).timestamp;
    const suggestedAmountMl = Number(notification.data?.suggestedAmountMl ?? 0);
    if (!soonest || time < soonest.time) {
      soonest = { time, suggestedAmountMl };
    }
  }
  return soonest;
}

async function resolveHydrated(notificationId: string | undefined, data: DoseData) {
  const suggestedAmountMl = Number(data.suggestedAmountMl) || 0;
  const updated = await addEntry(suggestedAmountMl);
  if (updated.goalReachedAt) {
    await cancelAllAlarms();
  } else if (notificationId) {
    await notifee.cancelNotification(notificationId);
  }
}

async function resolveSnooze(notificationId: string | undefined, data: DoseData) {
  const numberOfDoses = Number(data.numberOfDoses);
  const goalMl = Number(data.goalMl);
  if (notificationId) {
    await notifee.cancelNotification(notificationId);
  }
  const dose: DoseSlot = {
    doseIndex: Number(data.doseIndex),
    time: addMinutes(Date.now(), SNOOZE_MINUTES),
    suggestedAmountMl: Number(data.suggestedAmountMl),
    plannedCumulativeMl: Number(data.plannedCumulativeMl),
    isWakeDose: false,
  };
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: dose.time,
    alarmManager: { type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE },
  };
  const notification = buildDoseNotification(dose, numberOfDoses, goalMl);
  await notifee.createTriggerNotification(notification, trigger);
}

async function handleEvent(event: NotifeeEvent) {
  const { type, detail } = event;
  if (type !== EventType.ACTION_PRESS) return;

  const data = detail.notification?.data as DoseData | undefined;
  if (!data || data.isAlarm !== "true") return;

  const actionId = detail.pressAction?.id;

  if (actionId === NOTIFEE_ACTION_HYDRATED) {
    await resolveHydrated(detail.notification?.id, data);
  } else if (actionId === NOTIFEE_ACTION_SNOOZE) {
    await resolveSnooze(detail.notification?.id, data);
  }
}

/** Registers the shared action handler for both foreground and headless background events. */
export function registerAlarmEventHandlers(): void {
  notifee.onForegroundEvent(handleEvent);
  notifee.onBackgroundEvent(handleEvent);
}

/** Used by AlarmRingScreen so its on-screen buttons share the exact same resolution logic. */
export const alarmActions = {
  hydrated: resolveHydrated,
  snooze: resolveSnooze,
};
