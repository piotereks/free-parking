// Logs existence information about allStyles entries against tailwind config
export function logStyleUsage(functionName, allStyles = {}, name, prefix = '') {
  try {
    const tailwindConfig = require('../../../tailwind.config.js');
    const colorObj = tailwindConfig.theme?.extend?.colors || {};
    const v = allStyles?.[name];
    const existsValue = !!v && (v in colorObj);
    const prefixed = prefix ? `${prefix}${v}` : null;
    const prefixedExists = !!prefixed && (prefixed in colorObj);

    // concise debug output
    // Example: [DEBUG] [App] value of allStyles['bg-primary']='bg-primary-light', existsValue=true, prefixed='bg-bg-primary-light', prefixedExists=false
    console.debug(`[DEBUG] [${functionName}] value of allStyles['${name}'] = ${String(v)}`, {
      existsValue,
      prefixed: String(prefixed),
      prefixedExists,
    });
  } catch (e) {
    console.debug(`[DEBUG] [${functionName}] logStyleUsage failed for ${name}:`, e?.message || e);
  }
}
