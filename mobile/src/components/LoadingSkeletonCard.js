import React from 'react';
import { View, StyleSheet } from 'react-native';

const LoadingSkeletonCard = () => (
  <View style={styles.container}>
    <View style={styles.lineShort} />
    <View style={styles.lineLong} />
    <View style={styles.lineMedium} />
    <View style={styles.lineLong} />
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' },
  lineShort: { height: 12, width: '40%', backgroundColor: '#eee', borderRadius: 4, marginBottom: 8 },
  lineMedium: { height: 10, width: '55%', backgroundColor: '#f2f2f2', borderRadius: 4, marginBottom: 8 },
  lineLong: { height: 10, width: '80%', backgroundColor: '#f6f6f6', borderRadius: 4, marginBottom: 0 },
});

export default LoadingSkeletonCard;
