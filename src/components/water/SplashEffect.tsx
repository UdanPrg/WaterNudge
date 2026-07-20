import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingProps {
  progress: ReturnType<typeof useSharedValue<number>>;
  maxRadius: number;
  color: string;
}

function Ring({ progress, maxRadius, color }: RingProps) {
  const animatedProps = useAnimatedProps(() => ({
    r: progress.value * maxRadius,
    opacity: 1 - progress.value,
  }));
  return (
    <AnimatedCircle animatedProps={animatedProps} cx={50} cy={50} fill="none" stroke={color} strokeWidth={3} />
  );
}

interface SplashEffectProps {
  trigger: number;
}

/** Plays a brief expanding-ring splash whenever `trigger` changes (e.g. after logging a glass). */
export function SplashEffect({ trigger }: SplashEffectProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 550 });
  }, [trigger]);

  return (
    <Svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Ring progress={progress} maxRadius={46} color="#2f8ab4" />
      <Ring progress={progress} maxRadius={34} color="#4fa6cc" />
    </Svg>
  );
}
