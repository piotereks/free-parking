import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';

const ParkingDataContext = createContext();

const API_URLS = [
    'https://gd.zaparkuj.pl/api/freegroupcountervalue.json',
    'https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json'
];
const CORS_PROXY = 'https://corsproxy.io/?';
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTwLNDbg8KjlVHsZWj9JUnO_OBIyZaRgZ4gZ8_Gbyly2J3f6rlCW6lDHAihwbuLhxWbBkNMI1wdWRAq/pub?gid=411529798&single=true&output=csv';

// Google Form configuration
// To find the entry IDs:
// 1. Open your Google Form in edit mode
// 2. Right-click on each field and select "Inspect" or "Inspect Element"
// 3. Look for the input element with name="entry.XXXXXXXXXX"
// 4. Copy those entry IDs and replace the values below
//
// Example: If you see <input name="entry.1234567890" ...>, use 'entry.1234567890'
//
// The form should have 4 fields in this order:
// 1. GreenDay Free Spaces (number)
// 2. GreenDay Timestamp (text/datetime)
// 3. Uni Free Spaces (number)
// 4. Uni Timestamp (text/datetime)
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdeQ-rmw_VfOidGmtSNb9DLkt1RfPdduu-jH898sf3lhj17LA/formResponse';
const FORM_ENTRIES = {
    GREENDAY_VALUE: 'entry.2026993163', // TODO: Replace with actual entry ID for GreenDay free spaces
    GREENDAY_TIME: 'entry.51469670',  // TODO: Replace with actual entry ID for GreenDay timestamp
    UNI_VALUE: 'entry.1412144904',      // TODO: Replace with actual entry ID for Uni free spaces
    UNI_TIME: 'entry.364658642'        // TODO: Replace with actual entry ID for Uni timestamp


};

const CACHE_KEY_REALTIME = 'parking_realtime_cache';
const CACHE_KEY_HISTORY = 'parking_history_cache';

export const ParkingDataProvider = ({ children }) => {
    // Real-time data from APIs
    const [realtimeData, setRealtimeData] = useState([]);
    const [realtimeLoading, setRealtimeLoading] = useState(true);
    const [realtimeError, setRealtimeError] = useState(null);
    const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState(null);

    // Historical data from CSV
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [lastHistoryUpdate, setLastHistoryUpdate] = useState(null);

    const fetchInProgressRef = useRef(false);

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

            const response = await fetch(GOOGLE_FORM_URL, {
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

    // Get last timestamps from cached history data
    const getLastTimestamps = useCallback((cachedData) => {
        if (!cachedData || cachedData.length === 0) return { gd: null, uni: null };

        const findKey = (row, name) => Object.keys(row).find(k => k.trim().toLowerCase() === name);
        
        let lastGdTime = null;
        let lastUniTime = null;

        for (let i = cachedData.length - 1; i >= 0; i--) {
            const row = cachedData[i];
            
            if (!lastGdTime) {
                const gdTimeKey = findKey(row, 'gd_time');
                if (gdTimeKey && row[gdTimeKey]) {
                    const ts = new Date(row[gdTimeKey].trim());
                    if (!isNaN(ts.getTime())) {
                        lastGdTime = ts;
                    }
                }
            }
            
            if (!lastUniTime) {
                const uniTimeKey = findKey(row, 'uni_time');
                if (uniTimeKey && row[uniTimeKey]) {
                    const ts = new Date(row[uniTimeKey].trim());
                    if (!isNaN(ts.getTime())) {
                        lastUniTime = ts;
                    }
                }
            }

            if (lastGdTime && lastUniTime) break;
        }

        return { gd: lastGdTime, uni: lastUniTime };
    }, []);

    // Fetch real-time API data
    const fetchRealtimeData = useCallback(async () => {
        if (fetchInProgressRef.current) {
            console.log('Fetch already in progress, skipping...');
            return;
        }

        fetchInProgressRef.current = true;
        setRealtimeLoading(true);
        setRealtimeError(null);

        try {
            // Try to load from cache first for instant display
            const cached = localStorage.getItem(CACHE_KEY_REALTIME);
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
                localStorage.setItem(CACHE_KEY_REALTIME, JSON.stringify({
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
    }, []);

    // Check API timestamps against cached history and fetch CSV if needed
    const checkAndUpdateHistory = useCallback(async (apiResults) => {
        try {
            // Get API timestamps
            const gdTimestamp = apiResults[0]?.Timestamp ? new Date(apiResults[0].Timestamp.replace(' ', 'T')) : null;
            const uniTimestamp = apiResults[1]?.Timestamp ? new Date(apiResults[1].Timestamp.replace(' ', 'T')) : null;

            console.log('API timestamps:', {
                gd: gdTimestamp?.toISOString(),
                uni: uniTimestamp?.toISOString()
            });

            // Load cached history
            const cached = localStorage.getItem(CACHE_KEY_HISTORY);
            let cachedData = null;
            let cachedTimestamps = { gd: null, uni: null };

            if (cached) {
                try {
                    const parsedCache = JSON.parse(cached);
                    cachedData = parsedCache.data;
                    cachedTimestamps = getLastTimestamps(cachedData);
                    console.log('History cache timestamps:', {
                        gd: cachedTimestamps.gd?.toISOString(),
                        uni: cachedTimestamps.uni?.toISOString()
                    });

                    // Set cached data immediately if not already set
                    if (historyData.length === 0) {
                        setHistoryData(cachedData);
                        setLastHistoryUpdate(new Date(parsedCache.timestamp));
                    }
                } catch (e) {
                    console.error('Failed to parse history cache:', e);
                }
            }

            // Check if we need to fetch CSV
            const gdNewer = gdTimestamp && cachedTimestamps.gd && 
                            gdTimestamp.getTime() > cachedTimestamps.gd.getTime();
            const uniNewer = uniTimestamp && cachedTimestamps.uni && 
                             uniTimestamp.getTime() > cachedTimestamps.uni.getTime();
            
            const noCache = !cachedTimestamps.gd && !cachedTimestamps.uni;

            if (noCache || gdNewer || uniNewer) {
                console.log('New data detected:', {
                    noCache,
                    gdNewer,
                    uniNewer
                });

                // Submit new data to Google Form
                await submitToGoogleForm(apiResults);

                // Then fetch updated CSV
                console.log('Fetching CSV...');
                await fetchHistoryData();
            } else {
                console.log('History cache is up to date');
            }
        } catch (err) {
            console.error('Error checking history update:', err);
        }
    }, [historyData.length, getLastTimestamps, submitToGoogleForm]);

    // Fetch CSV history data
    const fetchHistoryData = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const response = await fetch(`${CSV_URL}&time=${Date.now()}`);
            const csvText = await response.text();
            
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const newData = results.data;
                    console.log('CSV fetched and parsed');
                    setHistoryData(newData);
                    const updateTime = new Date();
                    setLastHistoryUpdate(updateTime);
                    
                    // Update cache
                    try {
                        localStorage.setItem(CACHE_KEY_HISTORY, JSON.stringify({
                            data: newData,
                            timestamp: updateTime.toISOString()
                        }));
                        console.log('History cache updated');
                    } catch (e) {
                        console.error('Failed to cache history data:', e);
                    }
                    setHistoryLoading(false);
                }
            });
        } catch (err) {
            console.error('Failed to fetch history data:', err);
            setHistoryLoading(false);
        }
    }, []);

    // Load history cache on mount
    useEffect(() => {
        const cached = localStorage.getItem(CACHE_KEY_HISTORY);
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
    }, []);

    // Initial fetch and auto-refresh for real-time data
    useEffect(() => {
        fetchRealtimeData();
        const refreshTimer = setInterval(fetchRealtimeData, 5 * 60 * 1000); // Auto refresh every 5 minutes
        return () => clearInterval(refreshTimer);
    }, [fetchRealtimeData]);

    // Manual refresh function (for refresh buttons)
    const refresh = useCallback(async () => {
        console.log('Manual refresh triggered');
        await fetchRealtimeData();
    }, [fetchRealtimeData]);

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

export const useParkingData = () => {
    const context = useContext(ParkingDataContext);
    if (!context) {
        throw new Error('useParkingData must be used within ParkingDataProvider');
    }
    return context;
};