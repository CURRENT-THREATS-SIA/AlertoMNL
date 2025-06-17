import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../config/fonts';
import { useTheme } from '../../context/ThemeContext';

interface SettingsMenuItem {
  title: string;
  icon: string;
  route?: string;
  onPress?: () => void;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const settingsMenuItems: SettingsMenuItem[] = [
    { title: "Account Details", icon: "settings", route: "/regular-user/profile/accountDetails/" },
    { title: "SetUpSOS", icon: "security", route: "/regular-user/profile/setUpSOS" },
    { title: "Settings", icon: "security", route: "/regular-user/profile/settings" },
    { title: "Voice Records", icon: "security", route: "/regular-user/profile/voiceRecords" },
    { title: "App Permissions", icon: "security", route: "/regular-user/profile/appPermission" },
    { title: "Privacy Policy", icon: "privacy-tip", route: "/regular-user/profile/privacyPolicy" },
    { title: "About", icon: "info", route: "/regular-user/profile/about" },
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 12,
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
        borderBottomWidth: 1
      }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile Settings</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.menuCard, { backgroundColor: theme.cardBackground }]}>
            {settingsMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem, 
                  index !== settingsMenuItems.length - 1 && styles.menuItemBorder,
                  { borderBottomColor: theme.border }
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <Text style={[styles.menuItemText, { color: theme.text }]}>{item.title}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={theme.text} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
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
  menuItemText: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    color: '#000',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FF0000',
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
    color: '#FF0000',
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
});

export default Profile;
