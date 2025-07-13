import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';

interface ActivityData {
  title: string;
  value: string;
}

const Profile: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [isOnShift, setIsOnShift] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [station, setStation] = useState('');
  const [badge, setBadge] = useState('');
  const [emergencyResponded, setEmergencyResponded] = useState<number | null>(null);
  const [avgTimeResponse, setAvgTimeResponse] = useState<number | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem('firstName');
        const storedLastName = await AsyncStorage.getItem('lastName');
        const storedPhone = await AsyncStorage.getItem('phone');
        const storedStation = await AsyncStorage.getItem('station');
        const storedBadge = await AsyncStorage.getItem('badge');

        setFirstName(storedFirstName || 'Not Set');
        setLastName(storedLastName || 'Not Set');
        setPhone(storedPhone || 'Not Set');
        setStation(storedStation || 'Not Set');
        setBadge(storedBadge || 'Not Set');
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    loadUserInfo();
  }, []);

  useEffect(() => {
    const fetchOfficerStats = async () => {
      try {
        const policeId = await AsyncStorage.getItem('police_id');
        console.log('policeId:', policeId); // Debug log
        if (!policeId) return;
        const res = await fetch(`http://mnl911.atwebpages.com/get_officer_stats.php?police_id=${policeId}`);
        const data = await res.json();
        console.log('Officer stats API response:', data); // Debug log
        if (data.success) {
          setEmergencyResponded(data.emergency_responded);
          setAvgTimeResponse(data.avg_time_response);
        }
      } catch (e) {
        // Optionally handle error
        console.error('Error fetching officer stats:', e);
      }
    };
    fetchOfficerStats();
  }, []);

  const handleShiftToggle = async (value: boolean) => {
    setIsOnShift(value);
    const policeId = await AsyncStorage.getItem('police_id');
    if (!policeId) return;
    try {
      await fetch('http://mnl911.atwebpages.com/update_shift_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `police_id=${policeId}&is_on_shift=${value ? 1 : 0}`
      });
    } catch (e) {
      console.error('Failed to update shift status:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: currentTheme.cardBackground }]}>
            <View style={styles.profileInfo}>
              <View style={[styles.avatarContainer, { backgroundColor: currentTheme.iconBackground }]}>
                <MaterialIcons name="person" size={40} color={currentTheme.iconColor} />
              </View>
              
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: currentTheme.text }]}>
                  {firstName && lastName ? `PO1 ${firstName} ${lastName}` : 'PO1 Not Set'}
                </Text>
                <Text style={[styles.userPhone, { color: currentTheme.subtitle }]}>
                  Mobile Number: {phone}
                </Text>
                <Text style={[styles.userStation, { color: currentTheme.subtitle }]}>
                  Station: {station}
                </Text>
                <Text style={[styles.userBadge, { color: currentTheme.subtitle }]}>
                  Badge #{badge}
                </Text>
              </View>
            </View>
          </View>

          {/* Badge Display */}
          <View style={[styles.badgeCard, { backgroundColor: currentTheme.cardBackground }]}>
            <View style={styles.badgeContainer}>
              <Image 
                source={require('../../../assets/images/badge.png')}
                style={styles.badgeImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* On Shift Toggle */}
          <View style={[styles.shiftCard, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.shiftText, { color: currentTheme.text }]}>On shift</Text>
            <Switch
              value={isOnShift}
              onValueChange={handleShiftToggle}
              trackColor={{ false: currentTheme.switchTrack, true: currentTheme.switchActive }}
              thumbColor={currentTheme.switchThumb}
            />
          </View>

          {/* Activity Dashboard */}
          <View style={styles.dashboardSection}>
            <Text style={[styles.dashboardTitle, { color: currentTheme.text }]}>Activity Dashboard</Text>
            <View style={styles.activityCards}>
              <View style={[styles.activityCard, { backgroundColor: currentTheme.cardBackground }]}> 
                <Text style={[styles.activityTitle, { color: '#E02323' }]}>Emergency Responded</Text>
                <Text style={[styles.activityValue, { color: currentTheme.text }]}>{emergencyResponded !== null ? emergencyResponded : '--'}</Text>
              </View>
              <View style={[styles.activityCard, { backgroundColor: currentTheme.cardBackground }]}> 
                <Text style={[styles.activityTitle, { color: '#E02323' }]}>Avg. Time Response</Text>
                <Text style={[styles.activityValue, { color: currentTheme.text }]}>{avgTimeResponse !== null ? `${avgTimeResponse} min` : '--'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <NavBottomBar activeScreen="Profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontFamily: fonts.poppins.semiBold,
  },
  userPhone: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
  userStation: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
  userBadge: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
  badgeCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContainer: {
    width: 60,
    height: 60,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  shiftCard: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shiftText: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
  },
  dashboardSection: {
    gap: 12,
  },
  dashboardTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
  },
  activityCards: {
    flexDirection: 'row',
    gap: 6,
  },
  activityCard: {
    flex: 1,
    borderRadius: 8,
    padding: 9,
    height: 81,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityTitle: {
    fontSize: 9,
    fontFamily: fonts.poppins.semiBold,
  },
  activityValue: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
  },
});

export default Profile; 