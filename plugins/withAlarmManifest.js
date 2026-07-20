const { withAndroidManifest } = require("expo/config-plugins");

/**
 * Adds android:showWhenLocked and android:turnScreenOn to the main activity so the
 * full-screen alarm (AlarmRingScreen) can appear over a locked screen, matching the
 * behavior of the stock Android Clock app's alarm ringing UI.
 */
function withAlarmManifest(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    const mainActivity = mainApplication?.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity"
    );

    if (mainActivity) {
      mainActivity.$["android:showWhenLocked"] = "true";
      mainActivity.$["android:turnScreenOn"] = "true";
    }

    return config;
  });
}

module.exports = withAlarmManifest;
