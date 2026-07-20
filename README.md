# WaterNudge 💧

App personal y privada para ayudar a cumplir la meta diaria de hidratación (por defecto 3000 mL), pensada para acompañar el embarazo. Marca **"Me levanté"** una vez al día y la app arma automáticamente la agenda de recordatorios del día, repartidos en tu ventana de vigilia.

**100% offline**: todos los datos (meta, vasos registrados, historial) se guardan solo en el teléfono con AsyncStorage. La app no pide permiso de Internet, no usa analítica ni servicios de terceros, y no tiene cuentas ni login.

## Cómo funcionan los recordatorios

- Al tocar **"Me levanté"** se calcula cuántos vasos necesitas (`meta ÷ tamaño de vaso`) y se reparten uniformemente en tu ventana de vigilia (por defecto 15 h), dejando de sonar recordatorios en los últimos minutos antes de dormir (taper, por defecto 120 min).
- Cada recordatorio suena **como una alarma real** (pantalla completa, incluso con el teléfono bloqueado), con dos botones: **"Ya me hidraté"** (registra el vaso automáticamente) y **"Aplazar 3 min"**.
- Si llegas a la meta antes de tiempo, se cancelan los recordatorios restantes del día y aparece una celebración.
- El progreso se reinicia automáticamente cada vez que cambia el día (al abrir la app), y se guarda un historial de los últimos 7 días.

## Requisitos previos

- [Node.js](https://nodejs.org/) 20 o superior.
- Una cuenta gratuita de [Expo](https://expo.dev/) (`npx expo login`) para poder usar EAS Build.
- Un teléfono Android (esta app está pensada solo para Android).

### Importante: esta app no funciona bien en Expo Go

WaterNudge usa notificaciones de pantalla completa tipo alarma (`react-native-notify-kit`) y permisos especiales de Android (alarmas exactas, pantalla completa) que **requieren código nativo**. Expo Go no puede probarlos. Para desarrollo y pruebas reales necesitas un **development build** (ver abajo) instalado como app independiente en el teléfono.

## Cómo correr en desarrollo

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Genera un *development build* (una sola vez, o cada vez que agregues una librería nativa nueva). La forma más simple sin instalar Android Studio es con EAS Build en la nube:

   ```bash
   npx eas-cli build --profile development --platform android
   ```

   (Nota: el paquete se llama `eas-cli`, no `eas` — si escribes `npx eas build`, npm no sabe qué paquete instalar y falla con "could not determine executable to run". Si prefieres no escribir `npx eas-cli` cada vez, puedes instalarlo una sola vez de forma global con `npm install -g eas-cli` y luego usar solo `eas build ...`, `eas login`, etc.)

   Al terminar, EAS te da un enlace para descargar e instalar el APK de desarrollo en el teléfono (ver sección de instalación abajo).

3. Con el development build ya instalado en el teléfono, inicia el servidor de desarrollo:

   ```bash
   npx expo start
   ```

   Abre la app de desarrollo instalada en el teléfono y conéctate al servidor (escaneando el código QR o ingresando la URL manualmente). Los cambios de código se recargan en caliente.

Si prefieres compilar localmente con Android Studio instalado, también puedes usar `npx expo run:android` en lugar del paso 2. **En Windows esto puede fallar** con errores de enlazado C++ ("undefined symbol: __cxa_throw" y similares) al compilar `react-native-screens`/`reanimated` — es un problema conocido y aún sin solución oficial del toolchain de Android NDK + New Architecture en Windows ([ver issue](https://github.com/software-mansion/react-native-reanimated/issues/8269)), no un error del proyecto. Si te pasa, usa la opción de EAS Build en la nube (paso 2) en su lugar, ya que compila en servidores Linux/macOS y no tiene ese problema.

## Cómo generar el APK final para instalar en el teléfono

Cuando ya probaste la app y quieres instalar la versión "de verdad" (sin depender del servidor de desarrollo):

```bash
npx eas-cli build -p android --profile preview
```

Este comando compila la app en los servidores de Expo (gratis, con límites de uso mensual) y genera un **APK independiente** — ya no necesita el servidor de `expo start` corriendo, ni tu computadora encendida.

Al terminar el build, la terminal muestra un enlace (algo como `https://expo.dev/accounts/.../builds/...`). Ábrelo desde el teléfono o compártelo con la persona que va a instalar la app.

### Instalar el APK en el teléfono Android

1. Descarga el APK abriendo el enlace del build desde el navegador del teléfono (o transfiriéndolo por cable/USB, Bluetooth, etc.).
2. Al abrir el archivo `.apk` descargado, Android pedirá activar **"Instalar apps de fuentes desconocidas"** para el navegador o la app de archivos que estás usando. Actívalo solo para esa app (Ajustes → Apps → acceso especial → Instalar apps desconocidas).
3. Confirma la instalación. Al abrir WaterNudge por primera vez, sigue la pantalla de bienvenida (meta diaria, tamaño de vaso, permiso de notificaciones).
4. Ve a **Ajustes** dentro de la app y activa también los permisos de **"Alarmas exactas"** y **"Pantalla completa"** (Android te llevará a la pantalla del sistema correspondiente) — sin esto, los recordatorios pueden sonar con retraso o como una notificación normal en vez de alarma de pantalla completa.

## Permisos que pide la app y por qué

| Permiso | Para qué | Notas |
|---|---|---|
| Notificaciones (Android 13+) | Mostrar los recordatorios | Se pide en la pantalla de bienvenida |
| Alarmas exactas | Que los recordatorios suenen a la hora exacta y no con minutos de retraso | Permiso especial: hay que activarlo manualmente en Ajustes del sistema (la app te guía) |
| Pantalla completa (Android 14+) | Que el recordatorio se vea como una alarma real, incluso con el teléfono bloqueado | También es un permiso especial de activación manual en Android 14 y superior |

Ninguno de estos permisos envía datos a internet — todos son locales al dispositivo.

## Reemplazar el sonido de alarma

El archivo `assets/sounds/alarm.wav` incluido es un tono de aviso simple generado para que el proyecto compile listo para usar. Se recomienda reemplazarlo por un sonido de alarma real de tu preferencia (mismo nombre de archivo `alarm.wav`, o actualiza la ruta en `src/screens/AlarmRingScreen.tsx`).

## Estructura del proyecto

```
app/                    Rutas de Expo Router (delgadas, sin lógica)
src/screens/            Pantallas (Home, Onboarding, Historial, Ajustes, Alarma)
src/components/         Componentes de UI reutilizables, incluida la animación de agua (src/components/water/)
src/context/            AppStateProvider: estado global de la app (settings, día actual, historial)
src/lib/scheduling/     Lógica de la agenda de recordatorios (scheduler.ts) y el adaptador de alarmas (alarms.ts)
src/lib/storage/        Persistencia local en AsyncStorage
src/lib/day/            Detección de cambio de día (rollover)
src/lib/hooks/          Hooks de acceso al estado global
```

## Notas de privacidad

- Sin backend, sin base de datos en la nube, sin cuentas.
- Sin `fetch`/`axios` ni SDKs de analítica en el código.
- `app.json` no declara permiso de `INTERNET`.
- Toda la información (meta, vasos tomados, historial de 7 días) vive únicamente en el almacenamiento local del teléfono y se borra si desinstalas la app.
