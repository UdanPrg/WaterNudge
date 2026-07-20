import { useEffect } from "react";
import { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BubbleProps {
  levelY: SharedValue<number>;
  height: number;
  cx: number;
  r: number;
  durationMs: number;
  delayMs: number;
}

function Bubble({ levelY, height, cx, r, durationMs, delayMs }: BubbleProps) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delayMs,
      withRepeat(withTiming(1, { duration: durationMs }), -1, false)
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const cy = height - t.value * (height - levelY.value);
    const fade = Math.min(t.value, 1 - t.value) * 4;
    return {
      cy,
      opacity: Math.max(0, Math.min(1, fade)) * 0.5,
    };
  });

  return <AnimatedCircle animatedProps={animatedProps} cx={cx} r={r} fill="#ffffff" />;
}

interface BubblesProps {
  levelY: SharedValue<number>;
  width: number;
  height: number;
}

const BUBBLE_CONFIG = [
  { cxRatio: 0.3, r: 3, duration: 3200, delay: 0 },
  { cxRatio: 0.55, r: 2, duration: 2600, delay: 700 },
  { cxRatio: 0.7, r: 3.5, duration: 3600, delay: 1400 },
  { cxRatio: 0.42, r: 2, duration: 2900, delay: 2100 },
];

export function Bubbles({ levelY, width, height }: BubblesProps) {
  return (
    <>
      {BUBBLE_CONFIG.map((bubble, index) => (
        <Bubble
          key={index}
          levelY={levelY}
          height={height}
          cx={width * bubble.cxRatio}
          r={bubble.r}
          durationMs={bubble.duration}
          delayMs={bubble.delay}
        />
      ))}
    </>
  );
}
