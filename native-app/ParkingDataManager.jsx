import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useParkingStore } from './store/parkingStore';

const ParkingDataContext = createContext();

const API_URLS = [
    'https://gd.zaparkuj.pl/api/freegroupcountervalue.json',
    'https://gd.zaparkuj.pl/api/freegroupcountervalue-green.json'
];
const CORS_PROXY = 'https://corsproxy.io/?';

export const ParkingDataProvider = ({ children }) => {
    const updateRealtimeState = useParkingStore((state) => state.updateRealtimeState);
    const intervalRef = useRef(null);

    const fetchRealtimeData = async () => {
        try {
            updateRealtimeState({ realtimeLoading: true, realtimeError: null });

            const promises = API_URLS.map(url =>
                fetch(CORS_PROXY + encodeURIComponent(url))
                    .then(res => res.json())
                    .catch(() => null)
            );

            const results = await Promise.all(promises);
            const validResults = results.filter(r => r && r.ParkingGroupName);

            updateRealtimeState({
                realtimeData: validResults,
                realtimeLoading: false,
                realtimeError: validResults.length === 0 ? 'No data available' : null,
                lastRealtimeUpdate: new Date()
            });
        } catch (error) {
            updateRealtimeState({
                realtimeLoading: false,
                realtimeError: error.message || 'Failed to fetch data'
            });
        }
    };

    useEffect(() => {
        fetchRealtimeData();
        intervalRef.current = setInterval(fetchRealtimeData, 60000); // Refresh every minute

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <ParkingDataContext.Provider value={{ refresh: fetchRealtimeData }}>
            {children}
        </ParkingDataContext.Provider>
    );
};

export const useParkingData = () => useContext(ParkingDataContext);
