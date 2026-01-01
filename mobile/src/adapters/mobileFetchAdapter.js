export const createMobileFetchAdapter = () => {
  const fetchWithBust = async (url, options = {}) => {
    try {
      const sep = url.includes("?") ? "&" : "?";
      const finalUrl = `${url}${sep}t=${Date.now()}`;
      return fetch(finalUrl, options);
    } catch (e) {
      console.error("Fetch failed:", e);
      throw e;
    }
  };

  return {
    fetch: fetchWithBust,
    fetchJSON: async (url, options) => {
      const res = await fetchWithBust(url, options);
      return res.json();
    },
    fetchText: async (url, options) => {
      const res = await fetchWithBust(url, options);
      return res.text();
    },
  };
};
