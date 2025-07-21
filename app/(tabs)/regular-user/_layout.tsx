import { Slot, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomTabBar from '../../components/CustomTabBar';
import RegularUserHeader from '../../components/RegularUserHeader';
import { useSos } from '../../context/SosContext';
import Profile from './Profile';

type ActiveScreen = 'Home' | 'CrimeMap' | 'History' | 'Contacts';
type SOSState = 'idle' | 'countdown' | 'active' | 'received' | 'arrived' | 'resolved';

export default function RegularUserLayout() {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);
  const { sosState } = useSos();
  const router = useRouter();
  
  const activeScreen: ActiveScreen = pathname === '/regular-user/CrimeMap' ? 'CrimeMap'
    : pathname === '/regular-user/History' ? 'History'
    : pathname.includes('/regular-user/AddContacts') || pathname === '/regular-user/Contacts' ? 'Contacts'
    : 'Home';

  const isProfileRoute = pathname.includes('/profile') || pathname === '/regular-user/Profile';
  const isHistoryDetailRoute = pathname.includes('/history/');
  const showHeader = !isProfileRoute && !isHistoryDetailRoute;
  const showTabBar = !isProfileRoute && !isHistoryDetailRoute;

  const handleProfilePress = () => {
    const isSosModal = sosState === 'active' || sosState === 'received' || sosState === 'arrived';
    if (isSosModal) {
      setShowProfile(true);
    } else {
      router.push('/regular-user/Profile');
    }
  };

  return (
    <View style={styles.container}>
      {showHeader && <RegularUserHeader onProfilePress={handleProfilePress} />}
      <View style={styles.content}>
        <Slot />
      </View>
      {showTabBar && <CustomTabBar activeScreen={activeScreen} />}
      <Modal
        visible={showProfile}
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}
      >
        <Profile />
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#e02323', borderRadius: 20, padding: 10, zIndex: 100 }}
          onPress={() => setShowProfile(false)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
}); 