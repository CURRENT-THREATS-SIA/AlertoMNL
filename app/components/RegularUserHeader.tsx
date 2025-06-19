import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, useTheme } from '../context/ThemeContext';

interface RegularUserHeaderProps {
  onProfilePress?: () => void;
}

export default function RegularUserHeader({ onProfilePress }: RegularUserHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/regular-user/Profile');
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: currentTheme.surface, paddingTop: insets.top + 12 }]}>
      {/* Logo and Title */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/ALERTOMNL-ICON.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ALERTO MNL</Text>
          <Text style={[styles.subtitle, { color: currentTheme.subtitle }]}>Response System</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.profileButton, { backgroundColor: currentTheme.cardBackground }]} 
        onPress={handleProfilePress}
      >
        <User size={24} color={currentTheme.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
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
  profileButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 