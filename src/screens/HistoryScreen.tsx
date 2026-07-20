import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { HistoryList } from "@/components/HistoryList";
import { useHistory } from "@/lib/hooks/useHistory";

export function HistoryScreen() {
  const router = useRouter();
  const { history } = useHistory();

  return (
    <SafeAreaView className="flex-1 bg-water-50">
      <ScrollView contentContainerClassName="gap-4 p-5">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base font-medium text-water-700">← Volver</Text>
          </Pressable>
          <Text className="text-xl font-bold text-water-900">Historial (7 días)</Text>
          <View className="w-16" />
        </View>
        <HistoryList history={history} />
      </ScrollView>
    </SafeAreaView>
  );
}
