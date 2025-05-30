import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

export default function Settings() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <Link href="/police-officer/settings/app-permissions" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Feather name="settings" size={24} color="#000000" />
            <Text style={styles.menuItemText}>App Permissions</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#000000" />
        </TouchableOpacity>
      </Link>

      <Link href="/police-officer/settings/privacy-policy" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Feather name="shield" size={24} color="#000000" />
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#000000" />
        </TouchableOpacity>
      </Link>

      <Link href="/police-officer/settings/about" asChild>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <Feather name="info" size={24} color="#000000" />
            <Text style={styles.menuItemText}>About</Text>
          </View>
          <Feather name="chevron-right" size={24} color="#000000" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    fontFamily: 'Poppins-Bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 67, 72, 0.09)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#111619',
    fontFamily: 'Poppins-Regular',
  },
}); 