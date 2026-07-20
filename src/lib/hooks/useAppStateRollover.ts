import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Runs `onForeground` once on mount and again every time the app transitions
 * back to the foreground. Rollover and permission checks are re-evaluated
 * lazily this way since no background process is guaranteed to be running
 * at midnight.
 */
export function useAppStateRollover(onForeground: () => void): void {
  const callbackRef = useRef(onForeground);
  callbackRef.current = onForeground;

  useEffect(() => {
    callbackRef.current();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") callbackRef.current();
      }
    );

    return () => subscription.remove();
  }, []);
}
