import React from 'react';
import { Text, View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styled } from 'nativewind';

import { buildColorMaps } from './utils/colorMaps';
export const APP_THEME = 'dark'; // 'light', 'dark', or 'auto' (system)
	
const SView = styled(View);
const SText = styled(Text);

const AppContent = () => {


const { allStyles, colorScheme }  = buildColorMaps(APP_THEME);
  const containerClass = allStyles['bg-container'] || '';
  const textClass = allStyles['text-example'] || '';

  console.log('APP_THEME:', APP_THEME);

  
  console.log('allStyles keys sample:', Object.keys(allStyles).slice(0, 10));
  console.log('containerClass:', containerClass);
  console.log('textClass:', textClass);

  

   

  return (
    // <SView className={`flex-1 items-center justify-center bg-bg-container-light}`}>
    //   <SText className={`text-xl text-text-example-light`}>Color scheme: {colorScheme}</SText>
    //   <StatusBar />
    // </SView>

    // <SView className={`flex-1 items-center justify-center bg-bg-container-dark}`}>
    //   <SText className={`text-xl text-text-example-dark	`}>Color scheme: {colorScheme}</SText>
    //   <StatusBar />
    // </SView>

    <SView className={`flex-1 items-center justify-center bg-${allStyles['bg-container']}`}>
      <SText className={`text-xl text-${allStyles['text-example']}`}>Color scheme: {colorScheme}</SText>
      <StatusBar />
    </SView>
  );
};

export default function App() {
  return <AppContent />;
}
