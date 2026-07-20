import RingtonePickerModule from "./RingtonePickerModule";

/** Opens Android's own alarm-sound picker; resolves the picked content URI, or null if cancelled/silent. */
export function pickAlarmRingtone(currentUri?: string | null): Promise<string | null> {
  return RingtonePickerModule.pickAlarmRingtone(currentUri ?? null);
}

/** Human-readable name for a ringtone URI (e.g. "Bright morning"). */
export function getRingtoneTitle(uri: string): Promise<string | null> {
  return RingtonePickerModule.getRingtoneTitle(uri);
}

/** The system's default alarm sound URI, used as a sensible initial value. */
export function getDefaultAlarmRingtoneUri(): Promise<string | null> {
  return RingtonePickerModule.getDefaultAlarmRingtoneUri();
}
