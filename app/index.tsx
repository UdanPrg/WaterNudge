import { ActivityIndicator, View } from "react-native";

import { useAppState } from "@/context/AppStateProvider";
import { HomeScreen } from "@/screens/HomeScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";

export default function Index() {
  const { loading, onboardingComplete } = useAppState();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-water-50">
        <ActivityIndicator size="large" color="#2f8ab4" />
      </View>
    );
  }

  return onboardingComplete ? <HomeScreen /> : <OnboardingScreen />;
}
