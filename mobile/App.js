import React from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styled } from 'nativewind';
import { buildColorMaps } from './src/context/ThemeContext';

const SView = styled(View);
const SText = styled(Text);

const AppContent = () => {

  const colorScheme = useColorScheme();
  const { lightStyles, darkStyles } = buildColorMaps();
  const allStyles = colorScheme === 'dark' ? darkStyles : lightStyles;
  const containerClass = allStyles['bg-container'];
  const textClass = allStyles['text-example'];

  console.log('lightStyles:', lightStyles);
  console.log('darkStyles:', darkStyles);
  console.log('colorScheme:', colorScheme);
  console.log('allStyles:', allStyles);
  console.log('containerClass:', containerClass);
  console.log('textClass:', textClass);
  

   

  return (


    <SView className={`flex-1 items-center justify-center bg-${allStyles['bg-container']}`}>
      <SText className={`text-xl text-${allStyles['text-example']}`}>Color scheme: {colorScheme}</SText>
      <StatusBar />
    </SView>
  );
};

export default function App() {
  return <AppContent />;
}
