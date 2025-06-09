import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme, ThemeProvider, useTheme } from './context/ThemeContext';
import { VoiceRecordProvider } from "./context/VoiceRecordContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
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
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: currentTheme.background }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <VoiceRecordProvider>
        <RootLayoutContent />
      </VoiceRecordProvider>
    </ThemeProvider>
  );
}
