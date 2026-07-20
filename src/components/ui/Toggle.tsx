import { Switch, Text, View } from "react-native";

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-base text-water-900">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#d7edf5", true: "#2f8ab4" }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
