import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const policeId = await AsyncStorage.getItem('police_id');
      const nuserId = await AsyncStorage.getItem('nuser_id');
      if (policeId) {
        router.replace('/(tabs)/police-officer/PoliceOfficerHome');
      } else if (nuserId) {
        router.replace('/regular-user');
      }
      setLoading(false);
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