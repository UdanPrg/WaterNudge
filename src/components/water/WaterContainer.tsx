import { useEffect } from "react";
import { View } from "react-native";
import Svg, { ClipPath, Defs, G, Rect } from "react-native-svg";
import { useSharedValue, withTiming } from "react-native-reanimated";

import { Bubbles } from "@/components/water/Bubbles";
import { SplashEffect } from "@/components/water/SplashEffect";
import { Wave } from "@/components/water/Wave";

const WIDTH = 220;
const HEIGHT = 320;
const CLIP_ID = "waternudge-bottle-clip";

interface WaterContainerProps {
  /** 0..1 fraction of the daily goal reached. */
  progress: number;
  /** Increment this whenever a new entry is logged to play the splash animation. */
  splashTrigger?: number;
}

export function WaterContainer({ progress, splashTrigger = 0 }: WaterContainerProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const levelY = useSharedValue(HEIGHT - clamped * HEIGHT);

  useEffect(() => {
    levelY.value = withTiming(HEIGHT - clamped * HEIGHT, { duration: 700 });
  }, [clamped]);

  return (
    <View className="items-center justify-center">
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Defs>
          <ClipPath id={CLIP_ID}>
            <Rect x={4} y={4} width={WIDTH - 8} height={HEIGHT - 8} rx={40} ry={40} />
          </ClipPath>
        </Defs>

        <Rect
          x={4}
          y={4}
          width={WIDTH - 8}
          height={HEIGHT - 8}
          rx={40}
          ry={40}
          fill="#eef7fb"
          stroke="#2f8ab4"
          strokeWidth={4}
        />

        <G clipPath={`url(#${CLIP_ID})`}>
          <Wave
            levelY={levelY}
            width={WIDTH}
            height={HEIGHT}
            amplitude={5}
            periodPx={WIDTH}
            speedMs={4200}
            opacity={0.5}
            color="#4fa6cc"
            phaseOffset={0}
          />
          <Wave
            levelY={levelY}
            width={WIDTH}
            height={HEIGHT}
            amplitude={8}
            periodPx={WIDTH * 0.75}
            speedMs={6000}
            opacity={0.9}
            color="#2f8ab4"
            phaseOffset={Math.PI / 2}
          />
          {clamped > 0.02 && <Bubbles levelY={levelY} width={WIDTH} height={HEIGHT} />}
        </G>

        <Rect
          x={4}
          y={4}
          width={WIDTH - 8}
          height={HEIGHT - 8}
          rx={40}
          ry={40}
          fill="none"
          stroke="#1e4a65"
          strokeWidth={2}
          opacity={0.12}
        />
      </Svg>
      <SplashEffect trigger={splashTrigger} />
    </View>
  );
}
