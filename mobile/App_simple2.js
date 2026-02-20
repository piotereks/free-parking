import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  console.log('🚀 TEST APP RENDERING');
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 30, color: 'black' }}>TEST</Text>
    </View>
  );
}