import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { View } from 'react-native';

import { EmergencyAlertModal } from '../components/EmergencyAlertModal';
import { AlertProvider, useAlert } from './context/AlertContext';
import { theme, ThemeProvider, useTheme } from './context/ThemeContext';
import { VoiceRecordProvider } from "./context/VoiceRecordContext";

// ✅ Move GlobalAlertPoller *inside* RootLayout so it's rendered after ThemeProvider
function GlobalAlertPoller() {
  const { showAlert } = useAlert();
  const pathname = usePathname();
  const lastAlertIdRef = useRef<number | null>(null);

  const fetchLatestAlert = useCallback(async () => {
    try {
      const policeId = await AsyncStorage.getItem('police_id');
      if (!policeId) return; // ✅ Only for police

      const response = await fetch('http://mnl911.atwebpages.com/getnotifications1.php');
      const data = await response.json();

      if (data.success && data.notifications?.length > 0) {
        const latestAlert = data.notifications[0];
        const alertId = Number(latestAlert.alert_id);

        if (alertId === lastAlertIdRef.current) return;

        lastAlertIdRef.current = alertId;
        showAlert(alertId); // ✅ No redirect here
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

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
        'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
      });
    }
    loadFonts();
  }, []);

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
  