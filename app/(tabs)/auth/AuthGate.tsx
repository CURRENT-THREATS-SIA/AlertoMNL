import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Clear stored credentials on startup
        await AsyncStorage.removeItem('police_id');
        await AsyncStorage.removeItem('nuser_id');
        await AsyncStorage.removeItem('firstName');
        await AsyncStorage.removeItem('lastName');
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('phone');
        await AsyncStorage.removeItem('badge');
        await AsyncStorage.removeItem('station');
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking login status:', error);
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#e02323" />
      </View>
    );
  }

  return children;
}