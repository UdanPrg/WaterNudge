import { NativeModule, requireNativeModule } from "expo";

import type { RingtonePickerModuleEvents } from "./RingtonePicker.types";

declare class RingtonePickerModule extends NativeModule<RingtonePickerModuleEvents> {
  pickAlarmRingtone(currentUri?: string | null): Promise<string | null>;
  getRingtoneTitle(uri: string): Promise<string | null>;
  getDefaultAlarmRingtoneUri(): Promise<string | null>;
}

export default requireNativeModule<RingtonePickerModule>("RingtonePicker");
