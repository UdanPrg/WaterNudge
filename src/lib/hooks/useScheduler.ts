import { useAppState } from "@/context/AppStateProvider";
import { openExactAlarmSettings, openFullScreenIntentSettings } from "@/lib/scheduling/alarms";

/** Permission/alarm-readiness concerns: whether reminders will actually be able to fire. */
export function useScheduler() {
  const { permissionStatus, refreshPermissionStatus, requestNotificationPerm } = useAppState();

  return {
    permissionStatus,
    refreshPermissionStatus,
    requestNotificationPerm,
    openExactAlarmSettings,
    openFullScreenIntentSettings,
  };
}
