import React from 'react';
import { View } from 'react-native';

import App from './src/App';

/**
 * Root Component
 * App entry point. The banner is rendered inside src/App.js (DashboardContent)
 * so it shares the themed SafeAreaView background.
 */
export default function Root() {
  return (
    <View style={{ flex: 1 }}>
      <App />
    </View>
  );
}