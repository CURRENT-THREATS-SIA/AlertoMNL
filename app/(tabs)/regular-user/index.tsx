import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as TaskManager from 'expo-task-manager';
import { Mic } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Dimensions, Easing, Linking, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import WaveformVisualizer from "../../components/WaveformVisualizer";
import { useSos } from '../../context/SosContext';
import { theme, useTheme } from "../../context/ThemeContext";
import { useVoiceRecords } from "../../context/VoiceRecordContext";
import Profile from './Profile';

// --- API URLs ---
const API_TRIGGER_SOS_URL = 'http://mnl911.atwebpages.com/sosnotify.php';
const API_UPLOAD_AUDIO_URL = 'http://mnl911.atwebpages.com/upload_audio.php';
const API_CANCEL_SOS_URL = 'http://mnl911.atwebpages.com/cancel_sos_alert.php';
const API_CHECK_STATUS_URL = 'http://mnl911.atwebpages.com/check_sos_status.php';

type SOSState = 'idle' | 'countdown' | 'active' | 'received' | 'arrived' | 'resolved';

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

interface RegularUserHomeProps {
  sosState: SOSState;
  setSosState: React.Dispatch<React.SetStateAction<SOSState>>;
}

export default function RegularUserHome() {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const { sosState, setSosState, location, locationAddress, isRecording, isSendingSOS, countdown, setCountdown, startSOS, stopSOS, startManualRecording, stopManualRecording } = useSos();
  const [hasStoppedManualRecording, setHasStoppedManualRecording] = useState(false); // ← ADD HERE
  const [manualRecording, setManualRecording] = useState<Audio.Recording | null>(null);
  const { addRecord } = useVoiceRecords();
  const [currentAlertId, setCurrentAlertId] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sosDisabledUntil, setSosDisabledUntil] = useState<number | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const [hideSOS, setHideSOS] = useState(false);
  const [sosDelay, setSosDelay] = useState(3); // default to 3 seconds
  const cancelCountdownRef = useRef(false);
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [showCrimeMap, setShowCrimeMap] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // --- Refs for managing the automatic SOS recording ---
  const sosRecordingRef = useRef<Audio.Recording | null>(null);

  // Animated values for rings
  const ring1Anim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;
  const ring3Anim = useRef(new Animated.Value(1)).current;

  const screenWidth = Dimensions.get('window').width;
  const sosButtonSize = Math.min(screenWidth * 0.7, 300); // 70% of width, max 300px
  const ring1Size = sosButtonSize + 20;
  const ring2Size = sosButtonSize;
  const ring3Size = sosButtonSize - 15;
  const sosCenterSize = sosButtonSize - 40;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    if (sosState === 'active' || sosState === 'received' || sosState === 'arrived' || sosState === 'resolved') {
      // Looping pulse animation for each ring, staggered
      const createPulseAnimation = (animValue: Animated.Value) =>
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]);

      animation = Animated.loop(
        Animated.stagger(300, [
          createPulseAnimation(ring1Anim),
          createPulseAnimation(ring2Anim),
          createPulseAnimation(ring3Anim),
        ])
      );
      animation.start();
    } else {
      // Gently spring back to 1 when not active
      Animated.parallel([
        Animated.spring(ring1Anim, { toValue: 1, useNativeDriver: true, tension: 50 }),
        Animated.spring(ring2Anim, { toValue: 1, useNativeDriver: true, tension: 50 }),
        Animated.spring(ring3Anim, { toValue: 1, useNativeDriver: true, tension: 50 }),
      ]).start();
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [sosState, ring1Anim, ring2Anim, ring3Anim]);

  useFocusEffect(
    React.useCallback(() => {
      // Reload settings
      AsyncStorage.getItem('hideSOSButton').then(val => {
        setHideSOS(val === '1');
      });
      AsyncStorage.getItem('sosDelay').then(val => {
        setSosDelay(val ? Number(val) : 3);
      });
      AsyncStorage.getItem('testModeEnabled').then(val => {
        setTestModeEnabled(val === 'true');
      });

      // Reset SOS state and related UI
      setSosState('idle');
      setCountdown(null);
      // setIsSendingSOS(false); // REMOVED
      setCurrentAlertId(null);

      // Optionally clear polling interval if needed
      if (pollingRef.current) clearInterval(pollingRef.current);

      // Optionally reset other state if needed
    }, [])
  );

  useEffect(() => {
    if (!testModeEnabled || sosState === 'idle' || sosState === 'countdown') {
        return;
    }

    // This effect handles the simulation flow after countdown
    let timer: ReturnType<typeof setTimeout>;
    if (sosState === 'active') {
        console.log("Test Mode: SOS Active, transitioning to received in 5s");
        timer = setTimeout(() => setSosState('received'), 5000);
    } else if (sosState === 'received') {
        console.log("Test Mode: Police Received, transitioning to arrived in 5s");
        timer = setTimeout(() => setSosState('arrived'), 5000);
    } else if (sosState === 'arrived') {
        console.log("Test Mode: Police Arrived, transitioning to resolved in 5s");
        timer = setTimeout(() => setSosState('resolved'), 5000);
    } else if (sosState === 'resolved') {
        console.log("Test Mode: Incident Resolved, transitioning to idle in 3s");
        timer = setTimeout(() => {
            setSosState('idle');
            // setIsSendingSOS(false); // REMOVED
        }, 3000);
    }
      
    return () => clearTimeout(timer); // Cleanup on unmount or if sosState changes

  }, [sosState, testModeEnabled]);

  // --- NEW: Auto-reset SOS button after resolved in real mode ---
  useEffect(() => {
    if (!testModeEnabled && sosState === 'resolved') {
      const handleResolved = async () => {
        // --- NEW: Stop and upload automatic recording on resolution ---
        if (sosRecordingRef.current && currentAlertId) {
          console.log("SOS Resolved. Stopping and uploading any active SOS recording.");
          // This function handles stopping the recording and uploading the file.
          await stopAndUploadSosRecording(currentAlertId);
        }

        if (manualRecording) {
          try {
            await manualRecording.stopAndUnloadAsync();
            const uri = manualRecording.getURI();
            if (uri) {
              addRecord({
                id: Date.now().toString(),
                title: `Auto-Stopped Recording`,
                duration: 'N/A',
                date: new Date().toLocaleDateString(),
                uri,
              });
            }
          } catch (err) {
            console.error('Error auto-stopping manual recording:', err);
          } finally {
            // setIsRecording(false); // REMOVED
            setHasStoppedManualRecording(true);
          }
        }
  
        const timer = setTimeout(() => {
          setSosState('idle');
          // setIsSendingSOS(false); // REMOVED
        }, 5000);
  
        return () => clearTimeout(timer);
      };
  
      handleResolved();
    }
  }, [sosState, testModeEnabled, currentAlertId]);

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
    // setIsRecording(false); // REMOVED
    
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
      if (backgroundStatus !== 'granted') {
        console.log('Background location permission not granted');
        Alert.alert(
          'Background Location Needed',
          'Please enable "Allow all the time" location permission in your device settings for full functionality.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        // Still try to get foreground location for basic functionality
        const foregroundLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
        // setLocation(foregroundLocation); // REMOVED
        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude: foregroundLocation.coords.latitude,
            longitude: foregroundLocation.coords.longitude,
          });
          if (addresses && addresses[0]) {
            const address = addresses[0];
            const formattedAddress = [
              address.street,
              address.district,
              address.subregion,
              address.city
            ].filter(Boolean).join(', ');
            // setLocationAddress(formattedAddress || 'Location found'); // REMOVED
          }
        } catch (error) {
          // setLocationAddress('Location found (address unavailable)'); // REMOVED
        }
        return;
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
          // setLocation(newLocation); // REMOVED
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
              // setLocationAddress(formattedAddress || 'Location found'); // REMOVED
            }
          } catch (error) {
            console.error('Error getting address:', error);
            // setLocationAddress('Location found (address unavailable)'); // REMOVED
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
      
      // setRecording(newRecording); // REMOVED
      // setIsRecording(true); // REMOVED
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    // if (!recording) return; // REMOVED

    try {
      // await recording.stopAndUnloadAsync(); // REMOVED
      // const uri = recording.getURI(); // REMOVED
      // setRecording(null); // REMOVED
      // setIsRecording(false); // REMOVED

      // if (uri) { // REMOVED
      //   // Add the recording to the voice records // REMOVED
      //   addRecord({ // REMOVED
      //     id: Date.now().toString(), // REMOVED
      //     title: `Emergency Recording ${new Date().toLocaleDateString()}`, // REMOVED
      //     duration: '1:30', // You would need to calculate actual duration // REMOVED
      //     date: new Date().toLocaleDateString(), // REMOVED
      //     uri: uri, // REMOVED
      //   }); // REMOVED
      // } // REMOVED
    } catch (error) {
      console.error("Could not get initial location:", error);
      // setLocationAddress("Could not fetch location."); // REMOVED
    }
  };

  const startLocationUpdates = async () => {
    if (Platform.OS === 'web') {
      // For web, just get the location once
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      // setLocation(location); // REMOVED
      try {
        const addresses = await Location.reverseGeocodeAsync(location.coords);
        if (addresses && addresses[0]) {
          // setLocationAddress(formatAddress(addresses[0])); // REMOVED
        }
      } catch (error) { /* handle error */ }
      return;
    }

    const subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 10 },
      async (newLocation) => {
        // setLocation(newLocation); // REMOVED
        try {
          const addresses = await Location.reverseGeocodeAsync(newLocation.coords);
          if (addresses && addresses[0]) {
            // setLocationAddress(formatAddress(addresses[0])); // REMOVED
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

  // --- NEW RECORDING LOGIC (REFACTORED) ---

  // Stops the automatic recording and uploads the file.
  // This is typically called by a timer.
  const stopAndUploadSosRecording = async (alertId: number) => {
    if (!sosRecordingRef.current) return;

    console.log("15-second timer elapsed. Stopping and uploading SOS recording.");
    try {
      await sosRecordingRef.current.stopAndUnloadAsync();
      const uri = sosRecordingRef.current.getURI();
      if (uri) {
        // Upload audio in background without blocking
        setTimeout(() => {
          uploadAudio(uri, alertId);
        }, 100);
      }
    } catch (e) {
      console.error("Error stopping and uploading SOS recording:", e);
    } finally {
      sosRecordingRef.current = null;
      // if (!manualRecording) { // Only turn off indicator if no other recording is active // REMOVED
      //   setIsRecording(false); // REMOVED
      // } // REMOVED
    }
  };

  // Starts the automatic 15-second SOS recording.
  const startSosRecording = async (alertId: number) => {
    if (sosRecordingRef.current) {
      console.warn("SOS recording already in progress. Aborting new one.");
      return;
    }

    // setIsRecording(true); // REMOVED
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      sosRecordingRef.current = recording;

      // The recording will now continue until the SOS is resolved or stopped manually.
      // The setTimeout has been removed.

    } catch (error) {
      console.error('Error starting SOS recording:', error);
      // setIsRecording(false); // Ensure this is reset on failure // REMOVED
      if (sosRecordingRef.current) {
        try { await sosRecordingRef.current.stopAndUnloadAsync(); } catch (e) { /* ignore */ }
        sosRecordingRef.current = null;
      }
    }
  };

  // --- RECORDING LOGIC ---
  const recordAndUploadAudio = async (alertId: number) => {
    // setIsRecording(true); // REMOVED
    let recordingObject: Audio.Recording | null = null;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingObject = recording;
      
      // Reduced recording time from 30 seconds to 15 seconds for faster response
      await new Promise(resolve => setTimeout(resolve, 15000));
    } catch (error) {
      console.error('Error during SOS recording process:', error);
    } finally {
      if (recordingObject) {
        try {
          await recordingObject.stopAndUnloadAsync();
          const uri = recordingObject.getURI();
          if (uri) {
            // Upload audio in background without blocking
            setTimeout(() => {
              uploadAudio(uri, alertId);
            }, 100);
          }
        } catch (e) { 
          console.error("Error stopping SOS recording:", e) 
        }
      }
      // setIsRecording(false); // REMOVED
    }
  };
  
  // Poll for police acceptance and resolution
  useEffect(() => {
    if ((sosState === 'active' || sosState === 'received' || sosState === 'arrived' || sosState === 'resolved') && currentAlertId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_CHECK_STATUS_URL}?alert_id=${currentAlertId}`);
          const json = await res.json();
          if (json.status === 'active') {
            setSosState('received');
          } else if (json.status === 'arrived') {
            setSosState('arrived');
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

  // --- NEW: Auto-send location updates when SOS is active ---
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (sosState === 'active' && currentAlertId && location) {
      const sendLocation = async () => {
        try {
          await fetch('http://mnl911.atwebpages.com/update_alert_location.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `alert_id=${currentAlertId}&latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`
          });
        } catch (e) {
          // Optionally log error
        }
      };
      sendLocation(); // Send immediately
      interval = setInterval(sendLocation, 5000) as unknown as NodeJS.Timeout;
    }
    return () => { if (interval) clearInterval(interval); };
  }, [sosState, currentAlertId, location]);

  // --- MAIN SOS HANDLER ---
  const handleSOS = async () => {
    cancelCountdownRef.current = false;
    if (testModeEnabled) {
      Alert.alert(
        'SOS Simulation',
        'Test Mode is active.\n\nThis is a simulation of the SOS feature. No actual alert will be sent to emergency services.\n\nVoice recording will automatically start for 30 seconds and SOS messages will be sent to your emergency contacts (simulation only).',
        [{ text: 'OK' }]
      );

      if (isSendingSOS) return;
      await ensureAudioIsFree();
      // setIsSendingSOS(true); // REMOVED
      setSosState('countdown');
      setCountdown(sosDelay);

      for (let i = sosDelay; i > 0; i--) {
        if (cancelCountdownRef.current) {
          // setIsSendingSOS(false); // REMOVED
          setCountdown(null);
          setSosState('idle');
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCountdown(i - 1);
      }
      Vibration.vibrate([200, 100, 200]);
      setSosState('active'); // Kick off the simulation effect
      return;
    }

    if (isSendingSOS || (sosDisabledUntil && Date.now() < sosDisabledUntil)) return;
    
    // setIsSendingSOS(true); // REMOVED
    setSosState('countdown');
    setCountdown(sosDelay);
    
    // Start countdown immediately
    for (let i = sosDelay; i > 0; i--) {
      if (cancelCountdownRef.current) {
        // setIsSendingSOS(false); // REMOVED
        setCountdown(null);
        setSosState('idle');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }
    
    // Immediately create SOS alert
    try {
      const nuserId = await AsyncStorage.getItem('nuser_id');
      if (!nuserId) throw new Error('User ID not found.');
      
      // Get location immediately with faster accuracy
      let currentLocation = location;
      if (!currentLocation) {
        currentLocation = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced
        });
      }
      
      // setLocation(currentLocation); // REMOVED
      
      // Create alert immediately
      const body = `nuser_id=${encodeURIComponent(nuserId)}&a_latitude=${encodeURIComponent(currentLocation.coords.latitude.toString())}&a_longitude=${encodeURIComponent(currentLocation.coords.longitude.toString())}&a_address=${encodeURIComponent(locationAddress)}`;
      
      console.log('🚨 SENDING SOS ALERT IMMEDIATELY...');
      
      // Send alert with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(API_TRIGGER_SOS_URL, { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Server error: ${response.status}. Body: ${errorBody}`);
      }
      
      const json = await response.json();
      if (json.success && json.alert_id) {
        setSosState('active');
        setCurrentAlertId(json.alert_id);
        // setIsSendingSOS(false); // REMOVED
        // Asynchronous background tasks
        startSosRecording(json.alert_id);
        sendSOSMessages(`Emergency! I'm at ${locationAddress}. Latitude: ${currentLocation.coords.latitude}, Longitude: ${currentLocation.coords.longitude}`);
        
      } else {
        throw new Error(json.message || 'Unknown server error.');
      }
    } catch (error) {
      console.error("SOS ERROR: ", error);
      Alert.alert('SOS Failed', 'Could not send alert. Please check your connection and try again.');
      setSosState('idle');
      // setIsSendingSOS(false); // REMOVED
      setCountdown(null);
    }
  };

  // --- CANCEL/STOP SOS HANDLER ---
  const handleStop = async () => {
    if (testModeEnabled) {
      Alert.alert('Simulation Stopped', 'You have stopped the SOS simulation.');
      setSosState('idle');
      // setIsSendingSOS(false); // REMOVED
      setCountdown(null);
      cancelCountdownRef.current = true;
      return;
    }

    if (currentAlertId) {
      try {
        const formData = new FormData();
        formData.append('alert_id', currentAlertId.toString());
        await fetch(API_CANCEL_SOS_URL, { method: 'POST', body: formData });
        if (sosState === 'active') {
          Alert.alert(
            'SOS Stopped',
            'Your SOS has been cancelled. You can send another alert after 10 seconds.'
          );
          const restrictionTime = 10 * 1000; // 10 seconds
          setSosDisabledUntil(Date.now() + restrictionTime);

          // After 10 seconds, automatically re-enable the button by clearing the restriction.
          // This state update will trigger a re-render and make the button pressable again.
          setTimeout(() => {
            setSosDisabledUntil(null);
          }, restrictionTime);
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to cancel SOS alert.');
      }
    }
    if (sosRecordingRef.current) {
      try {
        console.log("User stopped SOS. Terminating automatic recording without upload.");
        await sosRecordingRef.current.stopAndUnloadAsync();
      } catch (err) {
        console.error('Error stopping automatic SOS recording on cancel:', err);
      } finally {
        sosRecordingRef.current = null;
      }
    }
    if (manualRecording) {
      try {
        await manualRecording.stopAndUnloadAsync();
        const uri = manualRecording.getURI();
        if (uri) {
          addRecord({
            id: Date.now().toString(),
            title: `Cancelled SOS Recording`,
            duration: 'N/A',
            date: new Date().toLocaleDateString(),
            uri,
          });
        }
      } catch (err) {
        console.error('Error auto-stopping recording on cancel:', err);
      } finally {
        setManualRecording(null);
        setHasStoppedManualRecording(true);
      }
    }
    
    // Since both manual and automatic recordings are now terminated,
    // we can safely turn off the recording indicator.
    // setIsRecording(false); // REMOVED

    setSosState('idle');
    setCurrentAlertId(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
    // setIsSendingSOS(false); // REMOVED
    setCountdown(null);
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
      
      console.log('Fetching contacts for user:', nuser_id);
      const response = await fetch(`http://mnl911.atwebpages.com/get_contacts1.php?nuser_id=${nuser_id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Contacts fetch result:', data);
      
      if (data.success && data.contacts && data.contacts.length > 0) {
        const phoneNumbers = data.contacts.map((c: any) => String(c.contact_number));
        console.log('Phone numbers:', phoneNumbers);
        
        const isAvailable = await SMS.isAvailableAsync();
        console.log('SMS available:', isAvailable);
        
        if (isAvailable) {
          try {
            const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
            console.log('SMS send result:', result);
          } catch (smsError) {
            console.log('SMS sendSMSAsync error:', smsError);
            // Don't show alert for SMS errors - they shouldn't block the SOS
          }
        } else {
          console.log('SMS not available');
        }
      } else {
        console.log('No contacts or fetch failed:', data);
        if (data.success && data.contacts.length === 0) {
          Alert.alert('No Emergency Contacts', 'You have no emergency contacts saved. Please add contacts from the "Contacts" screen to use this feature.');
        } else if (!data.success) {
          Alert.alert('Could Not Get Contacts', data.message || 'Failed to fetch your emergency contacts from the server.');
        }
      }
    } catch (e) {
      console.log('SMS error:', e);
      // Don't show alerts for SMS errors - they shouldn't block the SOS
    }
  };

  // --- JSX / RENDER ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}> 
      <View style={styles.mainContent}>
        <View style={styles.sosSection}>
          <View style={styles.helpText}>
            <Text style={[styles.helpTextPrimary, { color: currentTheme.text }]} adjustsFontSizeToFit numberOfLines={1}>Help is just a click away!</Text>
            <Text style={[styles.helpTextSecondary, { color: currentTheme.text }]} adjustsFontSizeToFit numberOfLines={1}>Click <Text style={styles.redText}>SOS button</Text> to call for help.</Text>
          </View>
          <TouchableOpacity
            style={[styles.sosButton, { width: sosButtonSize, height: sosButtonSize, marginVertical: sosButtonSize * 0.08 }]}
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
                { width: ring1Size, height: ring1Size, borderRadius: ring1Size / 2 },
                sosState === 'received' && styles.greenRing1,
                sosState === 'arrived' && styles.arrivedRing1,
                sosState === 'resolved' && styles.blueRing1,
                { transform: [{ scale: ring1Anim }] }
              ]}
            />
            <Animated.View
              style={[
                styles.sosRing2,
                { width: ring2Size, height: ring2Size, borderRadius: ring2Size / 2 },
                sosState === 'received' && styles.greenRing2,
                sosState === 'arrived' && styles.arrivedRing2,
                sosState === 'resolved' && styles.blueRing2,
                { transform: [{ scale: ring2Anim }] }
              ]}
            />
            <Animated.View
              style={[
                styles.sosRing3,
                { width: ring3Size, height: ring3Size, borderRadius: ring3Size / 2 },
                sosState === 'received' && styles.greenRing3,
                sosState === 'arrived' && styles.arrivedRing3,
                sosState === 'resolved' && styles.blueRing3,
                { transform: [{ scale: ring3Anim }] }
              ]}
            />
            <View style={[
              styles.sosCenter,
              { width: sosCenterSize, height: sosCenterSize, borderRadius: sosCenterSize / 2 },
              sosState === 'received' && styles.greenCenter,
              sosState === 'arrived' && styles.arrivedCenter,
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
              ) : sosState === 'arrived' ? (
                <Text style={styles.sosText}>ARRIVED</Text>
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
            <Text style={[styles.locationText, { color: currentTheme.text }]} numberOfLines={1} adjustsFontSizeToFit>{locationAddress}</Text>
            <Text style={[styles.coordinatesText, { color: currentTheme.text }]} numberOfLines={1} adjustsFontSizeToFit>
              <Text style={styles.redText}>Latitude: </Text><Text style={[styles.boldText, { color: currentTheme.text }]}>{location?.coords.latitude?.toFixed(4) || '---'}</Text>
              <Text style={styles.redText}>  Longitude: </Text><Text style={[styles.boldText, { color: currentTheme.text }]}>{location?.coords.longitude?.toFixed(4) || '---'}</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[
            styles.voiceButton, 
            isRecording && styles.voiceButtonRecording,
            { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffd8d8', width: '100%', maxWidth: 500, alignSelf: 'center' }
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
              { backgroundColor: isDarkMode ? '#2a2a2a' : '#ffd8d8', marginTop: 12, width: '100%', maxWidth: 500, alignSelf: 'center' }
            ]}
            onPress={() => {
              cancelCountdownRef.current = true;
              setSosState('idle');
              setCountdown(null);
              // setIsSendingSOS(false); // REMOVED
              setSosDisabledUntil(null);
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
      <Modal
        visible={showProfile}
        animationType="slide"
        onRequestClose={() => setShowProfile(false)}
      >
        <Profile />
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#e02323', borderRadius: 20, padding: 10, zIndex: 100 }}
          onPress={() => setShowProfile(false)}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
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
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  sosSection: {
    alignItems: "center",
    width: '100%',
  },
  helpText: {
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
    width: '100%',
  },
  helpTextPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
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
    alignItems: "center",
    justifyContent: "center",
  },
  sosRing1: {
    position: "absolute",
    backgroundColor: "#fae8e9", // lightest red
  },
  sosRing2: {
    position: "absolute",
    backgroundColor: "#f9d2d2", // lighter red
  },
  sosRing3: {
    position: "absolute",
    backgroundColor: "#f2a6a6", // light red
  },
  sosCenter: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e02323", // main red
    position: 'relative',
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
    fontSize: 38,
    fontWeight: "bold",
  },
  locationInfo: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    width: '100%',
  },
  locationText: {
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    paddingBottom: 12,
    width: '100%',
    textAlign: 'center',
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
    fontSize: 42,
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
  arrivedRing1: {
    backgroundColor: "#e3f2fd"
  },
  arrivedRing2: {
    backgroundColor: "#90caf9"
  },
  arrivedRing3: {
    backgroundColor: "#42a5f5"
  },
  arrivedCenter: {
    backgroundColor: "#2196F3"
  },
});