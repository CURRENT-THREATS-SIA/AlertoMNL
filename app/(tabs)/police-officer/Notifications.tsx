import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fonts } from '../../config/fonts';

// Define notification data structure
type NotificationType = 'alert' | 'update';

interface Notification {
  type: NotificationType;
  title: string;
  description: string;
}

const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={24} color="#ffffff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationDescription}>{notification.description}</Text>
        </View>
      </View>
    </View>
  );
};

const Notifications: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const fetchNotifications = async () => {
      try {
        const policeId = await AsyncStorage.getItem('police_id');
        if (!policeId) return;
        const response = await fetch(`http://mnl911.atwebpages.com/get_notifications.php?police_id=${policeId}`);
        const data = await response.json();
        if (data.success) {
          setNotifications(
            data.notifications.map((n: any) => ({
              type: 'alert', // You can adjust this if your backend provides a type
              title: n.title,
              description: n.description,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
    interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#424b5a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {loading ? (
          <Text>Loading...</Text>
        ) : notifications.length === 0 ? (
          <Text>No notifications.</Text>
        ) : (
          notifications.map((notification, index) => (
            <NotificationCard key={index} notification={notification} />
          ))
        )}
      </ScrollView>

      {/* Bottom Indicator */}
      <View style={styles.bottomIndicator}>
        <View style={styles.indicator} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    color: '#424b5a',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    backgroundColor: '#e02323',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
    color: '#212121',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: '#666666',
  },
  bottomIndicator: {
    height: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 136,
    height: 7,
    backgroundColor: '#a4a4a4',
    borderRadius: 100,
  },
});

export default Notifications; 