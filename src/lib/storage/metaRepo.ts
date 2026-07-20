import { SCHEMA_VERSION, STORAGE_KEYS } from "@/lib/constants";
import { getItem, setItem } from "@/lib/storage/storage";
import type { AppMeta } from "@/types";

const DEFAULT_META: AppMeta = {
  onboardingComplete: false,
  schemaVersion: SCHEMA_VERSION,
};

export async function getAppMeta(): Promise<AppMeta> {
  const stored = await getItem<AppMeta>(STORAGE_KEYS.appMeta);
  return stored ?? DEFAULT_META;
}

export async function setOnboardingComplete(): Promise<void> {
  const meta = await getAppMeta();
  await setItem(STORAGE_KEYS.appMeta, { ...meta, onboardingComplete: true });
}
