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
 * 3. Removes android:screenOrientation from all app-level activities and adds
 *    manifest-merger override entries (tools:node="merge" +
 *    tools:remove="android:screenOrientation") for known third-party activities
 *    whose .aar manifests declare an orientation lock. These library manifests
 *    are merged by Gradle after expo prebuild, so they must be handled via
 *    Gradle's manifest merger tools directives rather than a simple delete.
 */

// Third-party activities known to declare android:screenOrientation.
// Override entries added here instruct Gradle's manifest merger to strip
// that attribute from the final merged AndroidManifest.
const THIRD_PARTY_ORIENTATION_ACTIVITIES = [
  // Google ML Kit barcode scanning — transitive dep of react-native-google-mobile-ads
  'com.google.mlkit.vision.barcode.internal.ui.GmsBarcodeScanningDelegateActivity',
  // Google Mobile Ads interstitial/rewarded ad activity
  'com.google.android.gms.ads.AdActivity',
];

module.exports = ({ config }) => {
  return withAndroidManifest(config, (appConfig) => {
    const manifest = appConfig.modResults.manifest;
    const application = manifest.application?.[0];
    if (!application) return appConfig;

    // Ensure xmlns:tools is present so tools:* attributes are valid.
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    // Patch all existing app-level activities.
    const activities = application.activity || [];
    for (const activity of activities) {
      activity.$['android:resizeableActivity'] = 'true';
      activity.$['android:windowLayoutInDisplayCutoutMode'] = 'always';
      delete activity.$['android:screenOrientation'];
    }

    // Ensure the manifest has the tools namespace so we can use tools:remove and tools:node.
    manifest.$ = manifest.$ || {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Add an override for the ML Kit barcode scanning delegate activity declared in a library .aar.
    // This ensures android:screenOrientation is removed during the Gradle manifest merge step.
    const ML_KIT_BARCODE_ACTIVITY_NAME =
      'com.google.mlkit.vision.codescanner.GmsBarcodeScanningDelegateActivity';

    const hasMlKitOverride = activities.some(
      (activity) => activity.$ && activity.$['android:name'] === ML_KIT_BARCODE_ACTIVITY_NAME
    );

    if (!hasMlKitOverride) {
      activities.push({
        $: {
          'android:name': ML_KIT_BARCODE_ACTIVITY_NAME,
          'tools:node': 'merge',
          'tools:remove': 'android:screenOrientation',
        },
      });
      application.activity = activities;
    }
    // Add manifest-merger override entries for known third-party activities
    // that declare android:screenOrientation in their own .aar manifests.
    for (const activityName of THIRD_PARTY_ORIENTATION_ACTIVITIES) {
      const alreadyDeclared = activities.some(
        (a) => a.$['android:name'] === activityName
      );
      if (!alreadyDeclared) {
        activities.push({
          $: {
            'android:name': activityName,
            'tools:node': 'merge',
            'tools:remove': 'android:screenOrientation',
          },
        });
      }
    }

    application.activity = activities;

    return appConfig;
  });
};
