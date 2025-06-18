import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as Location from 'expo-location';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { EmergencyAlertModal } from '../components/EmergencyAlertModal';
import { AlertProvider, useAlert } from './context/AlertContext';
import { theme, ThemeProvider, useTheme } from './context/ThemeContext';
import { VoiceRecordProvider } from "./context/VoiceRecordContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function GlobalAlertPoller() {
  const { showAlert } = useAlert();
  const pathname = usePathname();
  const lastAlertIdRef = useRef<number | null>(null);

  const fetchLatestAlert = useCallback(async () => {
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
        `http://mnl911.atwebpages.com/getnotifications1.php?police_id=${policeId}&latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`
      );
      const data = await response.json();
      if (data.success && data.notifications?.length > 0) {
        const latestAlert = data.notifications[0];
        const alertId = Number(latestAlert.alert_id);
        if (alertId === lastAlertIdRef.current) return;
        lastAlertIdRef.current = alertId;
        showAlert(alertId);
      }
    } catch (error) {
      console.error("Global alert poll failed:", error);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchLatestAlert();
    const interval = setInterval(fetchLatestAlert, 15000);
    return () => clearInterval(interval);
  }, [fetchLatestAlert]);

  return null;
}

function RootLayoutContent() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
          'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
          'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
          'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: currentTheme.background }}>
        <ActivityIndicator size="large" color="#E02323" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: currentTheme.background }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <VoiceRecordProvider>
        <AlertProvider>
          <RootLayoutContent />
          <EmergencyAlertModal />
          <GlobalAlertPoller />
        </AlertProvider>
      </VoiceRecordProvider>
    </ThemeProvider>
  );
}
  