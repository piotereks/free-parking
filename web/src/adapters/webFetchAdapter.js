/**
 * Web Fetch Adapter - applies CORS proxy and cache-busting for web
 * Compatible with parking-shared FetchAdapter interface
 */

const CORS_PROXY = 'https://corsproxy.io/?';
const CORS_REQUIRED_DOMAINS = ['zaparkuj.pl', 'docs.google.com'];

/**
 * Check if URL needs CORS proxy
 * @param {string} url - URL to check
 * @returns {boolean}
 */
function needsCorsProxy(url) {
  return CORS_REQUIRED_DOMAINS.some(domain => url.includes(domain));
}

/**
 * Apply CORS proxy and cache-busting to URL
 * @param {string} url - Original URL
 * @returns {string} Proxied URL with cache-busting param
 */
function applyProxyAndCache(url) {
  // Add cache-busting query parameter
  const separator = url.includes('?') ? '&' : '?';
  const cacheBusterUrl = `${url}${separator}t=${Date.now()}`;

  if (needsCorsProxy(url)) {
    return `${CORS_PROXY}${encodeURIComponent(cacheBusterUrl)}`;
  }
  return cacheBusterUrl;
}

export const webFetchAdapter = {
  /**
   * Fetch with CORS proxy and cache-busting
   * @param {string} url - URL to fetch
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<Response>}
   */
  fetch: async (url, options = {}) => {
    const proxiedUrl = applyProxyAndCache(url);
    try {
      const response = await fetch(proxiedUrl, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      console.error(`Fetch failed for ${url}:`, error);
      throw error;
    }
  },

  /**
   * Fetch and parse JSON
   * @param {string} url - URL to fetch
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<any>}
   */
  fetchJSON: async (url, options = {}) => {
    const response = await webFetchAdapter.fetch(url, options);
    try {
      return await response.json();
    } catch (error) {
      console.error(`Failed to parse JSON from ${url}:`, error);
      throw error;
    }
  },

  /**
   * Fetch and parse text
   * @param {string} url - URL to fetch
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<string>}
   */
  fetchText: async (url, options = {}) => {
    const response = await webFetchAdapter.fetch(url, options);
    try {
      return await response.text();
    } catch (error) {
      console.error(`Failed to parse text from ${url}:`, error);
      throw error;
    }
  },
};
