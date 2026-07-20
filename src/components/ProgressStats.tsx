import { Text, View } from "react-native";

interface ProgressStatsProps {
  totalMl: number;
  goalMl: number;
}

export function ProgressStats({ totalMl, goalMl }: ProgressStatsProps) {
  const percent = goalMl > 0 ? Math.min(100, Math.round((totalMl / goalMl) * 100)) : 0;
  const remaining = Math.max(0, goalMl - totalMl);

  return (
    <View className="items-center gap-1">
      <Text className="text-4xl font-bold text-water-900">
        {totalMl} <Text className="text-2xl font-medium text-water-600">/ {goalMl} mL</Text>
      </Text>
      <Text className="text-lg font-semibold text-water-600">{percent}%</Text>
      <Text className="text-sm text-water-500">
        {remaining > 0 ? `Faltan ${remaining} mL` : "¡Meta alcanzada! 🎉"}
      </Text>
    </View>
  );
}
