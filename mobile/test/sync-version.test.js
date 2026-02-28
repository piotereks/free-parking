const fs = require('fs');
const path = require('path');
const os = require('os');
const { syncVersion } = require('../scripts/update-app-version');

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

describe('update-app-version script', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fp-sync-'));
  });

  afterEach(() => {
    // clean up directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('copies package.json version into expo.version of app.json', () => {
    const pkgPath = path.join(tmpDir, 'package.json');
    const appPath = path.join(tmpDir, 'app.json');

    writeJson(pkgPath, { version: '9.9.9' });
    writeJson(appPath, { expo: { version: '0.0.0', name: 'foo' } });

    const v = syncVersion(pkgPath, appPath);
    expect(v).toBe('9.9.9');

    const updated = JSON.parse(fs.readFileSync(appPath, 'utf8'));
    expect(updated.expo.version).toBe('9.9.9');
  });

  it('writes top-level version when expo object is missing', () => {
    const pkgPath = path.join(tmpDir, 'package.json');
    const appPath = path.join(tmpDir, 'app.json');

    writeJson(pkgPath, { version: '7.7.7' });
    writeJson(appPath, { name: 'something-else' });

    const v = syncVersion(pkgPath, appPath);
    expect(v).toBe('7.7.7');

    const updated = JSON.parse(fs.readFileSync(appPath, 'utf8'));
    expect(updated.version).toBe('7.7.7');
  });

  it('throws if package.json has no version', () => {
    const pkgPath = path.join(tmpDir, 'package.json');
    const appPath = path.join(tmpDir, 'app.json');

    writeJson(pkgPath, {});
    writeJson(appPath, { expo: { version: '1.2.3' } });

    expect(() => syncVersion(pkgPath, appPath)).toThrow(/package\.json/);
  });
});
