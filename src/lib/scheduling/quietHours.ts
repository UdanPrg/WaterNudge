import { dateAtHour, minutesSinceMidnight } from "@/lib/time";

/** True if `ts` falls inside the quiet-hours window, safe for windows that cross midnight. */
export function isInQuietHours(
  ts: number,
  quietStartMinutes: number,
  quietEndMinutes: number
): boolean {
  const minutes = minutesSinceMidnight(new Date(ts));
  if (quietStartMinutes <= quietEndMinutes) {
    return minutes >= quietStartMinutes && minutes < quietEndMinutes;
  }
  // window crosses midnight, e.g. 21:00 -> 06:00
  return minutes >= quietStartMinutes || minutes < quietEndMinutes;
}

/** The instant quiet hours began for the quiet-hours instance that contains `ts`. */
function quietStartInstant(
  ts: number,
  quietStartMinutes: number,
  quietEndMinutes: number
): number {
  const doseDate = new Date(ts);
  const minutes = minutesSinceMidnight(doseDate);
  const hour = Math.floor(quietStartMinutes / 60);
  const minute = quietStartMinutes % 60;
  const crossesMidnight = quietStartMinutes > quietEndMinutes;

  if (!crossesMidnight || minutes >= quietStartMinutes) {
    return dateAtHour(doseDate, hour, minute);
  }

  // ts is in the early-morning tail of a quiet window that began the previous day.
  const yesterday = new Date(doseDate);
  yesterday.setDate(yesterday.getDate() - 1);
  return dateAtHour(yesterday, hour, minute);
}

/** Reschedules a dose that fell inside quiet hours to one minute before the window starts. */
export function shiftBeforeQuietStart(
  ts: number,
  quietStartMinutes: number,
  quietEndMinutes: number
): number {
  return quietStartInstant(ts, quietStartMinutes, quietEndMinutes) - 60 * 1000;
}
