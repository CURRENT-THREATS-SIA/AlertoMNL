import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as TaskManager from 'expo-task-manager';
import { Mic } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Platform, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import WaveformVisualizer from "../../components/WaveformVisualizer";
import { theme, useTheme } from "../../context/ThemeContext";
import { useVoiceRecords } from "../../context/VoiceRecordContext";

// --- API URLs ---
const API_TRIGGER_SOS_URL = 'http://mnl911.atwebpages.com/sosnotify.php';
const API_UPLOAD_AUDIO_URL = 'http://mnl911.atwebpages.com/upload_audio.php';
const API_CANCEL_SOS_URL = 'http://mnl911.atwebpages.com/cancel_sos_alert.php';
const API_CHECK_STATUS_URL = 'http://mnl911.atwebpages.com/check_sos_status.php';

type SOSState = 'idle' | 'countdown' | 'active' | 'received' | 'resolved';

// Define the background location task
TaskManager.defineTask('background-location-task', async ({ data, error }: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    // Handle background location update
    console.log('Background location update:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: new Date(location.timestamp).toISOString(),
    });
  }
  return null; // Explicitly return a Promise that resolves to null
});

export default function RegularUserHome() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("Fetching location...");
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [manualRecording, setManualRecording] = useState<Audio.Recording | null>(null);
  const { addRecord } = useVoiceRecords();
  const [sosState, setSosState] = useState<SOSState>('idle');
  const [currentAlertId, setCurrentAlertId] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sosDisabledUntil, setSosDisabledUntil] = useState<number | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const [hideSOS, setHideSOS] = useState(false);
  const [sosDelay, setSosDelay] = useState(3); // default to 3 seconds
  const cancelCountdownRef = useRef(false);

  // Animated values for rings
  const ring1Anim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;
  const ring3Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    if (sosState === 'active' || sosState === 'received' || sosState === 'resolved') {
      // Looping pulse animation for each ring, staggered
      animation = Animated.loop(
        Animated.stagger(400, [
          Animated.sequence([
            Animated.timing(ring1Anim, { toValue: 1.25, duration: 1200, useNativeDriver: true }),
            Animated.timing(ring1Anim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ring2Anim, { toValue: 1.25, duration: 1200, useNativeDriver: true }),
            Animated.timing(ring2Anim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(ring3Anim, { toValue: 1.25, duration: 1200, useNativeDriver: true }),
            Animated.timing(ring3Anim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
      animation.start();
    } else {
      ring1Anim.setValue(1);
      ring2Anim.setValue(1);
      ring3Anim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [sosState]);

  useFocusEffect(
    React.useCallback(() => {
      // Reload settings
      AsyncStorage.getItem('hideSOSButton').then(val => {
        setHideSOS(val === '1');
      });
      AsyncStorage.getItem('sosDelay').then(val => {
        setSosDelay(val ? Number(val) : 3);
      });

      // Reset SOS state and related UI
      setSosState('idle');
      setCountdown(null);
      setIsSendingSOS(false);
      setCurrentAlertId(null);

      // Optionally clear polling interval if needed
      if (pollingRef.current) clearInterval(pollingRef.current);

      // Optionally reset other state if needed
    }, [])
  );

  // --- AGGRESSIVE CLEANUP FUNCTION WITH FORCED PAUSE ---
  const ensureAudioIsFree = async () => {
    console.log("Forcing audio session to be free...");
    if (manualRecording) {
      console.log("Found an active manual recording object. Unloading it.");
      try {
        await manualRecording.stopAndUnloadAsync();
      } catch (error) {
        console.log("Ignoring error during manual unload (it might be free already).");
      }
    }
    setManualRecording(null);
    setIsRecording(false);
    
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
    });
    
    // --- THE CRITICAL FIX ---
    // Add a 100ms pause to give the native audio system time to fully release resources.
    console.log("Pausing for 100ms to resolve race condition...");
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("Resume execution. Audio should now be free.");
  };

  // --- LOCATION & PERMISSION LOGIC ---
  useEffect(() => {
    const initializeLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for this app.');
        return;
      }
      await Audio.requestPermissionsAsync();
      await getQuickInitialLocation();
      if (Platform.OS !== 'web') {
        startLocationUpdates();
      }
    };
    initializeLocation();
    return () => { 
      if (Platform.OS !== 'web') {
        stopLocationUpdates(); 
      }
    };
  }, []);

  const getQuickInitialLocation = async () => {
    try {
      // Request background location permission for better tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        console.log('Background location permission granted');
      }

      // Configure location task for background updates
      await Location.startLocationUpdatesAsync('background-location-task', {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000, // Update every 3 seconds
        distanceInterval: 3, // or if moved 3 meters
        deferredUpdatesInterval: 3000, // Minimum time between updates
        deferredUpdatesDistance: 3, // Minimum distance between updates
        foregroundService: {
          notificationTitle: 'Location Tracking',
          notificationBody: 'Tracking your location for emergency services',
        },
        pausesUpdatesAutomatically: false,
      });

      // Watch position with high accuracy for foreground updates
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 3000,
          distanceInterval: 3,
        },
        async (newLocation) => {
          setLocation(newLocation);
          try {
            // Reverse geocode with more detailed options
            const addresses = await Location.reverseGeocodeAsync({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
            
            if (addresses && addresses[0]) {
              const address = addresses[0];
              const formattedAddress = [
                address.street,
                address.district,
                address.subregion,
                address.city
              ].filter(Boolean).join(', ');
              
              setLocationAddress(formattedAddress || 'Location found');
            }
          } catch (error) {
            console.error('Error getting address:', error);
            setLocationAddress('Location found (address unavailable)');
          }
        }
      );

      return () => {
        // Cleanup location tracking
        subscription.remove();
        Location.stopLocationUpdatesAsync('background-location-task');
      };
    } catch (error) {
      console.error('Error starting location updates:', error);
      Alert.alert('Error', 'Failed to start location tracking. Please check your permissions and try again.');
    }
  };

  const stopLocationUpdates = () => {
    if (locationSubscriptionRef.current && Platform.OS !== 'web') {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
    Location.stopLocationUpdatesAsync('background-location-task')
      .catch(error => console.log('Error stopping location updates:', error));
  };

  const startRecording = async () => {
    try {
      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        // Add the recording to the voice records
        addRecord({
          id: Date.now().toString(),
          title: `Emergency Recording ${new Date().toLocaleDateString()}`,
          duration: '1:30', // You would need to calculate actual duration
          date: new Date().toLocaleDateString(),
          uri: uri,
        });
      }
    } catch (error) {
      console.error("Could not get initial location:", error);
      setLocationAddress("Could not fetch location.");
    }
  };

  const startLocationUpdates = async () => {
    if (Platform.OS === 'web') {
      // For web, just get the location once
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(location);
      try {
        const addresses = await Location.reverseGeocodeAsync(location.coords);
        if (addresses && addresses[0]) {
          setLocationAddress(formatAddress(addresses[0]));
        }
      } catch (error) { /* handle error */ }
      return;
    }

    const subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      async (newLocation) => {
        setLocation(newLocation);
        try {
          const addresses = await Location.reverseGeocodeAsync(newLocation.coords);
          if (addresses && addresses[0]) {
            setLocationAddress(formatAddress(addresses[0]));
          }
        } catch (error) { /* handle error */ }
      }
    );
    locationSubscriptionRef.current = subscription;
  };

  const formatAddress = (address: Location.LocationGeocodedAddress) => {
    const addressParts = [];
    let streetPart = address.street || '';
    if (address.name && streetPart && !address.name.includes(streetPart)) {
        streetPart = `${address.name} ${streetPart}`;
    } else if (address.name && !streetPart) {
        streetPart = address.name;
    }
    if (streetPart) addressParts.push(streetPart);
    if (address.district) addressParts.push(address.district);
    if (address.city && address.city.toLowerCase() !== address.district?.toLowerCase()) {
        addressParts.push(address.city);
    } else if (address.district) {
        addressParts.push("Manila");
    }
    let finalAddress = addressParts.join(', ');
    if (address.postalCode) finalAddress += ` ${address.postalCode}`;
    return finalAddress;
  };

  // --- UPLOADING LOGIC ---
  const uploadAudio = async (uri: string, alertId: number) => {
    const formData = new FormData();
    formData.append('alert_id', alertId.toString());
    formData.append('audioFile', { uri, name: `sos_audio_${alertId}.m4a`, type: 'audio/m4a' } as any);
    try {
      await fetch(API_UPLOAD_AUDIO_URL, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } });
      console.log("Audio upload request sent for alert ID:", alertId);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  // --- RECORDING LOGIC ---
  const recordAndUploadAudio = async (alertId: number) => {
    setIsRecording(true);
    let recordingObject: Audio.Recording | null = null;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingObject = recording;
      await new Promise(resolve => setTimeout(resolve, 30000));
    } catch (error) {
      console.error('Error during SOS recording process:', error);
    } finally {
      if (recordingObject) {
        try {
          await recordingObject.stopAndUnloadAsync();
          const uri = recordingObject.getURI();
          if (uri) uploadAudio(uri, alertId);
        } catch (e) { console.error("Error stopping SOS recording:", e) }
      }
      setIsRecording(false);
    }
  };
  
  const startManualRecording = async () => {
    await ensureAudioIsFree();
    try {
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setManualRecording(recording);
    } catch (err) {
      console.error('Failed to start manual recording', err);
      setIsRecording(false);
    }
  };

  const stopManualRecording = async () => {
    if (!manualRecording) return;
    try {
      await manualRecording.stopAndUnloadAsync();
      const uri = manualRecording.getURI();
      if (uri) {
        addRecord({
          id: Date.now().toString(),
          title: `Manual Recording ${new Date().toLocaleDateString()}`,
          duration: 'N/A', date: new Date().toLocaleDateString(), uri,
        });
        Alert.alert("Recording Saved");
      }
    } catch(error) {
      console.error('Failed to stop manual recording', error);
    } finally {
      setManualRecording(null);
      setIsRecording(false);
    }
  };

  // Poll for police acceptance and resolution
  useEffect(() => {
    if ((sosState === 'active' || sosState === 'received' || sosState === 'resolved') && currentAlertId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_CHECK_STATUS_URL}?alert_id=${currentAlertId}`);
          const json = await res.json();
          if (json.status === 'active') {
            setSosState('received');
          } else if (json.status === 'resolved') {
            setSosState('resolved');
          } else if (json.status === 'cancelled') {
            setSosState('idle');
            setCurrentAlertId(null);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch (e) {
          console.log("Polling error:", e);
        }
      }, 3000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [sosState, currentAlertId]);

  // --- MAIN SOS HANDLER ---
  const handleSOS = async () => {
    if (isSendingSOS || (sosDisabledUntil && Date.now() < sosDisabledUntil)) return;
    await ensureAudioIsFree();
    cancelCountdownRef.current = false; // Reset before starting
    setIsSendingSOS(true);
    setSosState('countdown');
    setCountdown(sosDelay);
    for (let i = sosDelay; i > 0; i--) {
      if (cancelCountdownRef.current) {
        setIsSendingSOS(false);
        setCountdown(null);
        setSosState('idle');
        return; // Exit early if cancelled
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }
    Vibration.vibrate(500);
    try {
      const nuserId = await AsyncStorage.getItem('nuser_id');
      if (!nuserId) throw new Error('User ID not found.');
      let currentLocation = location;
      if (!currentLocation) currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(currentLocation);
      const formData = new FormData();
      formData.append('nuser_id', nuserId);
      formData.append('a_latitude', currentLocation.coords.latitude.toString());
      formData.append('a_longitude', currentLocation.coords.longitude.toString());
      formData.append('location_address', locationAddress);
      const response = await fetch(API_TRIGGER_SOS_URL, { method: 'POST', body: formData });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to create SOS alert.');
      setCurrentAlertId(data.alert_id);
      setSosState('active');
      Alert.alert('SOS Triggered', 'Voice recording will automatically start for 30 seconds.');
      // Send SMS to contacts
      const emergencyMessage = `This is an SOS! I need help. My location: ${locationAddress}`;
      await sendSOSMessages(emergencyMessage);
      recordAndUploadAudio(data.alert_id);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send SOS.');
      setSosState('idle');
    } finally {
      setIsSendingSOS(false);
      setCountdown(null);
    }
  };

  // --- CANCEL/STOP SOS HANDLER ---
  const handleStop = async () => {
    if (!currentAlertId) return;
    try {
      const formData = new FormData();
      formData.append('alert_id', currentAlertId.toString());
      await fetch(API_CANCEL_SOS_URL, { method: 'POST', body: formData });
      // If STOP is pressed before police accept, show alert and disable SOS for 5 minutes
      if (sosState === 'active') {
        Alert.alert('SOS Stopped', 'You fully stopped your SOS initialization. You will be restricted from clicking it for 5 minutes.');
        setSosDisabledUntil(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to cancel SOS alert.');
    }
    setSosState('idle');
    setCurrentAlertId(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  };

  // --- Disable SOS button if restricted ---
  const isSosButtonDisabled =
    !!(isSendingSOS || !location || sosState === 'received' || sosState === 'countdown' ||
    (sosDisabledUntil && Date.now() < sosDisabledUntil));

  const sendSOSMessages = async (message: string) => {
    try {
      const nuser_id = await AsyncStorage.getItem('nuser_id');
      if (!nuser_id) {
        console.log('No nuser_id');
        return;
      }
      const response = await fetch(`http://mnl911.atwebpages.com/get_contacts1.php?nuser_id=${nuser_id}`);
      const data = await response.json();
      console.log('Contacts fetch result:', data);
      if (data.success && data.contacts && data.contacts.length > 0) {
        const phoneNumbers = data.contacts.map((c: any) => String(c.contact_number));
        console.log('Phone numbers:', phoneNumbers);
        const isAvailable = await SMS.isAvailableAsync();
        console.log('SMS available:', isAvailable);
        if (isAvailable) {
          await SMS.sendSMSAsync(phoneNumbers, message);
          console.log('SMS sendSMSAsync called');
        } else {
          Alert.alert('SMS is not available on this device');
          console.log('SMS not available');
        }
      } else {
        console.log('No contacts or fetch failed');
      }
    } catch (e) {
      console.log('SMS error:', e);
      Alert.alert('Failed to send SMS to contacts');
    }
  };

  // --- JSX / RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.mainContent}>
        <View style={styles.sosSection}>
          <View style={styles.helpText}>
            <Text style={[styles.helpTextPrimary, { color: currentTheme.text }]}>Help is just a click away!</Text>
            <Text style={[styles.helpTextSecondary, { color: currentTheme.text }]}>Click <Text style={styles.redText}>SOS button</Text> to call for help.</Text>
          </View>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={
              sosState === 'active' ? handleStop :
              sosState === 'countdown' ? undefined :
              handleSOS
            }
            disabled={isSosButtonDisabled}
          >
            <Animated.View
              style={[
                styles.sosRing1,
                sosState === 'received' && styles.greenRing1,
                sosState === 'resolved' && styles.blueRing1,
                { transform: [{ scale: ring1Anim }] }
              ]}
            />
            <Animated.View
              style={[
                styles.sosRing2,
                sosState === 'received' && styles.greenRing2,
                sosState === 'resolved' && styles.blueRing2,
                { transform: [{ scale: ring2Anim }] }
              ]}
            />
            <Animated.View
              style={[
                styles.sosRing3,
                sosState === 'received' && styles.greenRing3,
                sosState === 'resolved' && styles.blueRing3,
                { transform: [{ scale: ring3Anim }] }
              ]}
            />
            <View style={[
              styles.sosCenter,
              sosState === 'received' && styles.greenCenter,
              sosState === 'resolved' && styles.blueCenter,
              (!location && !isSendingSOS) && styles.sosCenterDisabled
            ]}>
              {!hideSOS && (
                sosState === 'countdown' ? (
                  <View style={styles.countdownContainer}>
                    <Text style={styles.countdownText}>{countdown}</Text>
                    <Text style={styles.countdownLabel}>seconds</Text>
                  </View>
                ) : sosState === 'active' ? (
                  <Text style={styles.sosText}>STOP</Text>
                ) : sosState === 'received' ? (
                  <Text style={styles.sosText}>RECEIVED</Text>
                ) : sosState === 'resolved' ? (
                  <Text style={styles.sosText}>RESOLVED</Text>
                ) : isSendingSOS ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : !location ? (
                  <View style={styles.countdownContainer}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.locatingText}>Locating...</Text>
                  </View>
                ) : (
                  <Text style={styles.sosText}>SOS</Text>
                )
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.locationInfo}>
            <Text style={[styles.locationText, { color: currentTheme.text }]}>{locationAddress}</Text>
            <Text style={[styles.coordinatesText, { color: currentTheme.text }]}>
              <Text style={styles.redText}>Latitude: </Text><Text style={[styles.boldText, { color: currentTheme.text }]}>{location?.coords.latitude.toFixed(4) || '---'}</Text>
              <Text style={styles.redText}>  Longitude: </Text><Text style={[styles.boldText, { color: currentTheme.text }]}>{location?.coords.longitude.toFixed(4) || '---'}</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[
            styles.voiceButton, 
            isRecording && styles.voiceButtonRecording,
            { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffd8d8' }
          ]} 
          onPress={manualRecording ? stopManualRecording : startManualRecording} 
          disabled={isSendingSOS || isRecording}
        >
          <View style={styles.voiceButtonContent}>
            {isRecording ? (
              <>
                <MaterialIcons name="stop-circle" size={24} color="#ffffff" />
                <View style={styles.waveformContainer}><WaveformVisualizer isRecording={isRecording} /></View>
              </>
            ) : (
              <View style={styles.voiceButtonInner}>
                <Mic size={24} color="#e02323" />
                <Text style={[styles.voiceButtonText, { color: isDarkMode ? '#fff' : '#e02323' }]}>Voice Recording</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {(sosState === 'countdown') && (
          <TouchableOpacity
            style={[
              styles.voiceButton,
              { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffd8d8', marginTop: 12 }
            ]}
            onPress={() => {
              cancelCountdownRef.current = true;
              setSosState('idle');
              setCountdown(null);
              setIsSendingSOS(false);
            }}
          >
            <View style={styles.voiceButtonContent}>
              <View style={styles.voiceButtonInner}>
                <MaterialIcons name="cancel" size={24} color="#e02323" />
                <Text style={[styles.voiceButtonText, { color: '#e02323' }]}>Cancel</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// --- Styles (Same as your original) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  sosSection: {
    alignItems: "center",
  },
  helpText: {
    alignItems: "center",
    gap: 4,
  },
  helpTextPrimary: {
    fontSize: 14,
  },
  helpTextSecondary: {
    fontSize: 14,
  },
  redText: {
    color: "#e02323",
    fontWeight: "bold",
  },
  boldText: {
    color: "#424b5a",
    fontWeight: "bold",
  },
  sosButton: {
    width: 317,
    height: 317,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  sosRing1: {
    position: "absolute",
    width: 317,
    height: 317,
    borderRadius: 158.5,
    backgroundColor: "#fae8e9", // lightest red
  },
  sosRing2: {
    position: "absolute",
    width: 293,
    height: 293,
    borderRadius: 146.5,
    backgroundColor: "#f9d2d2", // lighter red
  },
  sosRing3: {
    position: "absolute",
    width: 267,
    height: 267,
    borderRadius: 133.5,
    backgroundColor: "#f2a6a6", // light red
  },
  sosCenter: {
    width: 231,
    height: 231,
    borderRadius: 120.5,
    backgroundColor: "#e02323", // main red
    alignItems: "center",
    justifyContent: "center",
  },
  // Green palette for RECEIVED state
  greenRing1: {
    backgroundColor: "#e6faea"
  }, // lightest green
  greenRing2: {
    backgroundColor: "#c8f4d6"
  }, // lighter green
  greenRing3: {
    backgroundColor: "#a0eec2"
  }, // light green
  greenCenter: {
    backgroundColor: "#10C86E" // aggressive green to match police accept button
  }, // main green
  sosCenterDisabled: {
    backgroundColor: '#a0a0a0', // Greyed out color when disabled
  },
  locatingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  sosCenterPressed: {
    backgroundColor: "#b01c1c",
  },
  sosText: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
  },
  locationInfo: {
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
  },
  coordinatesText: {
    fontSize: 14,
  },
  voiceButton: {
    backgroundColor: "#ffd8d8",
    borderRadius: 16,
    marginTop: 20,
    overflow: 'hidden',
    minHeight: 45,
  },
  voiceButtonRecording: {
    backgroundColor: "#e02323",
  },
  voiceButtonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 45,
  },
  voiceButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceButtonText: {
    color: "#e02323",
    fontSize: 12,
  },
  waveformContainer: {
    flex: 1,
    marginLeft: 12,
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  countdownLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  blueRing1: {
    backgroundColor: '#e6f0fa'
  }, // lightest blue
  blueRing2: {
    backgroundColor: '#c8e0f4'
  }, // lighter blue
  blueRing3: {
    backgroundColor: '#a0c2ee'
  }, // light blue
  blueCenter: {
    backgroundColor: '#2196F3' // main blue
  },
});