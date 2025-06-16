import { FeatureCollection, Point } from 'geojson';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface WebCrimeMapProps {
  data: FeatureCollection<Point>;
  userType: 'regular' | 'police' | 'guest';
}

export function WebCrimeMap({ data, userType }: WebCrimeMapProps) {
  return (
    <View style={styles.container}>
      {/* Web-specific map implementation will go here */}
      {/* For now, just a placeholder */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 