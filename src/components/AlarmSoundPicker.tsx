import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { getRingtoneTitle, pickAlarmRingtone } from "@modules/ringtone-picker/src";

interface AlarmSoundPickerProps {
  soundUri: string | null;
  onChange: (uri: string | null) => void;
}

export function AlarmSoundPicker({ soundUri, onChange }: AlarmSoundPickerProps) {
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!soundUri) {
      setTitle(null);
      return;
    }
    getRingtoneTitle(soundUri).then((result) => {
      if (!cancelled) setTitle(result);
    });
    return () => {
      cancelled = true;
    };
  }, [soundUri]);

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 pr-3">
        <Text className="text-base text-water-900">Sonido de alarma</Text>
        <Text className="text-sm text-water-500">{title ?? "Predeterminado del sistema"}</Text>
      </View>
      <Button
        label="Cambiar"
        size="sm"
        variant="secondary"
        onPress={async () => {
          const picked = await pickAlarmRingtone(soundUri);
          if (picked) onChange(picked);
        }}
      />
    </View>
  );
}
