import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { formatTime } from "@/lib/time";

interface NextReminderCardProps {
  nextDose: { time: number; suggestedAmountMl: number } | null;
  goalReached: boolean;
  wakeStartTime: number | null;
}

export function NextReminderCard({ nextDose, goalReached, wakeStartTime }: NextReminderCardProps) {
  if (goalReached) {
    return (
      <Card className="items-center">
        <Text className="text-base font-medium text-water-700">
          Ya no hay más recordatorios por hoy 💛
        </Text>
      </Card>
    );
  }

  if (!wakeStartTime) {
    return (
      <Card className="items-center">
        <Text className="text-base text-water-600">
          Toca "Me levanté" para armar tus recordatorios de hoy
        </Text>
      </Card>
    );
  }

  if (!nextDose) {
    return (
      <Card className="items-center">
        <Text className="text-base text-water-600">Preparando tu próximo recordatorio…</Text>
      </Card>
    );
  }

  return (
    <Card className="flex-row items-center justify-between">
      <View>
        <Text className="text-xs uppercase tracking-wide text-water-500">Próximo recordatorio</Text>
        <Text className="text-2xl font-bold text-water-900">{formatTime(nextDose.time)}</Text>
      </View>
      <Text className="text-base font-semibold text-water-700">
        ~{nextDose.suggestedAmountMl} mL
      </Text>
    </Card>
  );
}
