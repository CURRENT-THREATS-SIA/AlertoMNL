import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../config/fonts';

type NavItem = {
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

interface CustomTabBarProps {
  activeScreen: 'Home' | 'CrimeMap' | 'History' | 'Contacts';
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ activeScreen }) => {
  const router = useRouter();

  const navItems: NavItem[] = [
    { 
      icon: <MaterialIcons name="home" size={24} color={activeScreen === 'Home' ? "#E02323" : "#A4A4A4"} />, 
      label: 'Home', 
      active: activeScreen === 'Home' 
    },
    { 
      icon: <MaterialIcons name="map" size={24} color={activeScreen === 'CrimeMap' ? "#E02323" : "#A4A4A4"} />, 
      label: 'Crime Map', 
      active: activeScreen === 'CrimeMap' 
    },
    { 
      icon: <MaterialIcons name="history" size={24} color={activeScreen === 'History' ? "#E02323" : "#A4A4A4"} />, 
      label: 'History', 
      active: activeScreen === 'History' 
    },
    { 
      icon: <MaterialIcons name="people" size={24} color={activeScreen === 'Contacts' ? "#E02323" : "#A4A4A4"} />, 
      label: 'Contacts', 
      active: activeScreen === 'Contacts' 
    },
  ];

  const handleNavigation = (screen: string) => {
    router.push(screen);
  };

  return (
    <View style={[styles.bottomNav, Platform.select({
      android: {
        elevation: 8,
        paddingBottom: 8
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      }
    })]}>
      <View style={styles.bottomNavRow}>
        {navItems.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.bottomNavItem}
            activeOpacity={0.7}
            onPress={() => {
              switch (item.label) {
                case 'Home':
                  handleNavigation('/regular-user');
                  break;
                case 'Crime Map':
                  handleNavigation('/regular-user/CrimeMap');
                  break;
                case 'History':
                  handleNavigation('/regular-user/History');
                  break;
                case 'Contacts':
                  handleNavigation('/regular-user/Contacts');
                  break;
              }
            }}
          >
            <View style={styles.bottomNavIconContainer}>
              {item.icon}
            </View>
            <Text 
              style={item.active ? styles.bottomNavLabelActive : styles.bottomNavLabelInactive}
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      android: {
        height: 110,
      },
      ios: {
        height: 75,
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