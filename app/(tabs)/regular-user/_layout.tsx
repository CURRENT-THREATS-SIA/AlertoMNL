import { Slot, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import CustomTabBar from '../../components/CustomTabBar';
import RegularUserHeader from '../../components/RegularUserHeader';

type ActiveScreen = 'Home' | 'CrimeMap' | 'History' | 'Contacts';

export default function RegularUserLayout() {
  const pathname = usePathname();
  
  const activeScreen: ActiveScreen = pathname === '/regular-user/CrimeMap' ? 'CrimeMap'
    : pathname.toLowerCase().includes('/regular-user/history') ? 'History'
    : pathname.includes('/regular-user/AddContacts') || pathname === '/regular-user/Contacts' ? 'Contacts'
    : 'Home';

  const isProfileRoute = pathname.includes('/profile') || pathname === '/regular-user/Profile';
  const showHeader = !isProfileRoute;
  const showTabBar = !isProfileRoute;

  return (
    <View style={styles.container}>
      {showHeader && <RegularUserHeader />}
      <View style={styles.content}>
        <Slot />
      </View>
      {showTabBar && <CustomTabBar activeScreen={activeScreen} />}
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