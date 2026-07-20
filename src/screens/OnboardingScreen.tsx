import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberField } from "@/components/ui/NumberField";
import { useSettings } from "@/lib/hooks/useSettings";
import { useScheduler } from "@/lib/hooks/useScheduler";
import { MIN_GLASS_ML } from "@/lib/constants";

export function OnboardingScreen() {
  const { settings, completeOnboarding } = useSettings();
  const { requestNotificationPerm } = useScheduler();
  const [goalMl, setGoalMl] = useState(settings.goalMl);
  const [glassMl, setGlassMl] = useState(settings.glassMl);
  const [permissionRequested, setPermissionRequested] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-water-50">
      <ScrollView contentContainerClassName="gap-5 p-6">
        <View className="items-center gap-2 pt-4">
          <Text className="text-3xl">💧</Text>
          <Text className="text-center text-2xl font-bold text-water-900">
            Bienvenida a WaterNudge
          </Text>
          <Text className="text-center text-base text-water-600">
            Te ayudaremos a repartir tu meta de hidratación a lo largo del día, a partir del
            momento en que te levantes.
          </Text>
        </View>

        <Card>
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-water-500">
            Tu meta diaria
          </Text>
          <NumberField label="Meta diaria" value={goalMl} onChange={setGoalMl} step={100} min={500} unit="mL" />
          <NumberField
            label="Tamaño de vaso"
            value={glassMl}
            onChange={setGlassMl}
            step={25}
            min={MIN_GLASS_ML}
            unit="mL"
          />
        </Card>

        <Card className="gap-2">
          <Text className="text-sm font-semibold uppercase tracking-wide text-water-500">
            Notificaciones
          </Text>
          <Text className="text-base text-water-700">
            Necesitamos tu permiso para poder avisarte a la hora de tomar agua, incluso con la
            app cerrada.
          </Text>
          <Button
            label={permissionRequested ? "Permiso solicitado ✓" : "Permitir notificaciones"}
            variant="secondary"
            onPress={async () => {
              await requestNotificationPerm();
              setPermissionRequested(true);
            }}
          />
        </Card>

        <Button
          label="Comenzar"
          size="lg"
          onPress={() => completeOnboarding({ ...settings, goalMl, glassMl })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
