import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../config/fonts';
import { theme, useTheme } from '../context/ThemeContext';


type NavItem = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  path: string;
};

interface CustomTabBarProps {
  activeScreen: 'Home' | 'CrimeMap' | 'History' | 'Contacts';
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ activeScreen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const isHistorySection = pathname.includes('/history/') || pathname === '/regular-user/History';
  const isHomeSection = pathname === '/regular-user';
  const isCrimeMapSection = pathname === '/regular-user/CrimeMap';
  const isContactsSection = pathname === '/regular-user/Contacts';

  const navItems: NavItem[] = [
    { 
      icon: <MaterialIcons name="home" size={24} color={isHomeSection ? "#E02323" : currentTheme.subtitle} />, 
      label: 'Home', 
      active: isHomeSection,
      path: '/regular-user'
    },
    { 
      icon: <MaterialIcons name="map" size={24} color={isCrimeMapSection ? "#E02323" : currentTheme.subtitle} />, 
      label: 'Crime Map', 
      active: isCrimeMapSection,
      path: '/regular-user/CrimeMap'
    },
    { 
      icon: <MaterialIcons name="history" size={24} color={isHistorySection ? "#E02323" : currentTheme.subtitle} />, 
      label: 'History', 
      active: isHistorySection,
      path: '/regular-user/History'
    },
    { 
      icon: <MaterialIcons name="people" size={24} color={isContactsSection ? "#E02323" : currentTheme.subtitle} />, 
      label: 'Contacts', 
      active: isContactsSection,
      path: '/regular-user/Contacts'
    },
  ];

  const handleNavigation = (path: string, isCurrentTab: boolean) => {
    if (isCurrentTab && pathname.includes('/history/')) return;
    router.push(path);
  };

  return (
    <View style={[
      styles.bottomNav, 
      { 
        paddingBottom: insets.bottom + 8,
        backgroundColor: currentTheme.cardBackground,
        borderTopColor: currentTheme.border
      }
    ]}>
      <View style={styles.bottomNavRow}>
        {navItems.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.bottomNavItem}
            activeOpacity={0.7}
            onPress={() => handleNavigation(item.path, item.active)}
          >
            <View style={[
              styles.bottomNavIconContainer,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'transparent' }
            ]}>
              {item.icon}
            </View>
            <Text 
              style={[
                item.active ? styles.bottomNavLabelActive : styles.bottomNavLabelInactive,
                { color: item.active ? '#E02323' : currentTheme.subtitle }
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: Platform.OS === 'android' ? 8 : 0,
    borderTopWidth: 1,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavLabelActive: {
    color: '#E02323',
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    textAlign: 'center',
  },
  bottomNavLabelInactive: {
    color: '#A4A4A4',
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    textAlign: 'center',
  },
});

export default CustomTabBar;
