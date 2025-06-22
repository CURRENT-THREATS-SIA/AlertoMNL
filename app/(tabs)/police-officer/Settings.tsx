import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';

interface SettingsMenuItem {
  title: string;
  icon: string;
  route?: string;
  onPress?: () => void;
}

const Settings: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const settingsMenuItems: SettingsMenuItem[] = [
    {
      title: "Preferences",
      icon: "tune",
      route: "/police-officer/settings/preferences/",
    },
    {
      title: "App Permissions",
      icon: "phonelink-lock",
      route: "/police-officer/settings/app-permissions",
    },
    {
      title: "Privacy Policy",
      icon: "privacy-tip",
      route: "/police-officer/settings/privacy-policy",
    },
    {
      title: "About",
      icon: "info",
      route: "/police-officer/settings/about",
    },
  ];

  const handleMenuPress = (item: SettingsMenuItem) => {
    if (item.route) {
      router.push(item.route);
    } else if (item.onPress) {
      item.onPress();
    }
  };

  const handleLogout = async () => {
    // Remove all user-related keys
    await AsyncStorage.removeItem('police_id');
    await AsyncStorage.removeItem('nuser_id');
    await AsyncStorage.removeItem('firstName');
    await AsyncStorage.removeItem('lastName');
    await AsyncStorage.removeItem('email');
    await AsyncStorage.removeItem('phone');
    await AsyncStorage.removeItem('badge');
    await AsyncStorage.removeItem('station');
    // Optionally, clear all AsyncStorage (be careful if you store other data)
    // await AsyncStorage.clear();

    router.replace('/auth/Login'); // Navigate to login

    // Show alert after navigation (optional)
    Alert.alert(
      "Logout Successful",
      "You have been logged out.",
      [{ text: "OK" }],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <Text style={[styles.title, { color: currentTheme.text }]}>Settings</Text>

          {/* Settings Menu */}
          <View style={[styles.menuCard, { backgroundColor: currentTheme.surface }]}>
            {settingsMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== settingsMenuItems.length - 1 && [styles.menuItemBorder, { borderBottomColor: currentTheme.cardBorder }]
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <MaterialIcons name={item.icon as any} size={24} color="#FF0000" style={styles.menuIcon} />
                    <Text style={[styles.menuItemText, { color: currentTheme.text }]}>{item.title}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#FF0000" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: "#FF0000" }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: "#FF0000" }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NavBottomBar activeScreen="Settings" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    marginBottom: 16,
  },
  menuCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
  },
});

export default Settings; 