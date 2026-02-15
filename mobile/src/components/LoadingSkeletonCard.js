import React from 'react';
import { View } from 'react-native';

const LoadingSkeletonCard = () => {
  return (
    <View className="p-3 border-b border-border bg-bg-card">
      <View className="h-3 w-2/5 rounded bg-border mb-2" />
      <View className="h-2.5 w-4/5 rounded bg-bg-secondary mb-2" />
      <View className="h-2.5 w-11/20 rounded bg-border mb-2" />
      <View className="h-2.5 w-4/5 rounded bg-bg-secondary" />
    </View>
  );
};

export default LoadingSkeletonCard;
