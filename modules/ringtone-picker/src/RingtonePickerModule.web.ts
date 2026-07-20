import { registerWebModule, NativeModule } from "expo";

import type { RingtonePickerModuleEvents } from "./RingtonePicker.types";

// The Android system ringtone picker has no web equivalent; every call is a
// harmless no-op so shared code doesn't need platform branching.
class RingtonePickerModule extends NativeModule<RingtonePickerModuleEvents> {
  async pickAlarmRingtone(): Promise<string | null> {
    return null;
  }
  async getRingtoneTitle(): Promise<string | null> {
    return null;
  }
  async getDefaultAlarmRingtoneUri(): Promise<string | null> {
    return null;
  }
}

export default registerWebModule(RingtonePickerModule, "RingtonePickerModule");
