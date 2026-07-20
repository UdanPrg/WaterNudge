import { Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import type { HistoryDay } from "@/types";

interface HistoryListProps {
  history: HistoryDay[];
}

export function HistoryList({ history }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <Card className="items-center">
        <Text className="text-base text-water-600">
          Todavía no hay días registrados. Vuelve mañana para ver tu historial.
        </Text>
      </Card>
    );
  }

  const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <View className="gap-3">
      {sorted.map((day) => {
        const percent = day.goalMl > 0 ? Math.round((day.totalMl / day.goalMl) * 100) : 0;
        const reached = day.totalMl >= day.goalMl;
        return (
          <Card key={day.date} className="flex-row items-center justify-between">
            <Text className="text-base font-medium text-water-900">{day.date}</Text>
            <View className="items-end">
              <Text className="text-lg font-bold text-water-900">
                {day.totalMl} / {day.goalMl} mL
              </Text>
              <Text className={`text-sm ${reached ? "text-water-600" : "text-water-500"}`}>
                {percent}% {reached ? "🎉" : ""}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}
