import { useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ThemeProvider } from './ThemeContext';
import { ParkingDataProvider } from './ParkingDataManager';
import Dashboard from './Dashboard';
import Statistics from './Statistics';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'stats'

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ParkingDataProvider>
          {view === 'dashboard' ? (
            <Dashboard setView={setView} />
          ) : (
            <Statistics setView={setView} />
          )}
        </ParkingDataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
