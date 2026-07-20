import { useAppState } from "@/context/AppStateProvider";

export function useToday() {
  const { today, nextDose, logEntry, undoEntry, markWakeUp, refreshToday } = useAppState();

  return {
    today,
    nextDose,
    logEntry,
    undoEntry,
    markWakeUp,
    refreshToday,
    canUndo: (today?.entries.length ?? 0) > 0,
  };
}
