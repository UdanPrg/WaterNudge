import { useRef, useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/NumberField";
import { hapticTap } from "@/lib/haptics";

interface QuickAddButtonsProps {
  onAdd: (ml: number) => void;
}

const QUICK_AMOUNTS = [250, 350];

export function QuickAddButtons({ onAdd }: QuickAddButtonsProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customMl, setCustomMl] = useState(200);
  // Synchronous guard checked before React state can re-render, so a rapid
  // double-tap can't log the same glass twice.
  const inFlightRef = useRef(false);

  function handleAdd(ml: number) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    hapticTap();
    onAdd(ml);
    setTimeout(() => {
      inFlightRef.current = false;
    }, 400);
  }

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        {QUICK_AMOUNTS.map((ml) => (
          <Button
            key={ml}
            label={`+${ml} mL`}
            size="lg"
            className="flex-1"
            onPress={() => handleAdd(ml)}
          />
        ))}
      </View>

      {customOpen ? (
        <View className="gap-2 rounded-2xl bg-water-50 p-3">
          <NumberField
            label="Cantidad personalizada"
            value={customMl}
            onChange={setCustomMl}
            step={25}
            min={25}
            max={1000}
            unit="mL"
          />
          <View className="flex-row gap-2">
            <Button
              label="Agregar"
              variant="secondary"
              className="flex-1"
              onPress={() => {
                handleAdd(customMl);
                setCustomOpen(false);
              }}
            />
            <Button
              label="Cancelar"
              variant="ghost"
              className="flex-1"
              onPress={() => setCustomOpen(false)}
            />
          </View>
        </View>
      ) : (
        <Button label="Cantidad personalizada" variant="secondary" onPress={() => setCustomOpen(true)} />
      )}
    </View>
  );
}
