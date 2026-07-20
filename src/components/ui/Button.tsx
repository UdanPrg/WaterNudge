import { Pressable, Text, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-water-600 active:bg-water-700",
  secondary: "bg-water-100 active:bg-water-200",
  ghost: "bg-transparent active:bg-water-50",
  danger: "bg-blush-400 active:bg-blush-300",
};

const VARIANT_TEXT_CLASSES: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-water-800",
  ghost: "text-water-700",
  danger: "text-white",
};

const SIZE_CLASSES: Record<Size, string> = {
  lg: "px-8 py-5 rounded-3xl",
  md: "px-5 py-3.5 rounded-2xl",
  sm: "px-3.5 py-2 rounded-xl",
};

const SIZE_TEXT_CLASSES: Record<Size, string> = {
  lg: "text-xl font-semibold",
  md: "text-base font-semibold",
  sm: "text-sm font-medium",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  disabled,
  className,
  ...pressableProps
}: ButtonProps & { className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      className={`items-center justify-center ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${
        disabled ? "opacity-40" : ""
      } ${className ?? ""}`}
      {...pressableProps}
    >
      <Text className={`${SIZE_TEXT_CLASSES[size]} ${VARIANT_TEXT_CLASSES[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
