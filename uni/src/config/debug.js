let _enabled = true;

export const isDebugEnabled = () => _enabled;

export const setDebugEnabled = (v) => {
  _enabled = Boolean(v);
};

export const debugLog = (...args) => {
  if (!_enabled) return;
  // prefer console.debug when available
  if (console && console.debug) console.debug('[DEBUG]', ...args);
  else console.log('[DEBUG]', ...args);
};

export default {
  isDebugEnabled,
  setDebugEnabled,
  debugLog,
};
