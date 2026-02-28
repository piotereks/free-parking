const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to configure Android activity attributes for Android 15+
 * compatibility:
 *
 * 1. android:resizeableActivity="true" — supports multi-window and large-screen
 *    devices (foldables, tablets) on Android 16+.
 *
 * 2. android:windowLayoutInDisplayCutoutMode="always" — the manifest attribute
 *    that tells the OS to extend app content into the display notch/cutout area
 *    in all display modes. This replaces the deprecated Java constants
 *    LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES and
 *    LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT, which are flagged by the Play
 *    Console for Android 15+. Setting "always" is correct for an app that has
 *    edgeToEdgeEnabled=true, ensuring the content fills the entire screen
 *    including notch regions without letterboxing.
 *
 * 3. Removes android:screenOrientation — removes any orientation lock so the
 *    app supports all orientations on large-screen devices (foldables, tablets)
 *    as required from Android 16+. The app handles landscape layouts at runtime
 *    via the useOrientation() hook.
 */
module.exports = ({ config }) => {
  return withAndroidManifest(config, (appConfig) => {
    const manifest = appConfig.modResults.manifest;
    const application = manifest.application?.[0];
    if (!application) return appConfig;

    const activities = application.activity || [];
    for (const activity of activities) {
      activity.$['android:resizeableActivity'] = 'true';
      activity.$['android:windowLayoutInDisplayCutoutMode'] = 'always';
      delete activity.$['android:screenOrientation'];
    }

    return appConfig;
  });
};
