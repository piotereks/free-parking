import React, { useCallback, useEffect, useRef } from 'react';
import { useParkingStore } from '../hooks/useParkingStore';
import { createMobileFetchAdapter } from '../adapters/mobileFetchAdapter';

const API_URLS = [
  'https://gd.zaparkuj.pl/api/freegroupcountervalue.json',
  'https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json',
];

const fetchAdapter = createMobileFetchAdapter();

/**
 * Minimal data provider for mobile: fetches realtime data and wires refresh callback.
 * History/CSV is skipped on mobile for now; focus on live availability.
 */
const ParkingDataProvider = ({ children }) => {
  const setRealtimeData = useParkingStore((s) => s.setRealtimeData);
  const setRealtimeLoading = useParkingStore((s) => s.setRealtimeLoading);
  const setRealtimeError = useParkingStore((s) => s.setRealtimeError);
  const setLastRealtimeUpdate = useParkingStore((s) => s.setLastRealtimeUpdate);
  const setRefreshCallback = useParkingStore((s) => s.setRefreshCallback);
  const setStopAutoRefresh = useParkingStore((s) => s.setStopAutoRefresh);

  const fetchInFlight = useRef(false);

  const fetchRealtime = useCallback(async () => {
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    setRealtimeLoading(true);
    setRealtimeError(null);
    try {
      const results = await Promise.all(
        API_URLS.map((url) => fetchAdapter.fetchJSON(url))
      );
      // Keep only truthy responses
      const cleaned = Array.isArray(results)
        ? results.filter((item) => !!item)
        : [];
      setRealtimeData(cleaned);
      setLastRealtimeUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch realtime data:', err);
      setRealtimeError(err);
    } finally {
      fetchInFlight.current = false;
      setRealtimeLoading(false);
    }
  }, [setLastRealtimeUpdate, setRealtimeData, setRealtimeError, setRealtimeLoading]);

  useEffect(() => {
    setRefreshCallback(() => fetchRealtime);
    setStopAutoRefresh(() => undefined);
    fetchRealtime();
    return () => {
      setRefreshCallback(null);
      setStopAutoRefresh(null);
    };
  }, [fetchRealtime, setRefreshCallback, setStopAutoRefresh]);

  return children;
};

export default ParkingDataProvider;
