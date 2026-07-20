import { Pressable, Text, View } from "react-native";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  unit,
}: NumberFieldProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-base text-water-900">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Disminuir ${label}`}
          onPress={() => onChange(clamp(value - step))}
          className="h-10 w-10 items-center justify-center rounded-full bg-water-100 active:bg-water-200"
        >
          <Text className="text-xl font-semibold text-water-700">−</Text>
        </Pressable>
        <Text className="min-w-[64px] text-center text-lg font-semibold text-water-900">
          {value}
          {unit ? ` ${unit}` : ""}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${label}`}
          onPress={() => onChange(clamp(value + step))}
          className="h-10 w-10 items-center justify-center rounded-full bg-water-100 active:bg-water-200"
        >
          <Text className="text-xl font-semibold text-water-700">+</Text>
        </Pressable>
      </View>
    </View>
  );
}
