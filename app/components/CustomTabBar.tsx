import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Contacts from '../(tabs)/regular-user/Contacts';
import CrimeMap from '../(tabs)/regular-user/CrimeMap';
import History from '../(tabs)/regular-user/History';
import { fonts } from '../config/fonts';
import { useSos } from '../context/SosContext';
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
  const { sosState } = useSos();
  console.log('CustomTabBar sosState:', sosState);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const isHistorySection = pathname.includes('/history/') || pathname === '/regular-user/History';
  const isHomeSection = pathname === '/regular-user';
  const isCrimeMapSection = pathname === '/regular-user/CrimeMap';
  const isContactsSection = pathname === '/regular-user/Contacts';

  if (activeScreen === 'History' && pathname.includes('/history/')) {
    return null;
  }

  const [showCrimeMap, setShowCrimeMap] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showContacts, setShowContacts] = React.useState(false);

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

  const handleTabPress = (label: string, isCurrentTab: boolean) => {
    const isSosModal = sosState === 'active' || sosState === 'received' || sosState === 'arrived';
    if (label === 'Home') {
      if (!isCurrentTab) router.push('/regular-user');
    } else if (isSosModal) {
      if (label === 'Crime Map') setShowCrimeMap(true);
      else if (label === 'History') setShowHistory(true);
      else if (label === 'Contacts') setShowContacts(true);
    } else {
      // Normal navigation
      const nav = navItems.find(item => item.label === label);
      if (nav && !isCurrentTab) router.push(nav.path);
    }
  };

  return (
    <>
      <View style={[
        styles.bottomNav, 
        { 
          paddingBottom: insets.bottom,
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
              onPress={() => handleTabPress(item.label, item.active)}
            >
              <View style={[
                styles.bottomNavIconContainer,
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
      <Modal
        visible={showCrimeMap}
        animationType="slide"
        onRequestClose={() => setShowCrimeMap(false)}
      >
        <CrimeMap />
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#e02323', borderRadius: 20, padding: 10, zIndex: 100 }}
          onPress={() => setShowCrimeMap(false)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={showHistory}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <History />
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#e02323', borderRadius: 20, padding: 10, zIndex: 100 }}
          onPress={() => setShowHistory(false)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={showContacts}
        animationType="slide"
        onRequestClose={() => setShowContacts(false)}
      >
        <Contacts />
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#e02323', borderRadius: 20, padding: 10, zIndex: 100 }}
          onPress={() => setShowContacts(false)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
        </TouchableOpacity>
      </Modal>
    </>
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
