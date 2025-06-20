import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../app/config/fonts';
import { theme, useTheme } from '../app/context/ThemeContext';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

interface NavBottomBarProps {
  activeScreen: 'Home' | 'History' | 'Profile' | 'Settings';
}

const NavBottomBar: React.FC<NavBottomBarProps> = ({ activeScreen }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const navItems: NavItem[] = [
    { 
      icon: <MaterialIcons name="home" size={24} color={activeScreen === 'Home' ? "#E02323" : "#A4A4A4"} />, 
      label: 'Home', 
      active: activeScreen === 'Home' 
    },
    { 
      icon: <MaterialIcons name="history" size={24} color={activeScreen === 'History' ? "#E02323" : "#A4A4A4"} />, 
      label: 'History', 
      active: activeScreen === 'History' 
    },
    { 
      icon: <MaterialIcons name="person-outline" size={24} color={activeScreen === 'Profile' ? "#E02323" : "#A4A4A4"} />, 
      label: 'Profile', 
      active: activeScreen === 'Profile' 
    },
    { 
      icon: <MaterialIcons name="settings" size={24} color={activeScreen === 'Settings' ? "#E02323" : "#A4A4A4"} />, 
      label: 'Settings', 
      active: activeScreen === 'Settings' 
    },
  ];

  const handleNavigation = (screen: string) => {
    router.push(screen);
  };

  return (
    <View style={[
      styles.bottomNav, 
      { 
        paddingBottom: insets.bottom + 8,
        backgroundColor: currentTheme.surface,
        borderTopColor: currentTheme.cardBorder
      }
    ]}>
      <View style={styles.bottomNavRow}>
        {navItems.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.bottomNavItem}
            activeOpacity={0.7}
            onPress={() => {
              switch (item.label) {
                case 'Home':
                  handleNavigation('/police-officer/PoliceOfficerHome');
                  break;
                case 'History':
                  handleNavigation('/police-officer/History');
                  break;
                case 'Profile':
                  handleNavigation('/police-officer/Profile');
                  break;
                case 'Settings':
                  handleNavigation('/police-officer/Settings');
                  break;
              }
            }}
          >
            <View style={[
              styles.bottomNavIconContainer,
             ]}>
              {item.icon}
            </View>
            <Text 
              style={[
                item.active ? styles.bottomNavLabelActive : styles.bottomNavLabelInactive,
                { color: item.active ? "#E02323" : "#A4A4A4" }
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
    borderTopWidth: 1,
    ...Platform.select({
      android: {
        elevation: 8,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
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
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    textAlign: 'center',
  },
  bottomNavLabelInactive: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    textAlign: 'center',
  },
});

export default NavBottomBar;

