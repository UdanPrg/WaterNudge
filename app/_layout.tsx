import "../global.css";

import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import notifee, { EventType } from "react-native-notify-kit";

import { AppStateProvider } from "@/context/AppStateProvider";
import { registerAlarmEventHandlers } from "@/lib/scheduling/alarms";

// Runs as soon as this module loads — including when Android launches the JS
// bundle headlessly to handle a background notification action — so it must
// stay at module scope, not inside a component effect.
registerAlarmEventHandlers();

function buildAlarmRoute(data: Record<string, string> | undefined, notificationId: string | undefined) {
  if (!data || data.isAlarm !== "true") return null;
  const params = new URLSearchParams({
    notificationId: notificationId ?? "",
    doseIndex: data.doseIndex ?? "",
    numberOfDoses: data.numberOfDoses ?? "",
    suggestedAmountMl: data.suggestedAmountMl ?? "",
    plannedCumulativeMl: data.plannedCumulativeMl ?? "",
    goalMl: data.goalMl ?? "",
  });
  return `/alarm?${params.toString()}`;
}

function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    notifee.getInitialNotification().then((initial) => {
      if (!initial) return;
      const route = buildAlarmRoute(
        initial.notification.data as Record<string, string> | undefined,
        initial.notification.id
      );
      if (route) router.replace(route as never);
    });

    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type !== EventType.PRESS) return;
      const route = buildAlarmRoute(
        detail.notification?.data as Record<string, string> | undefined,
        detail.notification?.id
      );
      if (route) router.push(route as never);
    });
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="history" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="alarm" options={{ presentation: "fullScreenModal", gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayoutWithProviders() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <RootLayout />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
