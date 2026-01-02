import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ParkingDataProvider from './context/ParkingDataProvider';
import DashboardScreen from './screens/DashboardScreen';

const AppContent = () => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <DashboardScreen />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ParkingDataProvider>
        <AppContent />
      </ParkingDataProvider>
    </ThemeProvider>
  );
}
