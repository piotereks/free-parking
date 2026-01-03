import React from 'react';
import { View } from 'react-native';

const LoadingSkeletonCard = () => {
  return (
    <View className="p-3 border-b border-border-light dark:border-border-dark bg-bg-card-light dark:bg-bg-card-dark">
      <View className="h-3 w-2/5 rounded bg-border-light dark:bg-border-dark mb-2" />
      <View className="h-2.5 w-4/5 rounded bg-bg-secondary-light dark:bg-bg-secondary-dark mb-2" />
      <View className="h-2.5 w-11/20 rounded bg-border-light dark:bg-border-dark mb-2" />
      <View className="h-2.5 w-4/5 rounded bg-bg-secondary-light dark:bg-bg-secondary-dark" />
    </View>
  );
};

export default LoadingSkeletonCard;
