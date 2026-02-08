/**
 * Adapter type definitions and default implementations
 * These define the contracts that platform-specific adapters must implement
 */

/**
 * @typedef {Object} StorageAdapter
 * @property {function(string): Promise<*>} get - Get value by key
 * @property {function(string, *): Promise<void>} set - Set value by key
 * @property {function(string): Promise<void>} remove - Remove value by key
 * @property {function(): Promise<void>} [clear] - Clear all storage (optional)
 */

/**
 * @typedef {Object} FetchAdapter
 * @property {function(string, RequestInit=): Promise<Response>} fetch - Fetch a URL
 * @property {function(string, RequestInit=): Promise<*>} fetchJSON - Fetch and parse JSON
 * @property {function(string, RequestInit=): Promise<string>} fetchText - Fetch as text
 */

/**
 * @typedef {Object} LoggerAdapter
 * @property {function(...*): void} log - Log a message
 * @property {function(...*): void} warn - Log a warning
 * @property {function(...*): void} error - Log an error
 * @property {function(...*): void} [debug] - Log a debug message (optional)
 */

/**
 * @typedef {Object} TimeAdapter
 * @property {function(): Date} now - Get current time
 */

/**
 * Default logger adapter - uses console
 * @type {LoggerAdapter}
 */
export const defaultLogger = {
  log: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  debug: (...args) => console.debug(...args)
};

/**
 * Default time adapter - uses Date
 * @type {TimeAdapter}
 */
export const defaultTime = {
  now: () => new Date()
};

/**
 * Null storage adapter - does nothing (useful for testing or server-side rendering)
 * @type {StorageAdapter}
 */
export const nullStorage = {
  get: async () => null,
  set: async () => {},
  remove: async () => {},
  clear: async () => {}
};

/**
 * Null logger adapter - silent (useful for testing)
 * @type {LoggerAdapter}
 */
export const nullLogger = {
  log: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};
