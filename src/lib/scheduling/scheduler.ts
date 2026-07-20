import { MIN_TAPER_BUFFER_MINUTES } from "@/lib/constants";
import { addMinutes } from "@/lib/time";
import { isInQuietHours, shiftBeforeQuietStart } from "@/lib/scheduling/quietHours";
import type { DoseSlot, ScheduleResult, Settings } from "@/types";

/**
 * Builds the full day's dose schedule from a wake-up time. Pure function so it
 * stays testable: `now` is passed explicitly instead of read internally.
 */
export function buildDailySchedule(
  wakeStartTime: number,
  settings: Settings,
  now: number
): ScheduleResult {
  const { goalMl, glassMl, windowHours, taperMinutes, quietStartMinutes, quietEndMinutes } =
    settings;

  const windowEnd = addMinutes(wakeStartTime, windowHours * 60);
  let effectiveEnd = addMinutes(windowEnd, -taperMinutes);
  if (effectiveEnd <= wakeStartTime) {
    // Misconfigured settings (taper >= window); collapse to a single wake dose.
    effectiveEnd = wakeStartTime;
  }

  const numberOfDoses = Math.max(1, Math.ceil(goalMl / glassMl));
  const suggestedAmountPerDoseMl = goalMl / numberOfDoses;

  const wakeDose: DoseSlot = {
    doseIndex: 1,
    time: wakeStartTime,
    suggestedAmountMl: Math.round(suggestedAmountPerDoseMl),
    plannedCumulativeMl: Math.round(suggestedAmountPerDoseMl),
    isWakeDose: true,
  };

  const remainingDoses = numberOfDoses - 1;
  const scheduledDoses: DoseSlot[] = [];

  if (remainingDoses > 0 && effectiveEnd > wakeStartTime) {
    const interval = (effectiveEnd - wakeStartTime) / remainingDoses;
    const usedTimes = new Set<number>();

    for (let i = 1; i <= remainingDoses; i++) {
      let doseTime = wakeStartTime + i * interval;

      if (isInQuietHours(doseTime, quietStartMinutes, quietEndMinutes)) {
        doseTime = shiftBeforeQuietStart(doseTime, quietStartMinutes, quietEndMinutes);
      }

      if (doseTime <= now) continue; // never schedule in the past
      if (usedTimes.has(doseTime)) continue; // avoid duplicate slots from shifting
      usedTimes.add(doseTime);

      scheduledDoses.push({
        doseIndex: i + 1,
        time: doseTime,
        suggestedAmountMl: Math.round(suggestedAmountPerDoseMl),
        plannedCumulativeMl: Math.round((i + 1) * suggestedAmountPerDoseMl),
        isWakeDose: false,
      });
    }
  }

  return {
    wakeStartTime,
    numberOfDoses,
    suggestedAmountPerDoseMl,
    wakeDose,
    scheduledDoses,
  };
}

/** Settings-level guard so taper can't swallow the whole window in the UI. */
export function isTaperValid(windowHours: number, taperMinutes: number): boolean {
  return taperMinutes < windowHours * 60 - MIN_TAPER_BUFFER_MINUTES;
}
