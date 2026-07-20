import { Pressable, Text, View } from "react-native";

interface NotificationBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function NotificationBanner({ message, actionLabel, onAction }: NotificationBannerProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-2xl bg-blush-100 px-4 py-3">
      <Text className="flex-1 text-sm text-water-900">{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text className="text-sm font-semibold text-water-700">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
