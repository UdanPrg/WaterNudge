import { useEffect } from "react";
import { Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

function buildWaveD(
  width: number,
  height: number,
  level: number,
  amplitude: number,
  phase: number,
  periodPx: number
) {
  "worklet";
  const points = 24;
  let d = `M0,${height}`;
  for (let i = 0; i <= points; i++) {
    const x = (width * i) / points;
    const y = level + amplitude * Math.sin((x / periodPx) * 2 * Math.PI + phase);
    d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
  }
  d += ` L${width},${height} Z`;
  return d;
}

interface WaveProps {
  levelY: SharedValue<number>;
  width: number;
  height: number;
  amplitude: number;
  periodPx: number;
  speedMs: number;
  opacity: number;
  color: string;
  phaseOffset: number;
}

export function Wave({
  levelY,
  width,
  height,
  amplitude,
  periodPx,
  speedMs,
  opacity,
  color,
  phaseOffset,
}: WaveProps) {
  const phase = useSharedValue(phaseOffset);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(phaseOffset + Math.PI * 2, { duration: speedMs, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    d: buildWaveD(width, height, levelY.value, amplitude, phase.value, periodPx),
  }));

  return <AnimatedPath animatedProps={animatedProps} fill={color} opacity={opacity} />;
}
