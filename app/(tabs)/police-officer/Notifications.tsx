import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Header from '../../../components/Header';
import { fonts } from '../../config/fonts';

const Notifications: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header showNotification={false} />
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Stay updated with alerts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: '#E02323',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    color: '#666',
  },
});

export default Notifications; 