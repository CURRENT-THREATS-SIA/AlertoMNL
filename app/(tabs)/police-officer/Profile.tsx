import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';

interface ActivityData {
  title: string;
  value: string;
}

const activityData: ActivityData[] = [
  {
    title: "Emergency Responded",
    value: "5",
  },
  {
    title: "Avg. Time Response",
    value: "30.67%",
  },
  {
    title: "Total Alerts Received",
    value: "5",
  },
];

const Profile: React.FC = () => {
  const [isOnShift, setIsOnShift] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <MaterialIcons name="person" size={40} color="#666" />
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>PO1 Juan Dela Cruz</Text>
                <Text style={styles.userPhone}>Mobile Number: 0917****12</Text>
                <Text style={styles.userStation}>Police Station 1</Text>
                <Text style={styles.userBadge}>Badge #1234</Text>
              </View>
            </View>
          </View>

          {/* Badge Display */}
          <View style={styles.badgeCard}>
            <View style={styles.badgeContainer}>
              <Image 
                source={require('../../../assets/images/badge.png')}
                style={styles.badgeImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* On Shift Toggle */}
          <View style={styles.shiftCard}>
            <Text style={styles.shiftText}>On shift</Text>
            <Switch
              value={isOnShift}
              onValueChange={setIsOnShift}
              trackColor={{ false: '#767577', true: '#FFD8D8' }}
              thumbColor={isOnShift ? '#E02323' : '#f4f3f4'}
            />
          </View>

          {/* Activity Dashboard */}
          <View style={styles.dashboardSection}>
            <Text style={styles.dashboardTitle}>Activity Dashboard</Text>
            
            <View style={styles.activityCards}>
              {activityData.map((item, index) => (
                <View key={index} style={styles.activityCard}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityValue}>{item.value}</Text>
                </View>
              ))}
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
    backgroundColor: '#f4f4f4',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#d9d9d9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
    color: '#000',
  },
  userPhone: {
    fontSize: 11,
    fontFamily: fonts.poppins.medium,
    color: '#000',
  },
  userStation: {
    fontSize: 10,
    fontFamily: fonts.poppins.regular,
    color: 'rgba(21, 5, 2, 0.75)',
  },
  userBadge: {
    fontSize: 10,
    fontFamily: fonts.poppins.regular,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  badgeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#a4a4a4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    width: 43,
    height: 60,
  },
  shiftCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
  },
  shiftText: {
    fontSize: 15,
    fontFamily: fonts.poppins.semiBold,
    color: '#111619',
  },
  dashboardSection: {
    gap: 12,
  },
  dashboardTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
    color: '#000',
  },
  activityCards: {
    flexDirection: 'row',
    gap: 6,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFD8D8',
    borderRadius: 8,
    padding: 9,
    height: 81,
    justifyContent: 'space-between',
  },
  activityTitle: {
    fontSize: 9,
    fontFamily: fonts.poppins.semiBold,
    color: '#E02323',
  },
  activityValue: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: '#000',
  },
});

export default Profile; 