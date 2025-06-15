import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Mic } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import WaveformVisualizer from "../../components/WaveformVisualizer";
import { useVoiceRecords } from "../../context/VoiceRecordContext";

// --- API URLs ---
const API_TRIGGER_SOS_URL = 'http://mnl911.atwebpages.com/sosnotify.php';
const API_UPLOAD_AUDIO_URL = 'http://mnl911.atwebpages.com/upload_audio.php';
const API_CANCEL_SOS_URL = 'http://mnl911.atwebpages.com/cancel_sos_alert.php';
const API_CHECK_STATUS_URL = 'http://mnl911.atwebpages.com/check_sos_status.php';

type SOSState = 'idle' | 'countdown' | 'active' | 'received' | 'resolved';

export default function RegularUserHome() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("Fetching location...");
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [manualRecording, setManualRecording] = useState<Audio.Recording | null>(null);
  const { addRecord } = useVoiceRecords();
  const [sosState, setSosState] = useState<SOSState>('idle');
  const [currentAlertId, setCurrentAlertId] = useState<number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sosDisabledUntil, setSosDisabledUntil] = useState<number | null>(null);

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
      startLocationUpdates();
    };
    initializeLocation();
    return () => { stopLocationUpdates(); };
  }, []);

  const getQuickInitialLocation = async () => {
    try {
      const initialLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(initialLocation);
      const addresses = await Location.reverseGeocodeAsync(initialLocation.coords);
      if (addresses && addresses[0]) {
        setLocationAddress(formatAddress(addresses[0]));
      }
    } catch (error) {
      console.error("Could not get initial location:", error);
      setLocationAddress("Could not fetch location.");
    }
  };

  const startLocationUpdates = async () => {
    Location.watchPositionAsync(
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
  };

  const stopLocationUpdates = () => { /* Cleanup logic */ };

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
    setIsSendingSOS(true);
    setSosState('countdown');
    setCountdown(5);
    for (let i = 5; i > 0; i--) {
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
      console.log('SOS currentLocation:', currentLocation); // Debug: log the coordinates
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

  // --- JSX / RENDER ---
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.sosSection}>
          <View style={styles.helpText}>
            <Text style={styles.helpTextPrimary}>Help is just a click away!</Text>
            <Text style={styles.helpTextSecondary}>Click <Text style={styles.redText}>SOS button</Text> to call for help.</Text>
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
              {sosState === 'countdown' ? (
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
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>{locationAddress}</Text>
            <Text style={styles.coordinatesText}>
              <Text style={styles.redText}>Latitude: </Text><Text style={styles.boldText}>{location?.coords.latitude.toFixed(4) || '---'}</Text>
              <Text style={styles.redText}>  Longitude: </Text><Text style={styles.boldText}>{location?.coords.longitude.toFixed(4) || '---'}</Text>
            </Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]} onPress={manualRecording ? stopManualRecording : startManualRecording} disabled={isSendingSOS || isRecording}>
          <View style={styles.voiceButtonContent}>
            {isRecording ? (
              <>
                <MaterialIcons name="stop-circle" size={24} color="#ffffff" />
                <View style={styles.waveformContainer}><WaveformVisualizer isRecording={isRecording} /></View>
              </>
            ) : (
              <View style={styles.voiceButtonInner}><Mic size={24} color="#e02323" /><Text style={styles.voiceButtonText}>Voice Recording</Text></View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Styles (Same as your original) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingTop: 28,
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
    color: "#424b5a",
  },
  helpTextSecondary: {
    fontSize: 14,
    color: "#424b5a",
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
    color: "#424b5a",
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