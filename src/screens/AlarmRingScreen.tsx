import { useEffect, useRef } from "react";
import { Pressable, Text, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAudioPlayer } from "expo-audio";

import { Button } from "@/components/ui/Button";
import { ALARM_RING_MAX_MS } from "@/lib/constants";
import { alarmActions, type DoseData } from "@/lib/scheduling/alarms";
import { useSettings } from "@/lib/hooks/useSettings";
import { useToday } from "@/lib/hooks/useToday";

const VIBRATION_PATTERN = [0, 500, 300];

export function AlarmRingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    notificationId?: string;
    doseIndex?: string;
    numberOfDoses?: string;
    suggestedAmountMl?: string;
    plannedCumulativeMl?: string;
    goalMl?: string;
  }>();
  const { settings } = useSettings();
  const { refreshToday } = useToday();
  const player = useAudioPlayer(require("../../assets/sounds/alarm.wav"));
  const resolvedRef = useRef(false);

  const data: DoseData = {
    doseIndex: params.doseIndex ?? "1",
    numberOfDoses: params.numberOfDoses ?? "1",
    suggestedAmountMl: params.suggestedAmountMl ?? "0",
    plannedCumulativeMl: params.plannedCumulativeMl ?? "0",
    goalMl: params.goalMl ?? "0",
    isAlarm: "true",
  };
  const notificationId = params.notificationId || undefined;

  function stopRinging() {
    Vibration.cancel();
    try {
      player.pause();
    } catch {
      // Player may already be released — e.g. the unmount cleanup runs again
      // after `resolve()` already paused it and navigated away.
    }
  }

  useEffect(() => {
    if (settings.sound) {
      player.loop = true;
      player.volume = 1;
      player.play();
    }
    if (settings.vibration) {
      Vibration.vibrate(VIBRATION_PATTERN, true);
    }

    const capTimer = setTimeout(stopRinging, ALARM_RING_MAX_MS);
    return () => {
      clearTimeout(capTimer);
      stopRinging();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resolve(kind: "hydrated" | "snooze") {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    stopRinging();

    if (kind === "hydrated") {
      await alarmActions.hydrated(notificationId, data);
    } else {
      await alarmActions.snooze(notificationId, data);
    }
    await refreshToday();
    router.replace("/" as never);
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-between bg-water-700 px-6 py-12">
      <View className="items-center gap-3 pt-6">
        <Text className="text-6xl">💧</Text>
        <Text className="text-center text-3xl font-bold text-white">Hora de hidratarte</Text>
        <Text className="text-center text-lg text-water-50">
          Vaso {data.doseIndex} de {data.numberOfDoses}: ~{data.suggestedAmountMl} mL
        </Text>
        <Text className="text-center text-base text-water-100">
          Si vas al ritmo, llevarías ~{data.plannedCumulativeMl} mL de {data.goalMl} mL
        </Text>
      </View>

      <View className="w-full gap-3">
        <Button
          label="Ya me hidraté"
          size="lg"
          variant="secondary"
          className="w-full"
          onPress={() => resolve("hydrated")}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aplazar 3 minutos"
          onPress={() => resolve("snooze")}
          className="w-full items-center justify-center rounded-3xl border border-water-100 px-8 py-5 active:bg-water-600"
        >
          <Text className="text-xl font-semibold text-white">Aplazar 3 min</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
