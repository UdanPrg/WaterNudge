import { View, type ViewProps } from "react-native";

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-3xl bg-white p-5 shadow-sm shadow-water-900/10 ${className ?? ""}`}
      {...props}
    />
  );
}
