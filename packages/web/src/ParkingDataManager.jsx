/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import Papa from 'papaparse';
import {
  useParkingStore,
  API_URLS,
  CORS_PROXY,
  CSV_URL,
  CACHE_KEY_REALTIME,
  CACHE_KEY_HISTORY,
  GOOGLE_FORM_URL,
  FORM_ENTRIES,
  COLUMN_ALIASES,
  extractLastEntry,
  dedupeHistoryRows,
  parseApiEntry
} from '@free-parking/shared';
import { storageWeb } from './adapters/storageWeb';

const ParkingDataContext = createContext();

const cloneApiResults = (apiResults = []) => (
    Array.isArray(apiResults) ? apiResults.map((result) => ({ ...(result || {}) })) : []
);

const buildCacheRowFromPayload = (gdPayload, uniPayload) => ({
    [COLUMN_ALIASES.GD_TIME]: gdPayload?.Timestamp || '',
    [COLUMN_ALIASES.GD_VALUE]: gdPayload?.CurrentFreeGroupCounterValue ?? '',
    [COLUMN_ALIASES.UNI_TIME]: uniPayload?.Timestamp || '',
    [COLUMN_ALIASES.UNI_VALUE]: uniPayload?.CurrentFreeGroupCounterValue ?? ''
});

const readHistoryCacheSnapshot = async () => {
    const cached = await storageWeb.getItem(CACHE_KEY_HISTORY);
    if (!cached) {
        return { rows: [], timestamp: null, last: { gd: null, uni: null } };
    }
    try {
        const parsed = JSON.parse(cached);
        const rows = Array.isArray(parsed.data) ? parsed.data : [];
        return {
            rows,
            timestamp: parsed.timestamp || null,
            last: extractLastEntry(rows)
        };
    } catch (error) {
        console.error('Failed to parse history cache snapshot:', error);
        return { rows: [], timestamp: null, last: { gd: null, uni: null } };
    }
};

export const ParkingDataProvider = ({ children }) => {
    // Use Zustand store
    const setRealtimeData = useParkingStore((state) => state.setRealtimeData);
    const setRealtimeLoading = useParkingStore((state) => state.setRealtimeLoading);
    const setRealtimeError = useParkingStore((state) => state.setRealtimeError);
    const setLastRealtimeUpdate = useParkingStore((state) => state.setLastRealtimeUpdate);
    const setHistoryData = useParkingStore((state) => state.setHistoryData);
    const setHistoryLoading = useParkingStore((state) => state.setHistoryLoading);
    const setLastHistoryUpdate = useParkingStore((state) => state.setLastHistoryUpdate);
    // Note: fetchInProgress state is intentionally not read here to avoid
    // duplicating the in-file ref-based protection. Use `fetchInProgressRef`
    // above for local in-flight tracking.
    const setRefreshCallback = useParkingStore((state) => state.setRefreshCallback);
    const setStopAutoRefresh = useParkingStore((state) => state.setStopAutoRefresh);
    const historyData = useParkingStore((state) => state.historyData);

    const fetchInProgressRef = useRef(false);
    const cacheCleared = useParkingStore((state) => state.cacheCleared);

    const persistHistorySnapshot = useCallback(async (rows) => {
        const safeRows = Array.isArray(rows) ? rows : [];
        const updateTime = new Date();
        setHistoryData(safeRows);
        setLastHistoryUpdate(updateTime);
        try {
            await storageWeb.setItem(CACHE_KEY_HISTORY, JSON.stringify({
                data: safeRows,
                timestamp: updateTime.toISOString()
            }));
            console.log('History cache updated');
        } catch (e) {
            console.error('Failed to cache history data:', e);
        }
    }, [setHistoryData, setLastHistoryUpdate]);

    // Submit new data to Google Form
    const submitToGoogleForm = useCallback(async (apiResults) => {
        try {
            // apiResults[0] is GreenDay, apiResults[1] is Uni (Bank_1)
            const greenDayData = apiResults[0];
            const uniData = apiResults[1];

            if (!greenDayData || !uniData) {
                console.log('Missing data for form submission');
                return;
            }

            const countGreenDay = greenDayData.CurrentFreeGroupCounterValue || 0;
            const timestampGreenDay = greenDayData.Timestamp || '';
            const countUni = uniData.CurrentFreeGroupCounterValue || 0;
            const timestampUni = uniData.Timestamp || '';

            // Build form data (URL encoded)
            const formData = new URLSearchParams();
            formData.append(FORM_ENTRIES.GREENDAY_VALUE, countGreenDay.toString());
            formData.append(FORM_ENTRIES.GREENDAY_TIME, timestampGreenDay);
            formData.append(FORM_ENTRIES.UNI_VALUE, countUni.toString());
            formData.append(FORM_ENTRIES.UNI_TIME, timestampUni);

            console.log('Submitting to Google Form:', {
                greenDay: { value: countGreenDay, time: timestampGreenDay },
                uni: { value: countUni, time: timestampUni }
            });

            await fetch(GOOGLE_FORM_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
                mode: 'no-cors' // Google Forms requires no-cors mode
            });

            // Note: With no-cors, we can't read the response, but the submission still works
            console.log('Form submission completed');

        } catch (err) {
            console.error('Failed to submit to Google Form:', err);
        }
    }, []);

    const fetchHistoryData = useCallback(async () => {
        if (cacheCleared) {
            console.log('Cache cleared — skipping history fetch');
            return;
        }
        setHistoryLoading(true);
        try {
            const response = await fetch(`${CSV_URL}&time=${Date.now()}`, {
                cache: 'no-store'
            });
            const csvText = await response.text();
            
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const deduped = dedupeHistoryRows(results.data || []);
                    console.log('CSV fetched, parsed, and deduplicated');
                    persistHistorySnapshot(deduped);
                    setHistoryLoading(false);
                }
            });
        } catch (err) {
            console.error('Failed to fetch history data:', err);
            setHistoryLoading(false);
        }
    }, [persistHistorySnapshot, setHistoryLoading, cacheCleared]);

    // Check API timestamps against cached history and fetch CSV if needed
    const checkAndUpdateHistory = useCallback(async (apiResults) => {
        try {
            const apiGdEntry = parseApiEntry(apiResults[0]);
            const apiUniEntry = parseApiEntry(apiResults[1]);

            console.log('API timestamps:', {
                gd: apiGdEntry?.date?.toISOString(),
                uni: apiUniEntry?.date?.toISOString()
            });

            let snapshot = await readHistoryCacheSnapshot();

            if (snapshot.rows.length && historyData.length === 0) {
                setHistoryData(snapshot.rows);
                if (snapshot.timestamp) {
                    setLastHistoryUpdate(new Date(snapshot.timestamp));
                }
            }

            const gdFastSatisfied = !apiGdEntry?.date || (snapshot.last.gd?.date && apiGdEntry.date.getTime() <= snapshot.last.gd.date.getTime());
            const uniFastSatisfied = !apiUniEntry?.date || (snapshot.last.uni?.date && apiUniEntry.date.getTime() <= snapshot.last.uni.date.getTime());
            const hasCacheRows = snapshot.rows.length > 0;

            if (hasCacheRows && gdFastSatisfied && uniFastSatisfied) {
                console.log('Fast path hit — cache already covers API timestamps');
                return;
            }

            console.log('Slow path triggered — fetching CSV for reconciliation');
            await fetchHistoryData();
            snapshot = await readHistoryCacheSnapshot();

            if (snapshot.rows.length) {
                setHistoryData(snapshot.rows);
                if (snapshot.timestamp) {
                    setLastHistoryUpdate(new Date(snapshot.timestamp));
                }
            }

            const gdIsNew = apiGdEntry?.date
                ? (!snapshot.last.gd?.date || apiGdEntry.date.getTime() > snapshot.last.gd.date.getTime())
                : false;
            const uniIsNew = apiUniEntry?.date
                ? (!snapshot.last.uni?.date || apiUniEntry.date.getTime() > snapshot.last.uni.date.getTime())
                : false;

            if (!gdIsNew && !uniIsNew) {
                console.log('After reconciliation, no newer timestamps detected');
                return;
            }

            const payload = cloneApiResults(apiResults);
            while (payload.length < 2) {
                payload.push({});
            }

            if (snapshot.last.gd?.date) {
                const apiDate = apiGdEntry?.date;
                if (!apiDate || apiDate.getTime() < snapshot.last.gd.date.getTime()) {
                    payload[0] = {
                        ...payload[0],
                        Timestamp: snapshot.last.gd.raw,
                        CurrentFreeGroupCounterValue: snapshot.last.gd.value ?? payload[0].CurrentFreeGroupCounterValue ?? 0
                    };
                }
            }

            if (snapshot.last.uni?.date) {
                const apiDate = apiUniEntry?.date;
                if (!apiDate || apiDate.getTime() < snapshot.last.uni.date.getTime()) {
                    payload[1] = {
                        ...payload[1],
                        Timestamp: snapshot.last.uni.raw,
                        CurrentFreeGroupCounterValue: snapshot.last.uni.value ?? payload[1].CurrentFreeGroupCounterValue ?? 0
                    };
                }
            }

            await submitToGoogleForm(payload);

            const appendedRows = dedupeHistoryRows([
                ...snapshot.rows,
                buildCacheRowFromPayload(payload[0], payload[1])
            ]);
            persistHistorySnapshot(appendedRows);
        } catch (err) {
            console.error('Error checking history update:', err);
        }
    }, [fetchHistoryData, historyData.length, persistHistorySnapshot, submitToGoogleForm, setHistoryData, setLastHistoryUpdate]);

    // Fetch real-time API data
    const fetchRealtimeData = useCallback(async () => {
        if (cacheCleared) {
            console.log('Cache cleared — skipping realtime fetch');
            return;
        }

        if (fetchInProgressRef.current) {
            console.log('Fetch already in progress, skipping...');
            return;
        }

        fetchInProgressRef.current = true;
        setRealtimeLoading(true);
        setRealtimeError(null);

        try {
            // Try to load from cache first for instant display
            const cached = await storageWeb.getItem(CACHE_KEY_REALTIME);
            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    setRealtimeData(cachedData.data);
                    setLastRealtimeUpdate(new Date(cachedData.timestamp));
                    console.log('Real-time cache loaded');
                } catch (e) {
                    console.error('Failed to parse real-time cache:', e);
                }
            }

            // Fetch fresh data
            const results = await Promise.all(API_URLS.map(url =>
                fetch(`${CORS_PROXY}${encodeURIComponent(url + '?time=' + Date.now())}`)
                    .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
            ));

            setRealtimeData(results);
            const updateTime = new Date();
            setLastRealtimeUpdate(updateTime);

            // Cache the real-time data
            try {
                await storageWeb.setItem(CACHE_KEY_REALTIME, JSON.stringify({
                    data: results,
                    timestamp: updateTime.toISOString()
                }));
            } catch (e) {
                console.error('Failed to cache real-time data:', e);
            }

            // Check if we need to update history data
            await checkAndUpdateHistory(results);

        } catch (err) {
            console.error('Failed to fetch real-time data:', err);
            setRealtimeError(err.toString());
        } finally {
            setRealtimeLoading(false);
            fetchInProgressRef.current = false;
        }
    }, [setRealtimeData, setRealtimeLoading, setRealtimeError, setLastRealtimeUpdate, checkAndUpdateHistory, cacheCleared]);

    // Load history cache on mount
    useEffect(() => {
        const loadHistoryCache = async () => {
            const cached = await storageWeb.getItem(CACHE_KEY_HISTORY);
            if (cached) {
                try {
                    const parsedCache = JSON.parse(cached);
                    setHistoryData(parsedCache.data);
                    setLastHistoryUpdate(new Date(parsedCache.timestamp));
                    console.log('History cache loaded on mount');
                } catch (e) {
                    console.error('Failed to load history cache on mount:', e);
                }
            }
        };
        loadHistoryCache();
    }, [setHistoryData, setLastHistoryUpdate]);

    // Initial fetch and auto-refresh for real-time data
    useEffect(() => {
        if (cacheCleared) {
            console.log('Cache cleared — skipping initial realtime fetch and auto-refresh');
            return;
        }

        fetchRealtimeData();
        const refreshTimer = setInterval(fetchRealtimeData, 5 * 60 * 1000); // Auto refresh every 5 minutes

        // expose stop callback so clearCache can stop the interval
        try {
            setStopAutoRefresh(() => () => clearInterval(refreshTimer));
        } catch (e) {
            console.warn('Failed to register stopAutoRefresh', e);
        }

        return () => clearInterval(refreshTimer);
    }, [fetchRealtimeData, setStopAutoRefresh, cacheCleared]);

    // Manual refresh function (for refresh buttons)
    const refresh = useCallback(async () => {
        console.log('Manual refresh triggered');
        await fetchRealtimeData();
    }, [fetchRealtimeData]);

    // Register refresh callback in store
    useEffect(() => {
        setRefreshCallback(refresh);
    }, [refresh, setRefreshCallback]);

    // Compatibility layer: provide context value that mirrors store state
    const realtimeData = useParkingStore((state) => state.realtimeData);
    const realtimeLoading = useParkingStore((state) => state.realtimeLoading);
    const realtimeError = useParkingStore((state) => state.realtimeError);
    const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);
    const historyLoading = useParkingStore((state) => state.historyLoading);
    const lastHistoryUpdate = useParkingStore((state) => state.lastHistoryUpdate);

    const value = {
        // Real-time data (for Dashboard)
        realtimeData,
        realtimeLoading,
        realtimeError,
        lastRealtimeUpdate,

        // Historical data (for Statistics)
        historyData,
        historyLoading,
        lastHistoryUpdate,

        // Manual refresh
        refresh
    };

    return (
        <ParkingDataContext.Provider value={value}>
            {children}
        </ParkingDataContext.Provider>
    );
};

ParkingDataProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useParkingData = () => {
    const context = useContext(ParkingDataContext);
    if (!context) {
        throw new Error('useParkingData must be used within ParkingDataProvider');
    }
    return context;
};