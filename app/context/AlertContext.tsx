import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Vibration } from 'react-native';

// --- NEW: Centralized Alert Data Structure ---
export interface AlertNotification {
  alert_id: number;
  user_full_name: string;
  location: string;
  a_created?: string;
  distance?: string;
}

interface AlertContextType {
  notifications: AlertNotification[];
  isLoading: boolean;
  activeAlert: AlertNotification | null; // Track the currently active alert
  acceptAlert: (alertId: number) => Promise<void>;
  refreshAlerts: () => void;
  setActiveAlert: (alert: AlertNotification | null) => void; // Function to set active alert
  clearActiveAlert: () => void; // Function to clear active alert when resolved
}

const API_GET_NOTIFICATIONS_URL = 'http://mnl911.atwebpages.com/getnotifications1.php';
const API_ACCEPT_SOS_URL = 'http://mnl911.atwebpages.com/accept-sos-alert.php';

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAlert, setActiveAlertState] = useState<AlertNotification | null>(null); // Track active alert
  const playedAlertIds = useRef(new Set<number>());
  const isFetching = useRef(false);

  // --- Sound and Vibration Logic ---
  const playAlertSound = async () => {
    console.log('🚨 NEW ALERT DETECTED. Playing sound and vibrating...');
    Vibration.vibrate([0, 500, 200, 500]); // Vibrate for attention
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/EMERGENCY.mp3'),
        { shouldPlay: true, volume: 1.0 }
      );
      setTimeout(() => sound.unloadAsync(), 5000); // Auto-unload
    } catch (error) {
      console.error("Failed to play alert sound:", error);
    }
  };

  // --- Centralized Data Fetching ---
  const fetchNotifications = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const policeId = await AsyncStorage.getItem('police_id');
      console.log('🔍 Fetching notifications with police_id:', policeId); // Debug log
      if (!policeId) {
        setNotifications([]); // Clear notifications if not logged in
        return;
      }
      const location = await Location.getLastKnownPositionAsync();
      console.log('🔍 Device location for alerts:', location?.coords.latitude, location?.coords.longitude); // Debug log
      if (!location) {
        console.warn("Could not get device location for alert fetching.");
        return;
      }

      const apiUrl = `${API_GET_NOTIFICATIONS_URL}?police_id=${policeId}&latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`;
      console.log('🔍 Calling API:', apiUrl); // Debug log
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔍 API response:', data); // Debug log

      if (data.success && Array.isArray(data.notifications)) {
        const newAlerts = data.notifications as AlertNotification[];
        console.log('🔍 Found', newAlerts.length, 'notifications'); // Debug log
        
        // Only play sound for new alerts if there's no active alert
        if (!activeAlert) {
          const hasUnheardAlerts = newAlerts.some(alert => !playedAlertIds.current.has(alert.alert_id));
          if (hasUnheardAlerts) {
            console.log(`🚨 ${newAlerts.length} total alerts, some are new!`);
            playAlertSound();
            newAlerts.forEach(alert => playedAlertIds.current.add(alert.alert_id));
          }
        }
        setNotifications(newAlerts);
      } else {
        console.log('🔍 No notifications or invalid response format'); // Debug log
        setNotifications([]);
      }
    } catch (error) {
      // Don't spam console if it's a JSON parse error from a known unstable server
      if (error instanceof SyntaxError && error.message.includes("Unexpected character")) {
         console.log("Global alert poll failed: Server returned non-JSON response.");
      } else {
         console.error("Global alert poll failed:", error);
      }
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [activeAlert]);

  // --- Centralized Alert Acceptance ---
  const acceptAlert = async (alertId: number) => {
    const policeId = await AsyncStorage.getItem('police_id');
    if (!policeId) {
      Alert.alert("Authentication Error", "Could not find your Police ID.");
      return;
    }

    // Find the alert being accepted
    const alertToAccept = notifications.find(n => n.alert_id === alertId);
    if (!alertToAccept) {
      Alert.alert("Error", "Alert not found.");
      return;
    }

    // Set as active alert immediately
    setActiveAlertState(alertToAccept);

    // Remove from notifications list
    setNotifications(prev => prev.filter(n => n.alert_id !== alertId));

    try {
      const formData = new FormData();
      formData.append('action', 'accept');
      formData.append('alert_id', alertId.toString());
      formData.append('police_id', policeId);
      const response = await fetch('http://mnl911.atwebpages.com/status.php', { method: 'POST', body: formData });
      const result = await response.json();

      if (result.success) {
        Alert.alert("Alert Accepted", "Proceeding to incident response.", [
          { text: "OK", onPress: () => router.push(`/police-officer/incident-response?alert_id=${alertId}`) }
        ]);
      } else {
        Alert.alert("Failed to Accept", result.error || "An unknown error occurred.");
        // Reset active alert if acceptance failed
        setActiveAlertState(null);
        fetchNotifications(); // Re-fetch to get the latest true state
      }
    } catch (error) {
      console.error("Error accepting alert:", error);
      Alert.alert("Network Error", "Could not accept the alert. Please try again.");
      // Reset active alert if acceptance failed
      setActiveAlertState(null);
      fetchNotifications();
    }
  };

  // --- Functions to manage active alert ---
  const setActiveAlert = (alert: AlertNotification | null) => {
    setActiveAlertState(alert);
  };

  const clearActiveAlert = () => {
    setActiveAlertState(null);
  };

  // --- Polling and Lifecycle Management ---
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 7000); // Polling every 7 seconds

    const subscription = Notifications.addNotificationReceivedListener(() => {
        console.log("Push notification received, refreshing alerts immediately.");
        fetchNotifications();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [fetchNotifications]);

  const value = {
    notifications,
    isLoading,
    activeAlert,
    acceptAlert,
    refreshAlerts: fetchNotifications, // Expose a manual refresh function
    setActiveAlert,
    clearActiveAlert,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
