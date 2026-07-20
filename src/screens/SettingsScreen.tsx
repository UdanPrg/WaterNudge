import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { SettingsForm } from "@/components/SettingsForm";
import { useScheduler } from "@/lib/hooks/useScheduler";
import { useSettings } from "@/lib/hooks/useSettings";

export function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const {
    permissionStatus,
    requestNotificationPerm,
    openExactAlarmSettings,
    openFullScreenIntentSettings,
    refreshPermissionStatus,
  } = useScheduler();

  return (
    <SafeAreaView className="flex-1 bg-water-50">
      <ScrollView contentContainerClassName="gap-4 p-5">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base font-medium text-water-700">← Volver</Text>
          </Pressable>
          <Text className="text-xl font-bold text-water-900">Ajustes</Text>
          <View className="w-16" />
        </View>

        <SettingsForm
          settings={settings}
          onUpdate={updateSettings}
          permissionStatus={permissionStatus}
          onRequestNotifications={requestNotificationPerm}
          onOpenExactAlarmSettings={async () => {
            await openExactAlarmSettings();
            refreshPermissionStatus();
          }}
          onOpenFullScreenIntentSettings={async () => {
            await openFullScreenIntentSettings();
            refreshPermissionStatus();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
