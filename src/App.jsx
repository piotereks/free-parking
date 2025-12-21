import React, { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import { ParkingDataProvider } from './ParkingDataManager';
import Dashboard from './Dashboard';
import Statistics from './Statistics';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'stats'

  return (
    <ThemeProvider>
      <ParkingDataProvider>
        {view === 'dashboard' ? (
          <Dashboard setView={setView} />
        ) : (
          <Statistics setView={setView} />
        )}
      </ParkingDataProvider>
    </ThemeProvider>
  );
}

export default App;
