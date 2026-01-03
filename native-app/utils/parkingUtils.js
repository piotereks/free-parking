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
    if (!Number.isFinite(age)) {
        return { display: '--', aria: 'Data age unavailable' };
    }

    const minutes = Math.max(0, Math.round(age));

    if (minutes < 60) {
        const label = `${minutes} min ago`;
        const aria = `Data from ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        return { display: label, aria };
    }

    if (minutes < 1440) {
        const hours = Math.round(minutes / 60);
        const label = `${hours} h ago`;
        const aria = `Data from ${hours} hour${hours === 1 ? '' : 's'} ago`;
        return { display: label, aria };
    }

    const daysRaw = minutes / 1440;
    const daysRounded = Math.round(daysRaw * 2) / 2;
    const isWholeDay = Number.isInteger(daysRounded);
    const dayValue = isWholeDay ? daysRounded.toString() : daysRounded.toFixed(1);
    const label = `${dayValue} d ago`;
    const aria = `Data from ${dayValue} day${dayValue === '1' ? '' : 's'} ago`;
    return { display: label, aria };
};
