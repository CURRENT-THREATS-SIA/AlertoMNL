import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import MapComponent from '../../../components/MapComponent';
import { theme, useTheme } from '../../../context/ThemeContext';

// --- SVG Icon Components ---

const ReportedIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" />
        <Path d="M12 8v4" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 16h.01" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

const VictimIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

// --- Main Component ---

interface AlertDetails {
  a_created: string;
  f_name: string;
  l_name: string;
  m_number: string;
  a_latitude: string;
  a_longitude: string;
}

export default function ArrivedStep() {
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const buttonColor = isDarkMode ? currentTheme.iconBackground : '#E02323';

  const [alertDetails, setAlertDetails] = useState<AlertDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [officerLocation, setOfficerLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();

  // Get user's current location
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          });
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (location) => {
              setUserLocation({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
              });
            }
          );
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!alert_id) {
      setError('Alert ID is missing.');
      setIsLoading(false);
      return;
    }

    const fetchAllDetails = async () => {
      try {
        const policeId = await AsyncStorage.getItem('police_id');
        if (!policeId) {
          setError('Police ID not found.');
          return;
        }

        // Fetch alert and officer location details in parallel
        const [alertRes, locationRes] = await Promise.all([
          fetch(`http://mnl911.atwebpages.com/get_alert_details.php?alert_id=${alert_id}`),
          fetch(`http://mnl911.atwebpages.com/get_police_location.php?police_id=${policeId}&alert_id=${alert_id}`)
        ]);

        const alertResult = await alertRes.json();
        const locationResult = await locationRes.json();

        if (alertResult.success) {
          setAlertDetails(alertResult.data);
        } else {
          throw new Error(alertResult.error || 'Failed to fetch alert details.');
        }

        if (locationResult.success && locationResult.location) {
          setOfficerLocation({
            lat: parseFloat(locationResult.location.latitude),
            lng: parseFloat(locationResult.location.longitude)
          });
        } else {
          // It's okay if officer location fails, we can still show the incident
          console.warn('Could not fetch officer location on ArrivedStep.');
        }

      } catch (e: any) {
        setError(e.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDetails();
  }, [alert_id]);

  const getFormattedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
  }

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: currentTheme.background }]}> 
        <ActivityIndicator size="large" color={currentTheme.iconBackground || '#E02323'} />
        <Text style={{ color: currentTheme.text }}>Loading Details...</Text>
      </View>
    );
  }

  if (error || !alertDetails) {
    return (
        <View style={[styles.centered, { backgroundColor: currentTheme.background }]}> 
            <Text style={[styles.errorText, { color: currentTheme.statusResolved }]}>{error || "Could not load alert details."}</Text>
        </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}> 
      <View style={{ flex: 1, minHeight: 300 }}>
        <MapComponent
          selectedCrimeType={''}
          selectedStation={null}
          userType={'police'}
          data={{ type: 'FeatureCollection', features: [] }}
          officerLocation={officerLocation}
          userLocation={userLocation}
          incidentLocation={alertDetails && alertDetails.a_latitude && alertDetails.a_longitude ? { lat: Number(alertDetails.a_latitude), lng: Number(alertDetails.a_longitude) } : undefined}
          hideIncidentMarker={true}
        />
      </View>
      
      <View style={[styles.infoCard, { backgroundColor: currentTheme.cardBackground }]}> 
        <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#222' }]} >You've Arrived!</Text>
            <Text style={[styles.instructions, { color: isDarkMode ? currentTheme.subtitle : '#333' }]}>
                <Text style={[styles.highlightText, { color: buttonColor } ]}>Secure your safety</Text>
                <Text>, park at a clear angle, and scan for any hazards. Then immediately locate the victim, assess their condition, and </Text>
                <Text style={[styles.highlightText, { color: buttonColor } ]}>render aid or protection.</Text>
            </Text>

            <View style={styles.infoRow}>
                <ReportedIcon />
                <View style={styles.infoTextContainer}>
                    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' } ]}>Reported</Text>
                    <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' } ]}>{getFormattedTime(alertDetails.a_created)}</Text>
                </View>
            </View>

            <View style={styles.infoRow}>
                <VictimIcon />
                <View style={styles.infoTextContainer}>
                    <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' } ]}>Victim's Information</Text>
                    <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' } ]}>
                        {`${alertDetails.f_name} ${alertDetails.l_name} (${alertDetails.m_number})`}
                    </Text>
                </View>
            </View>
            
            <TouchableOpacity style={[styles.button, { backgroundColor: buttonColor }]} onPress={() => router.push(`/police-officer/incident-response/ReportStep?alert_id=${alert_id}`)}>
              <Text style={[styles.buttonText, { color: '#fff' }]}>Crime Resolved</Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, { color: isDarkMode ? currentTheme.subtitle : '#444' } ]}>
                Your priority is the victim's safety—act swiftly and stay secure.
            </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 16, 
    textAlign: 'center' 
  },
  mapPlaceholder: { 
    flex: 1, // This makes the map take up the remaining space
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  mapText: {},
  infoCard: { 
    paddingHorizontal: 24, 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    elevation: 8, 
    paddingTop: 32,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#222' },
  instructions: { fontSize: 14, marginBottom: 24, lineHeight: 20, color: '#333' },
  highlightText: {},
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoTextContainer: {
      marginLeft: 16,
  },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 2, color: '#222' },
  value: { fontSize: 14, color: '#444' },
  button: { marginTop: 16, borderRadius: 12, paddingVertical: 18, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerText: {
      marginTop: 16,
      paddingBottom: 24,
      textAlign: 'center',
      fontSize: 12,
  },
});