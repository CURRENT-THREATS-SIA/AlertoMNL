import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { theme, useTheme } from '../../../context/ThemeContext';

export default function Settings() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[
        styles.header, 
        { 
          backgroundColor: currentTheme.surface,
          paddingTop: insets.top + 12,
          borderBottomColor: currentTheme.cardBorder
        }
      ]}>
        <Text style={[styles.headerTitle, { color: currentTheme.headerText }]}>Settings</Text>
      </View>

      <View style={styles.menuContainer}>
        <Link href="/police-officer/settings/app-permissions" asChild>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.surface }]}>
            <View style={styles.menuItemContent}>
              <View style={[styles.iconContainer, { backgroundColor: currentTheme.iconBackground }]}>
                <Feather name="settings" size={24} color={currentTheme.iconColor} />
              </View>
              <Text style={[styles.menuItemText, { color: currentTheme.text }]}>App Permissions</Text>
            </View>
            <Feather name="chevron-right" size={24} color={currentTheme.iconColor} />
          </TouchableOpacity>
        </Link>

        <Link href="/police-officer/settings/privacy-policy" asChild>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.surface }]}>
            <View style={styles.menuItemContent}>
              <View style={[styles.iconContainer, { backgroundColor: currentTheme.iconBackground }]}>
                <Feather name="shield" size={24} color={currentTheme.iconColor} />
              </View>
              <Text style={[styles.menuItemText, { color: currentTheme.text }]}>Privacy Policy</Text>
            </View>
            <Feather name="chevron-right" size={24} color={currentTheme.iconColor} />
          </TouchableOpacity>
        </Link>

        <Link href="/police-officer/settings/about" asChild>
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.surface }]}>
            <View style={styles.menuItemContent}>
              <View style={[styles.iconContainer, { backgroundColor: currentTheme.iconBackground }]}>
                <Feather name="info" size={24} color={currentTheme.iconColor} />
              </View>
              <Text style={[styles.menuItemText, { color: currentTheme.text }]}>About</Text>
            </View>
            <Feather name="chevron-right" size={24} color={currentTheme.iconColor} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  menuContainer: {
    padding: 16,
    gap: 12,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
}); 