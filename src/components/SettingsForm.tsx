import { Text, View } from "react-native";

import { AlarmSoundPicker } from "@/components/AlarmSoundPicker";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { TimeField } from "@/components/ui/TimeField";
import { Toggle } from "@/components/ui/Toggle";
import { MIN_GLASS_ML } from "@/lib/constants";
import { isTaperValid } from "@/lib/scheduling/scheduler";
import type { PermissionStatus } from "@/lib/scheduling/alarms";
import type { Settings } from "@/types";

interface SettingsFormProps {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
  permissionStatus: PermissionStatus | null;
  onRequestNotifications: () => void;
  onOpenExactAlarmSettings: () => void;
  onOpenFullScreenIntentSettings: () => void;
}

export function SettingsForm({
  settings,
  onUpdate,
  permissionStatus,
  onRequestNotifications,
  onOpenExactAlarmSettings,
  onOpenFullScreenIntentSettings,
}: SettingsFormProps) {
  const taperOk = isTaperValid(settings.windowHours, settings.taperMinutes);

  return (
    <View className="gap-4">
      <Card>
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-water-500">
          Meta e hidratación
        </Text>
        <NumberField
          label="Meta diaria"
          value={settings.goalMl}
          onChange={(goalMl) => onUpdate({ goalMl })}
          step={100}
          min={500}
          unit="mL"
        />
        <NumberField
          label="Tamaño de vaso"
          value={settings.glassMl}
          onChange={(glassMl) => onUpdate({ glassMl })}
          step={25}
          min={MIN_GLASS_ML}
          unit="mL"
        />
      </Card>

      <Card>
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-water-500">
          Ventana de vigilia
        </Text>
        <NumberField
          label="Horas despierta"
          value={settings.windowHours}
          onChange={(windowHours) => onUpdate({ windowHours })}
          step={1}
          min={4}
          max={20}
          unit="h"
        />
        <NumberField
          label="Dejar de recordar antes de dormir"
          value={settings.taperMinutes}
          onChange={(taperMinutes) => onUpdate({ taperMinutes })}
          step={15}
          min={0}
          max={240}
          unit="min"
        />
        {!taperOk && (
          <Text className="text-sm text-blush-400">
            Este taper es muy alto para la ventana elegida — ajústalo para que queden avisos útiles.
          </Text>
        )}
        <NumberField
          label="Hora de referencia si olvidas 'Me levanté'"
          value={settings.fallbackWakeHour}
          onChange={(fallbackWakeHour) => onUpdate({ fallbackWakeHour })}
          step={1}
          min={0}
          max={23}
          unit="h"
        />
      </Card>

      <Card>
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-water-500">
          Horas de silencio
        </Text>
        <TimeField
          label="Desde"
          minutes={settings.quietStartMinutes}
          onChange={(quietStartMinutes) => onUpdate({ quietStartMinutes })}
        />
        <TimeField
          label="Hasta"
          minutes={settings.quietEndMinutes}
          onChange={(quietEndMinutes) => onUpdate({ quietEndMinutes })}
        />
      </Card>

      <Card>
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-water-500">
          Sonido y vibración
        </Text>
        <Toggle label="Sonido" value={settings.sound} onChange={(sound) => onUpdate({ sound })} />
        <Toggle
          label="Vibración"
          value={settings.vibration}
          onChange={(vibration) => onUpdate({ vibration })}
        />
        <AlarmSoundPicker
          soundUri={settings.alarmSoundUri}
          onChange={(alarmSoundUri) => onUpdate({ alarmSoundUri })}
        />
      </Card>

      <Card className="gap-3">
        <Text className="mb-1 text-sm font-semibold uppercase tracking-wide text-water-500">
          Permisos de alarma
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-base text-water-900">Notificaciones</Text>
          {permissionStatus?.notifications ? (
            <Text className="text-water-600">Activo ✓</Text>
          ) : (
            <Button label="Activar" size="sm" variant="secondary" onPress={onRequestNotifications} />
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-base text-water-900">Alarmas exactas</Text>
          {permissionStatus?.exactAlarm ? (
            <Text className="text-water-600">Activo ✓</Text>
          ) : (
            <Button label="Ajustes" size="sm" variant="secondary" onPress={onOpenExactAlarmSettings} />
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-base text-water-900">Pantalla completa</Text>
          {permissionStatus?.fullScreenIntent ? (
            <Text className="text-water-600">Activo ✓</Text>
          ) : (
            <Button label="Ajustes" size="sm" variant="secondary" onPress={onOpenFullScreenIntentSettings} />
          )}
        </View>
      </Card>
    </View>
  );
}
