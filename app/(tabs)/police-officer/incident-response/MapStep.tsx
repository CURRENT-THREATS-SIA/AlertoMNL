import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Modal, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import MapComponent from '../../../components/MapComponent';
import { theme, useTheme } from '../../../context/ThemeContext';
import { getCurrentPhilippineTime } from '../../../utils/timezoneConverter';

// --- SVG Icon Components for the new UI ---

const PinIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill={color}/>
  </Svg>
);

const PersonPinIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill={color}/>
    <Path d="M12 12c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color} fillOpacity="0.3"/>
  </Svg>
);

const ClockIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm.5-7V8h-1v4.25l3.5 2.08.5-.86-3-1.77z" fill={color}/>
  </Svg>
);

const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z" fill={color}/>
  </Svg>
);

const UserIcon = ({ color }: { color: string }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill={color}/>
  </Svg>
);

const DragHandleIcon = () => (
  <View style={{ alignItems: 'center', paddingVertical: 8 }}>
    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc' }} />
  </View>
);

interface AlertDetails {
  a_address: string;
  a_created: string;
  a_latitude: number;
  a_longitude: number;
  f_name: string;
  l_name: string;
  m_number: string;
}

// Utility: Haversine distance for more accurate nearest node
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- ETA Calculation Utilities ---
function getDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371e3; // meters
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getRouteDistance(routeCoords: { lat: number, lng: number }[] | null) {
  if (!routeCoords || routeCoords.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < routeCoords.length; i++) {
    total += getDistanceInMeters(
      routeCoords[i-1].lat, routeCoords[i-1].lng,
      routeCoords[i].lat, routeCoords[i].lng
    );
  }
  return total; // meters
}

function getETA(routeCoords: { lat: number, lng: number }[] | null, speedKmh: number = 30) {
  const distance = getRouteDistance(routeCoords); // meters
  const speedMs = speedKmh * 1000 / 3600; // m/s
  if (distance === 0 || !speedMs) return null;
  const etaSeconds = distance / speedMs;
  return Math.round(etaSeconds / 60); // minutes
}

export default function MapStep() {
  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  console.log("MapStep loaded"); // Top-level log to confirm component mount
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const buttonColor = isDarkMode ? currentTheme.iconBackground : '#E02323';
  console.log('MapStep alert_id:', alert_id); // <--- Add this

  // Get screen dimensions
  const { height: screenHeight } = Dimensions.get('window');
  
  // Bottom sheet states and animation
  const COLLAPSED_HEIGHT = 200; // Height when collapsed
  const EXPANDED_HEIGHT = screenHeight * 0.7; // Height when expanded (70% of screen)
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const lastGestureDy = useRef(0);

  const [alertDetails, setAlertDetails] = useState<AlertDetails | null>(null);
  const [error, setError] = useState("");
  const [routeCoords, setRouteCoords] = useState<
    { lat: number; lng: number }[] | null
  >(null);
  const [officerLocation, setOfficerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [officerAddress, setOfficerAddress] = useState<string>('Fetching location...');
  const routeIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [showAccuracyModal, setShowAccuracyModal] = useState(false);
  const hasShownAccuracyWarning = React.useRef(false);
  const [sosReceivedTime, setSosReceivedTime] = useState<string>(''); // Store SOS received time

  // Pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        // Calculate new height based on drag
        const newHeight = isExpanded
          ? EXPANDED_HEIGHT - gestureState.dy
          : COLLAPSED_HEIGHT - gestureState.dy;
        
        // Clamp the height between min and max
        const clampedHeight = Math.max(COLLAPSED_HEIGHT, Math.min(EXPANDED_HEIGHT, newHeight));
        animatedHeight.setValue(clampedHeight);
        lastGestureDy.current = gestureState.dy;
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const currentHeight = isExpanded
          ? EXPANDED_HEIGHT - gestureState.dy
          : COLLAPSED_HEIGHT - gestureState.dy;

        // Determine whether to expand or collapse based on position and velocity
        let shouldExpand = false;
        
        if (Math.abs(velocity) > 0.5) {
          // If swiping fast, use velocity to determine direction
          shouldExpand = velocity < 0;
        } else {
          // If swiping slow, use position
          shouldExpand = currentHeight > (EXPANDED_HEIGHT + COLLAPSED_HEIGHT) / 2;
        }

        // Animate to final position
        Animated.spring(animatedHeight, {
          toValue: shouldExpand ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
          velocity: velocity,
          useNativeDriver: false,
        }).start();

        setIsExpanded(shouldExpand);
        lastGestureDy.current = 0;
      },
    })
  ).current;

  useEffect(() => {
    if (!alert_id) {
      setError("Alert ID is missing.");
      return;
    }
    const fetchAlertDetails = async () => {
      try {
        const response = await fetch(`http://mnl911.atwebpages.com/get_alert_details.php?alert_id=${alert_id}`);
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          const data = {
            ...result.data,
            a_latitude: parseFloat(result.data.a_latitude),
            a_longitude: parseFloat(result.data.a_longitude)
          };
          setAlertDetails(data);
          setError(""); // Clear error on success
          
          // Capture the SOS received time when alert is first loaded
          const currentTime = getCurrentPhilippineTime();
          const timeParts = currentTime.split(', ');
          const datePart = timeParts[0];
          const timePart = timeParts[1].split(':').slice(0, 2).join(':');
          const capturedTime = `${datePart}, ${timePart}`;
          setSosReceivedTime(capturedTime);
          
          // Store in AsyncStorage for use in other screens
          await AsyncStorage.setItem(`sos_received_time_${alert_id}`, capturedTime);
          
        } else {
          throw new Error(result.error || "Failed to fetch alert details.");
        }
      } catch (e: any) {
        console.error("Error fetching alert details:", e);
        setError(`Failed to fetch alert details: ${e.message}`);
      }
    };
    fetchAlertDetails();
  }, [alert_id]);

  // --- NEW: Reverse geocode incident location if address is missing ---
  useEffect(() => {
    if (alertDetails && !alertDetails.a_address && alertDetails.a_latitude && alertDetails.a_longitude) {
      (async () => {
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude: alertDetails.a_latitude,
            longitude: alertDetails.a_longitude,
          });
          if (address && isMountedRef.current) {
            const formattedAddress = `${address.street || ''} ${address.name || ''}, ${address.city || ''}`.trim() || 'Address lookup failed';
            // Create a new object to avoid direct state mutation
            setAlertDetails(prevDetails => prevDetails ? { ...prevDetails, a_address: formattedAddress } : null);
          }
        } catch (e) {
          console.error("Failed to reverse geocode incident location:", e);
           if (isMountedRef.current) {
               setAlertDetails(prevDetails => prevDetails ? { ...prevDetails, a_address: 'Could not determine address' } : null);
           }
        }
      })();
    }
  }, [alertDetails]);

  useEffect(() => {
    let locationInterval: number;
    const fetchAndSendLocation = async () => {
      try {
        // Request permission if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        // Use faster location accuracy for emergency response
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Faster than BestForNavigation
        });
        if (!isMountedRef.current) return;
        const accuracy = loc.coords.accuracy ?? 9999;
        setLocationAccuracy(accuracy);
        if (accuracy > 25 && !hasShownAccuracyWarning.current) {
          setShowAccuracyModal(true);
          hasShownAccuracyWarning.current = true;
        }
        const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        console.log('Fetched officer location:', coords.lat, coords.lng); // Debug log
        setOfficerLocation(coords);
        // Send to backend
        const policeId = await AsyncStorage.getItem('police_id');
        if (policeId && alert_id) {
          console.log('Sending officer location to backend:', coords.lat, coords.lng); // Debug log
          const response = await fetch('http://mnl911.atwebpages.com/update_police_location.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              police_id: policeId,
              alert_id,
              latitude: coords.lat,
              longitude: coords.lng
            })
          });
          if (!response.ok) {
            // Silently log error, as this is a background task
            console.error(`Failed to update police location: Server responded with status ${response.status}`);
          }
        }
      } catch (e: any) {
        // Silently log error
        console.error("Error sending officer location:", e.message);
      }
    };
    // Initial fetch
    fetchAndSendLocation();
    // Repeat every 10 seconds (reduced from 20 for faster updates)
    locationInterval = setInterval(fetchAndSendLocation, 10000) as unknown as number;
    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [alert_id]);

  // Fetch latest police officer location from backend
  useEffect(() => {
    const fetchOfficerLocation = async () => {
      const policeId = await AsyncStorage.getItem('police_id');
      if (!policeId || !alert_id) return;
      try {
        const res = await fetch(`http://mnl911.atwebpages.com/get_police_location.php?police_id=${policeId}&alert_id=${alert_id}`);
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        const data = await res.json();
        if (data.success && data.location && isMountedRef.current) {
          setOfficerLocation({ lat: parseFloat(data.location.latitude), lng: parseFloat(data.location.longitude) });
          setError(''); // Clear error on success
        } else if (!data.success) {
          // Don't throw an error, but log it, as it might be a temporary issue.
          console.warn(`Could not get police location: ${data.error}`);
        }
      } catch (e: any) {
        console.error("Error fetching officer location:", e.message);
        setError(`Failed to get officer location: ${e.message}`);
      }
    };
    fetchOfficerLocation();
    const interval = setInterval(fetchOfficerLocation, 10000); // Reduced from 20000 to 10000
    return () => {
      clearInterval(interval);
    };
  }, [alert_id]);

  useEffect(() => {
    if (officerLocation) {
      // Reverse geocode officer location
      (async () => {
        try {
          const [address] = await Location.reverseGeocodeAsync({ latitude: officerLocation.lat, longitude: officerLocation.lng });
          if (address) {
            setOfficerAddress(`${address.street || ''} ${address.name || ''}, ${address.city || ''}`.trim());
          } else {
            setOfficerAddress('Unknown location');
          }
        } catch {
          setOfficerAddress('Unknown location');
        }
      })();
    }
  }, [officerLocation]);

  // --- NEW, SIMPLIFIED ROUTE CALCULATION ---
  useEffect(() => {
    if (!officerLocation || !alertDetails) {
      console.log("DEBUG: Waiting for officer location and alert details to calculate route.");
      return;
    }

    const calculateRoute = async () => {
      if (!isMountedRef.current) return;

      try {
        const apiUrl = "https://djikstra-calculation.onrender.com/calculate_route";
        const payload = {
          start: {
            lat: officerLocation.lat,
            lng: officerLocation.lng,
          },
          end: {
            lat: Number(alertDetails.a_latitude),
            lng: Number(alertDetails.a_longitude),
          },
        };
        
        console.log("Calling YOUR backend to calculate route...", payload);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (data.success && data.route && data.route.length > 0) {
          console.log(`Successfully calculated route with ${data.route.length} points.`);
          setRouteCoords(data.route);
          setError("");
        } else {
          // The backend might return an empty array or a specific message
          const reason = data.error || data.message || "No route found.";
          throw new Error(reason);
        }
      } catch (e: any) {
        console.error("Route calculation failed:", e.message);
        setError(`Failed to get route: ${e.message}`);
        setRouteCoords(null); 
      }
    };

    calculateRoute(); // Initial calculation
    const routeUpdateInterval = setInterval(calculateRoute, 20000); // Recalculate every 20 seconds

    return () => {
      clearInterval(routeUpdateInterval);
    };
  }, [officerLocation, alertDetails]);

  // Stop route calculation if navigated away or resolved
  useEffect(() => {
    return () => {
      if (routeIntervalRef.current) clearInterval(routeIntervalRef.current);
    };
  }, []);

  const getFormattedTime = (dateString: string) => {
    // Always show current Philippine time instead of database time
    const currentTime = getCurrentPhilippineTime();
    console.log('Current Philippine time:', currentTime);
    
    // Extract just the date and time parts (remove seconds)
    const timeParts = currentTime.split(', ');
    const datePart = timeParts[0];
    const timePart = timeParts[1].split(':').slice(0, 2).join(':'); // Remove seconds
    
    const formattedTime = `${datePart}, ${timePart}`;
    console.log('Formatted current time (military):', formattedTime);
    
    return formattedTime;
  };

  // Add debug log before render
  console.log('RENDER officerLocation:', officerLocation, 'routeCoords:', routeCoords, 'error:', error);

  // --- Improved error display logic ---
  const shouldShowError = !!error && (!officerLocation || !routeCoords);

  // Calculate distance to incident (in meters)
  let distanceToIncident = null;
  if (officerLocation && alertDetails) {
    distanceToIncident = haversine(
      officerLocation.lat,
      officerLocation.lng,
      Number(alertDetails.a_latitude),
      Number(alertDetails.a_longitude)
    ) * 1000; // haversine returns km, convert to meters
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: currentTheme.background }]}> 
        <Text style={{ color: currentTheme.statusResolved }}>{error}</Text>
      </View>
    );
  }

  if (!alertDetails) {
    return (
      <View style={[styles.centered, { backgroundColor: currentTheme.background }]}> 
        <ActivityIndicator size="large" color={currentTheme.iconBackground} />
        <Text style={{ color: currentTheme.text }}>Loading incident details...</Text>
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
          routeCoords={routeCoords ?? undefined}
          officerLocation={officerLocation ?? undefined}
          incidentLocation={
            alertDetails
              ? {
                  lat: alertDetails.a_latitude,
                  lng: alertDetails.a_longitude,
                }
              : undefined
          }
          hideControls={true}
        />
      </View>
      <Animated.View 
        style={[
          styles.infoCard, 
          { 
            backgroundColor: currentTheme.cardBackground,
            height: animatedHeight,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }
        ]}
      >
        <View {...panResponder.panHandlers}>
          <DragHandleIcon />
        </View>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={isExpanded}
        >
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#222' }]}>Incident Map</Text>
          <Text style={[styles.instructions, { color: isDarkMode ? currentTheme.subtitle : '#333' }]}>Navigate to the incident location and follow the route for the fastest response.</Text>
          <View style={styles.infoRow}>
            <PinIcon color="#E02323" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Incident Address</Text>
              <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' }]}>{alertDetails.a_address || 'Unknown address'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <PersonPinIcon color="#E02323" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Your Location</Text>
              <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' }]}>{officerAddress}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <ClockIcon color="#E02323" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Estimated Time Arrival</Text>
              <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' }]}> 
                {getETA(routeCoords) !== null ? `${getETA(routeCoords)} minutes` : 'Calculating...'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <CalendarIcon color="#E02323" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Current Time (PH)</Text>
              <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' }]}>{getFormattedTime(alertDetails.a_created)}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <UserIcon color="#E02323" />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Victim</Text>
              <Text style={[styles.value, { color: isDarkMode ? currentTheme.subtitle : '#444' }]}>{`${alertDetails.f_name} ${alertDetails.l_name} (${alertDetails.m_number})`}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, distanceToIncident !== null && distanceToIncident > 10000 ? { backgroundColor: '#ccc' } : {}]}
            onPress={async () => {
              if (distanceToIncident !== null && distanceToIncident <= 10000) {
                try {
                  const response = await fetch('http://mnl911.atwebpages.com/status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=arrived&alert_id=${alert_id}`
                  });
                  const data = await response.json();
                  if (!data.success) {
                    alert('Failed to update status: ' + (data.error || 'Unknown error'));
                    return;
                  }
                  // Navigate to ArrivedStep only if update is successful
                  router.push(`/police-officer/incident-response/ArrivedStep?alert_id=${alert_id}`);
                } catch (err: any) {
                  console.error('Arrived error:', err);
                  alert('Network error: ' + ((err as Error).message || err));
                }
              }
            }}
            disabled={distanceToIncident === null || distanceToIncident > 10000}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>You've Arrived</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
      <Modal
        visible={showAccuracyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccuracyModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: currentTheme.modalOverlay, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: currentTheme.cardBackground, borderRadius: 16, padding: 24, alignItems: 'center', maxWidth: 320 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: currentTheme.iconBackground, marginBottom: 12 }}>Location Accuracy Warning</Text>
            <Text style={{ color: currentTheme.text, fontSize: 15, marginBottom: 16, textAlign: 'center' }}>
              Your current location accuracy is {locationAccuracy ? locationAccuracy.toFixed(1) : '?'} meters, which may not be sufficient for incident response.
              {'\n'}
              Please enable "High accuracy" mode in your device's location settings (Settings → Location → Mode → High accuracy) and ensure you have a clear view of the sky.
            </Text>
            <TouchableOpacity style={{ backgroundColor: currentTheme.iconBackground, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }} onPress={() => setShowAccuracyModal(false)}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoCard: { 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  instructions: { fontSize: 14, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  infoTextContainer: {
    marginLeft: 16
  },
  label: { fontSize: 14, marginTop: 12 },
  value: { fontSize: 16, fontWeight: 'bold' },
  button: {
    marginTop: 8,
    backgroundColor: '#E02323',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});