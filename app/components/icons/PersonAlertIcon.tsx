import { AlertCircle, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PersonAlertIconProps {
  size?: number;
  color?: string;
}

export default function PersonAlertIcon({ size = 24, color = '#e33c3c' }: PersonAlertIconProps) {
  return (
    <View style={styles.container}>
      <User size={size} color={color} />
      <View style={styles.alert}>
        <AlertCircle size={size * 0.5} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  alert: {
    position: 'absolute',
    right: -4,
    top: -4,
  },
}); 