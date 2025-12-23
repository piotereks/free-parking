import React, { useState, useEffect } from 'react';
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

  return (
    <div className="parking-card">
      <div className="parking-name">{name}</div>
      <div className={`free-spots ${ageClass}`}>
        {data.CurrentFreeGroupCounterValue || 0}
      </div>
      <div className="age-indicator-small">{age} min ago</div>
      <div className="timestamp-small">@{ts.toLocaleTimeString('pl-PL')}</div>
    </div>
  );
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
      <main className="container-main">
        <div className="subtitle">Real-time parking availability • UBS Wrocław</div>

        {realtimeError && <div className="error"><strong>ERROR:</strong> {realtimeError}</div>}

        <div className="grid-container">
          {realtimeLoading && realtimeData.length === 0 ? (
            <div className="loader">Loading parking data...</div>
          ) : (
            realtimeData.map((d, i) => <ParkingCard key={i} data={d} now={now} />)
          )}
        </div>

        <div className="status-panel">
          <div className="panel-section">
            <div className="status-label">Total Spaces</div>
            <div className={`status-value big-value ${totalColorClass}`}>{realtimeLoading ? '---' : totalSpaces}</div>
            <div className="status-description">{statusMessage}</div>
          </div>
          <div className="panel-section">
            <div className="status-label">Data Status</div>
            <div className="status-value" style={{ color: realtimeError ? 'var(--warning)' : 'var(--success)' }}>
              {realtimeLoading ? 'LOADING' : (realtimeError ? 'OFFLINE' : 'ONLINE')}
            </div>
          </div>
          <div className="panel-section">
            <div className="status-label">Last Update / Current Time</div>
            <div className="time-group">
              <span>{lastRealtimeUpdate ? lastRealtimeUpdate.toLocaleTimeString('pl-PL') : '--:--:--'}</span>
              <span className="status-current-inline">{now.toLocaleTimeString('pl-PL')}</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
