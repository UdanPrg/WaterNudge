import { useAppState } from "@/context/AppStateProvider";
import type { Settings } from "@/types";

export function useSettings() {
  const { settings, updateSettingsAction, completeOnboarding, onboardingComplete } =
    useAppState();

  return {
    settings,
    onboardingComplete,
    updateSettings: (patch: Partial<Settings>) => updateSettingsAction(patch),
    completeOnboarding: (settings: Settings) => completeOnboarding(settings),
  };
}
