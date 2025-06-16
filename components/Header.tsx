import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BellIcon = () => <MaterialIcons name="notifications" size={24} color="#E02323" />;

interface HeaderProps {
  showNotification?: boolean;
}

export default function Header({ showNotification = true }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 👈 add this

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/ALERTOMNL-ICON.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ALERTO MNL</Text>
          <Text style={styles.subtitle}>Response System</Text>
        </View>
      </View>

      {/* Notification Icon */}
      {showNotification && (
        <TouchableOpacity 
          onPress={() => router.push("/police-officer/Notifications")}
          style={styles.notificationContainer}
        >
          <BellIcon />
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
    backgroundColor: "#fff",
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
    fontWeight: 'bold',
    color: '#e02323',
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#424b5a',
    fontFamily: 'Poppins-Regular',
    marginTop: -4,
  },
  notificationContainer: {
    padding: 8,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
});
