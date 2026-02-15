import React from 'react';
import { View } from 'react-native';

/**
 * LoadingSkeletonCard Component
 * Displays a loading placeholder for parking cards
 */
const LoadingSkeletonCard = () => {
  return (
    <View className="p-3 border-b border-border dark:border-border-dark bg-card dark:bg-card-dark">
      <View className="h-3 w-2/5 rounded bg-border dark:bg-border-dark mb-2" />
      <View className="h-2.5 w-4/5 rounded bg-secondary dark:bg-secondary-dark mb-2" />
      <View className="h-2.5 w-11/20 rounded bg-border dark:bg-border-dark mb-2" />
      <View className="h-2.5 w-4/5 rounded bg-secondary dark:bg-secondary-dark" />
    </View>
  );
};

export default LoadingSkeletonCard;
