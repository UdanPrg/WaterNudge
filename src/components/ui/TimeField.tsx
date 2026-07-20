import { Pressable, Text, View } from "react-native";

interface TimeFieldProps {
  label: string;
  /** Minutes since local midnight (0-1439). */
  minutes: number;
  onChange: (minutes: number) => void;
  minuteStep?: number;
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function TimeField({ label, minutes, onChange, minuteStep = 5 }: TimeFieldProps) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  const changeHour = (delta: number) => onChange(mod(hour + delta, 24) * 60 + minute);
  const changeMinute = (delta: number) => onChange(hour * 60 + mod(minute + delta, 60));

  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-base text-water-900">{label}</Text>
      <View className="flex-row items-center gap-1">
        <Pressable
          accessibilityLabel={`Disminuir hora de ${label}`}
          onPress={() => changeHour(-1)}
          className="h-10 w-8 items-center justify-center rounded-full active:bg-water-100"
        >
          <Text className="text-lg font-semibold text-water-700">−</Text>
        </Pressable>
        <Text className="min-w-[70px] text-center text-lg font-semibold text-water-900">
          {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
        </Text>
        <Pressable
          accessibilityLabel={`Aumentar hora de ${label}`}
          onPress={() => changeHour(1)}
          className="h-10 w-8 items-center justify-center rounded-full active:bg-water-100"
        >
          <Text className="text-lg font-semibold text-water-700">+</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Disminuir minutos de ${label}`}
          onPress={() => changeMinute(-minuteStep)}
          className="ml-2 h-10 w-8 items-center justify-center rounded-full active:bg-water-100"
        >
          <Text className="text-sm font-semibold text-water-600">−m</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={`Aumentar minutos de ${label}`}
          onPress={() => changeMinute(minuteStep)}
          className="h-10 w-8 items-center justify-center rounded-full active:bg-water-100"
        >
          <Text className="text-sm font-semibold text-water-600">+m</Text>
        </Pressable>
      </View>
    </View>
  );
}
