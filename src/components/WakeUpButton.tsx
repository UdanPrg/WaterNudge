import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { TimeField } from "@/components/ui/TimeField";
import { hapticSuccess } from "@/lib/haptics";
import { dateAtHour, formatTime, minutesSinceMidnight } from "@/lib/time";

interface WakeUpButtonProps {
  wakeStartTime: number | null;
  wakeAutoApplied: boolean;
  onWake: (time: number) => void;
}

export function WakeUpButton({ wakeStartTime, wakeAutoApplied, onWake }: WakeUpButtonProps) {
  const [correcting, setCorrecting] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(
    wakeStartTime ? minutesSinceMidnight(new Date(wakeStartTime)) : minutesSinceMidnight(new Date())
  );

  if (wakeStartTime === null) {
    return (
      <Button
        label="Me levanté"
        size="lg"
        className="w-full"
        onPress={() => {
          hapticSuccess();
          onWake(Date.now());
        }}
      />
    );
  }

  if (correcting) {
    return (
      <View className="gap-2 rounded-3xl bg-water-50 p-4">
        <TimeField label="Hora en que te levantaste" minutes={draftMinutes} onChange={setDraftMinutes} />
        <View className="flex-row gap-2">
          <Button
            label="Guardar"
            variant="secondary"
            className="flex-1"
            onPress={() => {
              const hour = Math.floor(draftMinutes / 60);
              const minute = draftMinutes % 60;
              onWake(dateAtHour(new Date(), hour, minute));
              setCorrecting(false);
            }}
          />
          <Button label="Cancelar" variant="ghost" className="flex-1" onPress={() => setCorrecting(false)} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between rounded-3xl bg-water-50 px-5 py-4">
      <View>
        <Text className="text-xs uppercase tracking-wide text-water-500">Te levantaste a las</Text>
        <Text className="text-2xl font-bold text-water-900">{formatTime(wakeStartTime)}</Text>
        {wakeAutoApplied && (
          <Text className="mt-1 text-xs text-water-500">
            Usamos esta hora como referencia — corrígela si no es exacta
          </Text>
        )}
      </View>
      <Button label="Corregir" variant="secondary" size="sm" onPress={() => setCorrecting(true)} />
    </View>
  );
}
