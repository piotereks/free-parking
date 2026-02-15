import React from 'react';
import { View } from 'react-native';
import { allStyles } from '../App';
import { logStyleUsage } from '../utils/allStylesLogger';

// Log the styles used by LoadingSkeletonCard
['border','bg-card','bg-secondary'].forEach(k => {
  logStyleUsage('LoadingSkeletonCard', allStyles, k, k.startsWith('bg') ? 'bg-' : (k.startsWith('text') ? 'text-' : ''));
});



const LoadingSkeletonCard = () => {
  return (
    <View className={`p-3 border-b border-${allStyles['border']} bg-${allStyles['bg-card']}`}>
      <View className={`h-3 w-2/5 rounded bg-${allStyles['border']} mb-2`} />
      <View className={`h-2.5 w-4/5 rounded bg-${allStyles['bg-secondary']} mb-2`} />
      <View className={`h-2.5 w-11/20 rounded bg-${allStyles['border']} mb-2`} />
      <View className={`h-2.5 w-4/5 rounded bg-${allStyles['bg-secondary']}`} />
    </View>
  );
};

export default LoadingSkeletonCard;
