const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to add android:resizeableActivity="true" on all
 * <activity> elements so the app supports multi-window and large-screen
 * devices (foldables, tablets) on Android 16+.
 *
 * From Android 16, the OS ignores resizability / orientation restrictions for
 * large-screen devices; declaring resizeableActivity="true" proactively avoids
 * layout issues and satisfies the Google Play large-screen quality guidelines.
 */
module.exports = ({ config }) => {
  return withAndroidManifest(config, (appConfig) => {
    const manifest = appConfig.modResults.manifest;
    const application = manifest.application?.[0];
    if (!application) return appConfig;

    const activities = application.activity || [];
    for (const activity of activities) {
      activity.$['android:resizeableActivity'] = 'true';
    }

    return appConfig;
  });
};
