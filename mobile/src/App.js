import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ParkingDataProvider from './context/ParkingDataProvider';
import DashboardScreen from './screens/DashboardScreen';

const AppContent = () => {
  const { colorScheme, isDark } = useTheme();

  return (
    <View className={colorScheme} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-bg-primary-light dark:bg-bg-primary-dark">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <DashboardScreen />
      </SafeAreaView>
    </View>
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
