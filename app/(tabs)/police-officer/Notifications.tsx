import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// --- PATHS CORRECTED BELOW ---
import * as Location from 'expo-location';
import { fonts } from '../../config/fonts';
import { useAlert } from '../../context/AlertContext';
import { theme, useTheme } from '../../context/ThemeContext';

// --- API URLs ---
const API_ACCEPT_SOS_URL = 'http://mnl911.atwebpages.com/accept-sos-alert.php'; 
const API_GET_NOTIFICATIONS_URL = 'http://mnl911.atwebpages.com/getnotifications1.php';

// The data structure for a single alert from your backend
interface AlertNotification {
  alert_id: number;
  user_full_name: string;
  location: string;
}

const AlertCard: React.FC<{ notification: AlertNotification; onAccept: (alertId: number) => void }> = ({ notification, onAccept }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
      <Ionicons name="alert-circle" size={48} color="#e02323" style={{ marginBottom: 12 }} />
      <Text style={styles.title}>Someone needs your help!</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={[styles.detailText, { color: currentTheme.text }]}>
          <Text style={[styles.detailLabel, { color: currentTheme.text }]}>From:</Text> {notification.user_full_name}
        </Text>
        <Text style={[styles.detailText, { color: currentTheme.text }]}>
          <Text style={[styles.detailLabel, { color: currentTheme.text }]}>Alert ID:</Text> {notification.alert_id}
        </Text>
        <Text style={[styles.detailText, { color: currentTheme.text }]}>
          <Text style={[styles.detailLabel, { color: currentTheme.text }]}>Location:</Text> {notification.location}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.acceptButton}
        onPress={() => onAccept(notification.alert_id)}
      >
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );
};

// The main screen component
const Notifications: React.FC = () => {
  const router = useRouter();
  const alertContext = useAlert();
  if (!alertContext) throw new Error('AlertContext must be used within AlertProvider');
  const { showAlert } = alertContext;
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [notifications, setNotifications] = React.useState<AlertNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const playAlertSound = async () => {
    console.log('New alert detected. Playing sound...');
    try {
      // --- PATH CORRECTED BELOW --- (Assuming assets is in the root, outside 'app')
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/EMERGENCY.mp3') 
      );
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound. Check file path and name.", error);
    }
  };

  const fetchNotifications = React.useCallback(async () => {
    try {
      const policeId = await AsyncStorage.getItem('police_id');
      if (!policeId) return;

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const response = await fetch(
        `${API_GET_NOTIFICATIONS_URL}?police_id=${policeId}&latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`
      );
      const data = await response.json();
      
      if (data.success) {
        setNotifications((prevNotifications: AlertNotification[]) => {
          const prevIds = new Set(prevNotifications.map((n: AlertNotification) => n.alert_id));
          const hasNewAlert = data.notifications.some((newNotification: AlertNotification) => !prevIds.has(newNotification.alert_id));
          
          if (hasNewAlert && prevNotifications.length > 0) {
            playAlertSound();
            showAlert(data.notifications[0].alert_id);
          }
          
          return data.notifications;
        });
      } else {
        throw new Error(data.message || "Failed to fetch notifications");
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showAlert]); 

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleAccept = async (alertId: number) => {
    const policeId = await AsyncStorage.getItem('police_id');
    if (!policeId) {
      Alert.alert("Authentication Error", "Could not find your Police ID. Please log in again.");
      return;
    }
    setNotifications((prev: AlertNotification[]) => prev.filter((n: AlertNotification) => n.alert_id !== alertId));
    try {
      const formData = new FormData();
      formData.append('alert_id', alertId.toString());
      formData.append('police_id', policeId);
      const response = await fetch(API_ACCEPT_SOS_URL, { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        Alert.alert("Alert Accepted", "You have been assigned to the case.", [
          {
            text: "Proceed",
            onPress: () => router.push(`/police-officer/incident-response?alert_id=${alertId}`)
          }
        ]);
      } else {
        throw new Error(result.message || "Failed to accept alert.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
      fetchNotifications();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={currentTheme.background} />
      <View style={[styles.header, { backgroundColor: currentTheme.cardBackground, borderBottomColor: currentTheme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Pending Alerts</Text>
      </View>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#e02323"]} />}
      >
        {/* JSX content remains the same */}
        {loading ? (
          <ActivityIndicator size="large" color="#e02323" style={{ marginTop: 50 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: currentTheme.subtitle }]}>No pending alerts at the moment.</Text>
            <Text style={[styles.pullDownText, { color: currentTheme.subtitle }]}>Pull down to refresh.</Text>
          </View>
        ) : (
          notifications.map((notification: AlertNotification) => (
            <AlertCard 
              key={notification.alert_id} 
              notification={notification}
              onAccept={handleAccept} 
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  headerTitle: { marginLeft: 16, fontSize: 20, fontFamily: fonts.poppins.bold },
  scrollView: { flex: 1 },
  scrollViewContent: { padding: 16, flexGrow: 1 },
  card: { 
    borderRadius: 20, 
    marginBottom: 16,
    padding: 24,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
    alignItems: 'center', 
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: '#e02323',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsContainer: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  detailText: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: fonts.poppins.bold,
  },
  acceptButton: { 
    backgroundColor: '#10C86E', 
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: 'center', 
    alignItems: 'center',
    alignSelf: 'stretch', 
    marginTop: 10,
  },
  acceptButtonText: { 
    color: 'white', 
    fontSize: 18,
    fontFamily: fonts.poppins.bold 
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
  emptyText: { fontSize: 16, fontFamily: fonts.poppins.regular },
  pullDownText: { fontSize: 14, marginTop: 8, fontFamily: fonts.poppins.regular },
});

export default Notifications;