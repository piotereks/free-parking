#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Read package.json and app.json, copy the version string from package.json
 * into the Expo config (appJson.expo.version).  If the file has no `expo`
 * object the script will set a top-level `version` key instead so it still
 * bumps something useful.
 *
 * @param {string} pkgPath path to package.json (default: ./package.json)
 * @param {string} appPath path to app.json (default: ./app.json)
 * @returns {string} the version that was written
 */
function syncVersion(pkgPath = 'package.json', appPath = 'app.json') {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (!pkg.version) {
    throw new Error('package.json does not contain a version field');
  }

  const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));
  if (appJson.expo && typeof appJson.expo === 'object') {
    appJson.expo.version = pkg.version;
  } else {
    // fall back to a top-level version key; Expo ignores it but it's still
    // a sensible fallback for plain JSON.
    appJson.version = pkg.version;
  }

  fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2) + '\n');
  return pkg.version;
}

// When executed directly from the command line, run against the workspace root
if (require.main === module) {
  const version = syncVersion();
  console.log(`updated app.json to version ${version}`);
}

module.exports = { syncVersion };
