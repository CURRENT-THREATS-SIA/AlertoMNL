import { useRouter } from 'expo-router';
import { FileSpreadsheet, LayoutDashboard, Search, Shield, Users } from 'lucide-react-native';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const menuItems = [
    { 
      icon: <LayoutDashboard size={24} color="#666666" />,
      label: 'Dashboard',
      route: '/(tabs)/admin/dashboard',
    },
    { 
      icon: <FileSpreadsheet size={24} color="#666666" />,
      label: 'Crime Data',
      route: '/(tabs)/admin/crimeData',
    },
    { 
      icon: <Users size={24} color="#666666" />,
      label: 'Regular Users',
      route: '/(tabs)/admin/regularUsers',
    },    {
      icon: <Shield size={24} color="#666666" />,
      label: 'Police Officers',
      route: '/(tabs)/admin/policeOfficers',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Sidebar - full height with logo/title at the top */}
        <View style={styles.sideNav}>
          <View style={styles.sidebarHeader}>
            <Image source={require('../../assets/images/ALERTOMNL-ICON.png')} style={styles.sidebarLogo} resizeMode="contain" />
            <View>
              <Text style={styles.sidebarTitle}>ALERTO MNL</Text>
              <Text style={styles.sidebarSubtitle}>Response System</Text>
            </View>
          </View>
          <View style={styles.sidebarMenu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.navItem}
                onPress={() => router.push(item.route)}
              >
                {item.icon}
                <Text style={styles.navLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main content area with topbar on the right */}
        <View style={styles.contentArea}>
          {/* Topbar aligned right */}
          <View style={styles.headerRightBar}>
            <View style={styles.searchBarWrapper}>
              <View style={styles.searchBar}>
                <Search size={18} color="#bdbdbd" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor="#bdbdbd"
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userEmail}>123@gmail.com</Text>
              <Text style={styles.userRole}>Administrator</Text>
            </View>
          </View>
          {/* Main Content */}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRightBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  searchBarWrapper: {
    flex: 1,
    maxWidth: 700,
    minWidth: 400,
    marginRight: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 40,
    width: '100%',
    marginTop: 0,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#bdbdbd',
  },
  searchInput: {
    flex: 1,
    color: '#4a4a4a',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  userInfoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4a4a4a',
    textAlign: 'right',
  },
  userRole: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#bdbdbd',
    marginTop: -2,
    textAlign: 'right',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  sideNav: {
    width: 260,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    minHeight: '100%',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  sidebarLogo: {
    width: 48,
    height: 48,
    marginRight: 10,
  },
  sidebarTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#e02323',
  },
  sidebarSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#e02323',
    marginTop: -4,
  },
  sidebarMenu: {
    flex: 1,
    width: '100%',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'column',
    minHeight: '100%',
    backgroundColor: '#f8f9fa',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4a4a4a',
  },
  content: {
    flex: 1,
  },
});
