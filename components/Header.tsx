import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme, useTheme } from '../app/context/ThemeContext';

interface HeaderProps {
  showNotification?: boolean;
}

export default function Header({ showNotification = true }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={[styles.header, { 
      paddingTop: insets.top + 12,
      backgroundColor: '#FFFFFF'
    }]}>
      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/ALERTOMNL-ICON.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color:'#e02323' }]}>ALERTO MNL</Text>
          <Text style={[styles.subtitle, { color: currentTheme.subtitle }]}>Response System</Text>
        </View>
      </View>

      {/* Notification Icon */}
      {showNotification && (
        <TouchableOpacity 
          onPress={() => router.push("/police-officer/Notifications")}
          style={styles.notificationContainer}
        >
          <MaterialIcons name="notifications" size={24} color={currentTheme.iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#e02323',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: -4,
  },
  notificationContainer: {
    padding: 8,
  },
});
