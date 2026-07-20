import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import {
  cancelAllAlarms,
  checkPermissionStatus,
  getNextScheduledDose,
  requestNotificationPermission,
  scheduleDailyAlarms,
  type PermissionStatus,
} from "@/lib/scheduling/alarms";
import { buildDailySchedule } from "@/lib/scheduling/scheduler";
import { detectAndRollover } from "@/lib/day/rollover";
import { useAppStateRollover } from "@/lib/hooks/useAppStateRollover";
import { getAppMeta, setOnboardingComplete } from "@/lib/storage/metaRepo";
import { getHistory } from "@/lib/storage/historyRepo";
import { getSettings, saveSettings, updateSettings } from "@/lib/storage/settingsRepo";
import {
  addEntry,
  getToday,
  setScheduledNotificationIds,
  setWakeStartTime,
  undoLastEntry,
} from "@/lib/storage/todayRepo";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import type { HistoryDay, Settings, TodayRecord } from "@/types";

interface NextDose {
  time: number;
  suggestedAmountMl: number;
}

interface State {
  loading: boolean;
  onboardingComplete: boolean;
  settings: Settings;
  today: TodayRecord | null;
  history: HistoryDay[];
  permissionStatus: PermissionStatus | null;
  nextDose: NextDose | null;
}

type Action =
  | { type: "HYDRATE"; payload: Omit<State, "loading"> }
  | { type: "SET_SETTINGS"; payload: Settings }
  | { type: "SET_TODAY"; payload: TodayRecord }
  | { type: "SET_HISTORY"; payload: HistoryDay[] }
  | { type: "SET_PERMISSION_STATUS"; payload: PermissionStatus }
  | { type: "SET_NEXT_DOSE"; payload: NextDose | null }
  | { type: "SET_ONBOARDING_COMPLETE" };

const initialState: State = {
  loading: true,
  onboardingComplete: false,
  settings: DEFAULT_SETTINGS,
  today: null,
  history: [],
  permissionStatus: null,
  nextDose: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, ...action.payload, loading: false };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "SET_TODAY":
      return { ...state, today: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_PERMISSION_STATUS":
      return { ...state, permissionStatus: action.payload };
    case "SET_NEXT_DOSE":
      return { ...state, nextDose: action.payload };
    case "SET_ONBOARDING_COMPLETE":
      return { ...state, onboardingComplete: true };
    default:
      return state;
  }
}

interface AppStateContextValue extends State {
  completeOnboarding: (settings: Settings) => Promise<void>;
  updateSettingsAction: (patch: Partial<Settings>) => Promise<void>;
  markWakeUp: (time: number, autoApplied?: boolean) => Promise<void>;
  logEntry: (ml: number) => Promise<void>;
  undoEntry: () => Promise<void>;
  refreshPermissionStatus: () => Promise<void>;
  requestNotificationPerm: () => Promise<void>;
  /** Re-reads "today" + the next pending alarm from storage/notifee. Needed after
   * AlarmRingScreen resolves an action outside of this context's own dispatch. */
  refreshToday: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

async function refreshNextDose(goalReachedAt: number | null): Promise<NextDose | null> {
  if (goalReachedAt) return null;
  return getNextScheduledDose();
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const bootstrap = useCallback(async () => {
    const meta = await getAppMeta();
    const settings = await getSettings();
    const { today } = await detectAndRollover(settings.goalMl);
    const history = await getHistory();
    const permissionStatus = await checkPermissionStatus();

    let nextDose = await refreshNextDose(today.goalReachedAt);
    // Self-heal: if a wake time is set, the goal isn't reached, but no OS
    // alarms are pending (e.g. a device reboot cleared them since this app
    // doesn't use RECEIVE_BOOT_COMPLETED), silently rebuild the remaining
    // schedule from now.
    if (today.wakeStartTime && !today.goalReachedAt && !nextDose) {
      const schedule = buildDailySchedule(today.wakeStartTime, settings, Date.now());
      if (schedule.scheduledDoses.length > 0) {
        const ids = await scheduleDailyAlarms(schedule, today.goalMl);
        await setScheduledNotificationIds(ids);
        nextDose = await refreshNextDose(today.goalReachedAt);
      }
    }

    dispatch({
      type: "HYDRATE",
      payload: {
        onboardingComplete: meta.onboardingComplete,
        settings,
        today,
        history,
        permissionStatus,
        nextDose,
      },
    });
  }, []);

  useAppStateRollover(() => {
    bootstrap();
  });

  const completeOnboarding = useCallback(async (settings: Settings) => {
    await saveSettings(settings);
    await setOnboardingComplete();
    dispatch({ type: "SET_SETTINGS", payload: settings });
    dispatch({ type: "SET_ONBOARDING_COMPLETE" });
  }, []);

  const updateSettingsAction = useCallback(async (patch: Partial<Settings>) => {
    const next = await updateSettings(patch);
    dispatch({ type: "SET_SETTINGS", payload: next });
  }, []);

  const markWakeUp = useCallback(
    async (time: number, autoApplied = false) => {
      await cancelAllAlarms();
      const today = await setWakeStartTime(time, autoApplied);
      const settings = await getSettings();
      const schedule = buildDailySchedule(time, settings, Date.now());
      const ids = await scheduleDailyAlarms(schedule, today.goalMl);
      const finalToday = await setScheduledNotificationIds(ids);
      dispatch({ type: "SET_TODAY", payload: finalToday });
      dispatch({ type: "SET_NEXT_DOSE", payload: await refreshNextDose(finalToday.goalReachedAt) });
    },
    []
  );

  const logEntry = useCallback(async (ml: number) => {
    const updated = await addEntry(ml);
    if (updated.goalReachedAt) {
      await cancelAllAlarms();
    }
    dispatch({ type: "SET_TODAY", payload: updated });
    dispatch({ type: "SET_NEXT_DOSE", payload: await refreshNextDose(updated.goalReachedAt) });
  }, []);

  const undoEntry = useCallback(async () => {
    const wasGoalReached = state.today?.goalReachedAt != null;
    const updated = await undoLastEntry();
    if (!updated) return;

    if (wasGoalReached && !updated.goalReachedAt && updated.wakeStartTime) {
      const settings = await getSettings();
      const schedule = buildDailySchedule(updated.wakeStartTime, settings, Date.now());
      const ids = await scheduleDailyAlarms(schedule, updated.goalMl);
      const finalToday = await setScheduledNotificationIds(ids);
      dispatch({ type: "SET_TODAY", payload: finalToday });
      dispatch({ type: "SET_NEXT_DOSE", payload: await refreshNextDose(finalToday.goalReachedAt) });
      return;
    }

    dispatch({ type: "SET_TODAY", payload: updated });
    dispatch({ type: "SET_NEXT_DOSE", payload: await refreshNextDose(updated.goalReachedAt) });
  }, [state.today?.goalReachedAt]);

  const refreshPermissionStatus = useCallback(async () => {
    const status = await checkPermissionStatus();
    dispatch({ type: "SET_PERMISSION_STATUS", payload: status });
  }, []);

  const requestNotificationPerm = useCallback(async () => {
    await requestNotificationPermission();
    await refreshPermissionStatus();
  }, [refreshPermissionStatus]);

  const refreshToday = useCallback(async () => {
    const today = await getToday();
    if (!today) return;
    dispatch({ type: "SET_TODAY", payload: today });
    dispatch({ type: "SET_NEXT_DOSE", payload: await refreshNextDose(today.goalReachedAt) });
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      completeOnboarding,
      updateSettingsAction,
      markWakeUp,
      logEntry,
      undoEntry,
      refreshPermissionStatus,
      requestNotificationPerm,
      refreshToday,
    }),
    [
      state,
      completeOnboarding,
      updateSettingsAction,
      markWakeUp,
      logEntry,
      undoEntry,
      refreshPermissionStatus,
      requestNotificationPerm,
      refreshToday,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
