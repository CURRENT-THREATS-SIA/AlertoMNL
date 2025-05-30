import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';

interface SettingsMenuItem {
  title: string;
  icon: string;
  route?: string;
  onPress?: () => void;
}

const Settings: React.FC = () => {
  const router = useRouter();

  const settingsMenuItems: SettingsMenuItem[] = [
    {
      title: "Preferences",
      icon: "settings",
      route: "/police-officer/settings/preferences/",
    },
    {
      title: "App Permissions",
      icon: "security",
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

  const handleLogout = () => {
    console.log("Logout pressed");
    // Add your logout logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          {/* Settings Menu */}
          <View style={styles.menuCard}>
            {settingsMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== settingsMenuItems.length - 1 && styles.menuItemBorder
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#000712" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
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
    backgroundColor: '#f4f4f4',
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
    color: '#212121',
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: '#fff',
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
});

export default Settings; 