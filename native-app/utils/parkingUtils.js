// Utility functions for parking data

export const calculateDataAge = (timestamp, now) => {
    if (!timestamp) return Infinity;
    const ts = new Date(timestamp.replace(' ', 'T'));
    if (isNaN(ts.getTime())) return Infinity;
    return Math.max(0, Math.floor((now - ts) / 1000 / 60));
};

export const applyApproximations = (realtimeData, now) => {
    return realtimeData.map(d => ({ ...d, approximationInfo: { isApproximated: false } }));
};

export const formatAgeLabel = (age) => {
    if (age < 1) return { display: 'now', aria: 'Just now' };
    if (age < 60) return { display: `${age}m ago`, aria: `${age} minutes ago` };
    if (age < 1440) {
        const hours = Math.floor(age / 60);
        return { display: `${hours}h ago`, aria: `${hours} hours ago` };
    }
    const days = Math.floor(age / 1440);
    return { display: `${days}d ago`, aria: `${days} days ago` };
};
