import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { NextReminderCard } from "@/components/NextReminderCard";
import { NotificationBanner } from "@/components/NotificationBanner";
import { ProgressStats } from "@/components/ProgressStats";
import { QuickAddButtons } from "@/components/QuickAddButtons";
import { UndoButton } from "@/components/UndoButton";
import { WakeUpButton } from "@/components/WakeUpButton";
import { WaterContainer } from "@/components/water/WaterContainer";
import { useScheduler } from "@/lib/hooks/useScheduler";
import { useToday } from "@/lib/hooks/useToday";

export function HomeScreen() {
  const router = useRouter();
  const { today, nextDose, logEntry, undoEntry, markWakeUp, canUndo } = useToday();
  const { permissionStatus } = useScheduler();
  const [splashTrigger, setSplashTrigger] = useState(0);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);

  if (!today) return null;

  const progress = today.goalMl > 0 ? today.totalMl / today.goalMl : 0;
  const goalReached = today.goalReachedAt != null;
  const showCelebration = goalReached && !celebrationDismissed;

  const permissionIssue =
    permissionStatus &&
    (!permissionStatus.notifications || !permissionStatus.fullScreenIntent || !permissionStatus.exactAlarm);

  return (
    <SafeAreaView className="flex-1 bg-water-50">
      <ScrollView contentContainerClassName="gap-4 p-5">
        <View className="flex-row justify-end gap-4">
          <Pressable onPress={() => router.push("/history" as never)}>
            <Text className="text-base font-medium text-water-700">Historial</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/settings" as never)}>
            <Text className="text-base font-medium text-water-700">Ajustes</Text>
          </Pressable>
        </View>

        {permissionIssue && (
          <NotificationBanner
            message="Algunos permisos no están activos y los recordatorios podrían no sonar como alarma. Revisa Ajustes."
            actionLabel="Ir a Ajustes"
            onAction={() => router.push("/settings" as never)}
          />
        )}

        <WakeUpButton
          wakeStartTime={today.wakeStartTime}
          wakeAutoApplied={today.wakeAutoApplied}
          onWake={(time) => markWakeUp(time)}
        />

        <View className="items-center py-2">
          <WaterContainer progress={progress} splashTrigger={splashTrigger} />
        </View>

        <ProgressStats totalMl={today.totalMl} goalMl={today.goalMl} />

        <NextReminderCard nextDose={nextDose} goalReached={goalReached} wakeStartTime={today.wakeStartTime} />

        <QuickAddButtons
          onAdd={(ml) => {
            setSplashTrigger((t) => t + 1);
            logEntry(ml);
          }}
        />

        <View className="items-center">
          <UndoButton canUndo={canUndo} onUndo={undoEntry} />
        </View>
      </ScrollView>

      <CelebrationOverlay visible={!!showCelebration} onDismiss={() => setCelebrationDismissed(true)} />
    </SafeAreaView>
  );
}
