import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Card } from "@/components/ui/Card";

const CONFETTI_COLORS = ["#2f8ab4", "#4fa6cc", "#e2798a", "#84c5df"];

function ConfettiPiece({ leftPercent, color, delay }: { leftPercent: number; color: string; delay: number }) {
  const fall = useSharedValue(0);

  useEffect(() => {
    fall.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2200 }), -1, false));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: fall.value * 260 },
      { rotate: `${fall.value * 360}deg` },
    ],
    opacity: 1 - fall.value * 0.8,
  }));

  return (
    <Animated.View
      style={[{ position: "absolute", left: `${leftPercent}%`, top: 0, width: 10, height: 10, backgroundColor: color, borderRadius: 3 }, style]}
    />
  );
}

interface CelebrationOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export function CelebrationOverlay({ visible, onDismiss }: CelebrationOverlayProps) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onDismiss}
      className="absolute inset-0 items-center justify-center bg-water-900/30 px-6"
    >
      <View className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            leftPercent={(i * 97) % 100}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            delay={(i * 137) % 900}
          />
        ))}
      </View>
      <Card className="items-center gap-2">
        <Text className="text-3xl">🎉💧🤰</Text>
        <Text className="text-center text-xl font-bold text-water-900">
          ¡Meta cumplida por hoy!
        </Text>
        <Text className="text-center text-base text-water-600">
          Ya tomaste toda el agua que necesitabas. ¡Excelente trabajo cuidándote a ti y al bebé!
        </Text>
      </Card>
    </Pressable>
  );
}
