import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const LoadingSkeletonCard = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={[styles.lineShort, { backgroundColor: colors.borderLight }]} />
      <View style={[styles.lineLong, { backgroundColor: colors.surface }]} />
      <View style={[styles.lineMedium, { backgroundColor: colors.borderLight }]} />
      <View style={[styles.lineLong, { backgroundColor: colors.surface }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  lineShort: { height: 12, width: '40%', borderRadius: 4, marginBottom: 8 },
  lineMedium: { height: 10, width: '55%', borderRadius: 4, marginBottom: 8 },
  lineLong: { height: 10, width: '80%', borderRadius: 4, marginBottom: 0 },
});

export default LoadingSkeletonCard;
