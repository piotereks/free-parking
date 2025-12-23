import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import { useParkingStore, refreshParkingData } from './store/parkingStore';

const ParkingCard = ({ data, now }) => {
  const ts = new Date(data.Timestamp.replace(' ', 'T'));
  const age = Math.max(0, Math.floor((now - ts) / 1000 / 60));

  let ageClass = '';
  if (age >= 15) ageClass = 'age-old';
  else if (age > 5) ageClass = 'age-medium';

  let name = data.ParkingGroupName;
  if (name === 'Bank_1') name = 'Uni Wroc';

  const freeSpots = data.CurrentFreeGroupCounterValue || 0;

  return (
    <div
      className="parking-card"
      role="article"
      aria-label={`${name} parking information`}
    >
      <div className="parking-name">{name}</div>
      <div
        className={`free-spots ${ageClass}`}
        aria-label={`${freeSpots} free parking spaces`}
      >
        {freeSpots}
      </div>
      <div className="age-indicator-small" aria-label={`Data from ${age} minutes ago`}>
        {age} min ago
      </div>
      <div className="timestamp-small" aria-label={`Timestamp at ${ts.toLocaleTimeString('pl-PL')}`}>
        @{ts.toLocaleTimeString('pl-PL')}
      </div>
    </div>
  );
};

ParkingCard.propTypes = {
  data: PropTypes.shape({
    ParkingGroupName: PropTypes.string.isRequired,
    CurrentFreeGroupCounterValue: PropTypes.number,
    Timestamp: PropTypes.string.isRequired
  }).isRequired,
  now: PropTypes.instanceOf(Date).isRequired
};

const Dashboard = ({ setView }) => {
  const realtimeData = useParkingStore((state) => state.realtimeData);
  const realtimeLoading = useParkingStore((state) => state.realtimeLoading);
  const realtimeError = useParkingStore((state) => state.realtimeError);
  const lastRealtimeUpdate = useParkingStore((state) => state.lastRealtimeUpdate);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSpaces = realtimeData.reduce((sum, d) => sum + (d.CurrentFreeGroupCounterValue || 0), 0);
  const updateStatus = lastRealtimeUpdate ? `Last update: ${lastRealtimeUpdate.toLocaleTimeString('pl-PL')}` : 'Loading...';

  // Calculate worst-case color for aggregated total based on data freshness
  const getAggregatedStatus = () => {
    if (realtimeData.length === 0) {
      return { colorClass: '', statusMessage: 'No data available' };
    }

    let maxAge = 0;
    realtimeData.forEach((d) => {
      const ts = new Date(d.Timestamp.replace(' ', 'T'));
      const age = Math.max(0, Math.floor((now - ts) / 1000 / 60));
      maxAge = Math.max(maxAge, age);
    });

    // Apply worst-case logic: green (< 5 min) → orange (5-15 min) → red (>= 15 min)
    if (maxAge >= 15) {
      return {
        colorClass: 'age-old',
        statusMessage: 'Data outdated - figures may not reflect actual free spaces'
      };
    } else if (maxAge > 5) {
      return {
        colorClass: 'age-medium',
        statusMessage: 'Data slightly outdated - refresh recommended'
      };
    } else {
      return {
        colorClass: '',
        statusMessage: 'Data is current and reliable'
      };
    }
  };

  const { colorClass: totalColorClass, statusMessage } = getAggregatedStatus();

  return (
    <>
      <Header
        title="Parking Monitor"
        icon="🅿️"
        onRefresh={refreshParkingData}
        updateStatus={updateStatus}
        currentView="dashboard"
        setView={setView}
      />

      <main className="container-main" role="main" aria-label="Parking dashboard">
        <div className="subtitle">Real-time parking availability • UBS Wrocław</div>

        {realtimeError && (
          <div className="error" role="alert" aria-live="polite">
            <strong>ERROR:</strong> {realtimeError}
          </div>
        )}

        <div className="grid-container" role="list" aria-label="Parking facilities">
          {realtimeLoading && realtimeData.length === 0 ? (
            <div className="loader" role="status" aria-live="polite">Loading parking data...</div>
          ) : (
            realtimeData.map((d, i) => <ParkingCard key={i} data={d} now={now} />)
          )}
        </div>
        <div className={`status-description ${totalColorClass}`} aria-label="Status description">{statusMessage}</div>
        <div className="status-panel" role="complementary" aria-label="Status information">
          <div className="panel-section">
            <div className="status-label">Total Spaces</div>
            <div className={`status-value big-value ${totalColorClass}`} aria-label={`Total free spaces: ${realtimeLoading ? 'loading' : totalSpaces}`}>
              {realtimeLoading ? '---' : totalSpaces}
            </div>
          </div>
          <div className="panel-section">
            <div className="status-label">Last Update / Current Time</div>
            <div className="time-group">
              <span aria-label={`Last updated at ${lastRealtimeUpdate ? lastRealtimeUpdate.toLocaleTimeString('pl-PL') : 'unknown'}`}>
                {lastRealtimeUpdate ? lastRealtimeUpdate.toLocaleTimeString('pl-PL') : '--:--:--'}
              </span>
              <span className="status-current-inline" aria-label={`Current time ${now.toLocaleTimeString('pl-PL')}`}>
                {now.toLocaleTimeString('pl-PL')}
              </span>
            </div>
          </div>
          <div className="panel-section">
            <div className="status-label">Data Status</div>
            <div
              className="status-value"
              style={{ color: realtimeError ? 'var(--warning)' : 'var(--success)' }}
              role="status"
              aria-live="polite"
            >
              {realtimeLoading ? 'LOADING' : (realtimeError ? 'OFFLINE' : 'ONLINE')}
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

Dashboard.propTypes = {
  setView: PropTypes.func.isRequired
};

export default Dashboard;
