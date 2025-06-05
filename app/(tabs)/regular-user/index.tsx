import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Location from 'expo-location';
import { Mic } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import WaveformVisualizer from "../../components/WaveformVisualizer";
import { useVoiceRecords } from "../../context/VoiceRecordContext";

export default function RegularUserHome() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("Fetching location...");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { addRecord } = useVoiceRecords();

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for this app.');
        return;
      }

      // Request audio permissions
      const audioStatus = await Audio.requestPermissionsAsync();
      if (audioStatus.status !== 'granted') {
        Alert.alert('Permission Denied', 'Audio recording permission is required for this app.');
        return;
      }

      // Start watching location
      startLocationUpdates();
    })();

    return () => {
      // Cleanup location subscription when component unmounts
      stopLocationUpdates();
    };
  }, []);

  const startLocationUpdates = async () => {
    try {
      // Watch position with high accuracy
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        async (newLocation) => {
          setLocation(newLocation);
          try {
            // Reverse geocode to get address
            const addresses = await Location.reverseGeocodeAsync({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
            if (addresses && addresses[0]) {
              const address = addresses[0];
              setLocationAddress(`${address.district || address.subregion || ''}, ${address.city || ''}`);
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting location updates:', error);
      Alert.alert('Error', 'Failed to get location updates.');
    }
  };

  const stopLocationUpdates = () => {
    // Implement cleanup for location subscription if needed
  };

  const startRecording = async () => {
    try {
      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
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
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save recording.');
    }
  };

  const handleSOS = async () => {
    if (isSendingSOS) return;

    setIsSendingSOS(true);
    setCountdown(5);

    for (let i = 5; i > 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }

    try {
      Vibration.vibrate(500);
      await startRecording();

      if (!location) {
        Alert.alert('Error', 'Unable to get your location. Please try again.');
        setIsSendingSOS(false);
        setCountdown(null);
        return;
      }

      // Get nuser_id from AsyncStorage
      const nuserId = await AsyncStorage.getItem('nuser_id');
      if (!nuserId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        setIsSendingSOS(false);
        setCountdown(null);
        return;
      }

      // Create SOS alert
      const createResponse = await fetch('http://mnl911.atwebpages.com/create_sos_alert.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `nuser_id=${nuserId}&a_latitude=${location.coords.latitude}&a_longitude=${location.coords.longitude}&a_audio=`,
      });
      const createData = await createResponse.json();
      if (!createData.success) throw new Error('Failed to create SOS alert');
      const alertId = createData.alert_id;

      // Fetch police officers
      const officersResponse = await fetch('http://mnl911.atwebpages.com/get_police_officers.php');
      const officersData = await officersResponse.json();
      if (!officersData.success || officersData.officers.length === 0) throw new Error('No police officers available');

      // Assign the alert to ALL police officers
      for (const officer of officersData.officers) {
        await fetch('http://mnl911.atwebpages.com/accept_sos_alert.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `alert_id=${alertId}&police_id=${officer.police_id}`,
        });
      }

      setTimeout(async () => {
        await stopRecording();
        setIsSendingSOS(false);
        setCountdown(null);
      }, 30000);

      Alert.alert(
        'SOS Sent',
        'Emergency services have been notified. Recording will stop in 30 seconds.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending SOS:', error);
      Alert.alert('Error', 'Failed to send SOS. Please try again.');
      setIsSendingSOS(false);
      setCountdown(null);
      if (isRecording) {
        await stopRecording();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* SOS Section */}
        <View style={styles.sosSection}>
          <View style={styles.helpText}>
            <Text style={styles.helpTextPrimary}>Help is just a click away!</Text>
            <Text style={styles.helpTextSecondary}>
              Click <Text style={styles.redText}>SOS button</Text> to call for help.
            </Text>
          </View>

          {/* SOS Button */}
          <TouchableOpacity 
            style={styles.sosButton}
            onPress={handleSOS}
            disabled={isSendingSOS}
          >
            <View style={styles.sosRing1} />
            <View style={styles.sosRing2} />
            <View style={styles.sosRing3} />
            <View style={[styles.sosCenter, isSendingSOS && styles.sosCenterPressed]}>
              {countdown !== null ? (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                  <Text style={styles.countdownLabel}>seconds</Text>
                </View>
              ) : (
                <Text style={styles.sosText}>SOS</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Location Info */}
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>{locationAddress}</Text>
            <Text style={styles.coordinatesText}>
              <Text style={styles.redText}>Latitude: </Text>
              <Text style={styles.boldText}>
                {location?.coords.latitude.toFixed(2) || '---'}
              </Text>
              <Text style={styles.redText}>  Longitude: </Text>
              <Text style={styles.boldText}>
                {location?.coords.longitude.toFixed(2) || '---'}
              </Text>
            </Text>
          </View>
        </View>

        {/* Voice Recording Button */}
        <TouchableOpacity 
          style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <View style={styles.voiceButtonContent}>
            {isRecording ? (
              <>
                <MaterialIcons name="stop-circle" size={24} color="#ffffff" />
                <View style={styles.waveformContainer}>
                  <WaveformVisualizer isRecording={isRecording} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.voiceButtonInner}>
                  <Mic size={24} color="#e02323" />
                  <Text style={styles.voiceButtonText}>Voice Recording</Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e02323",
  },
  profileButton: {
    backgroundColor: "#e02323",
    padding: 8,
    borderRadius: 8,
  },
  profileButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
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
    backgroundColor: "#fae8e9",
  },
  sosRing2: {
    position: "absolute",
    width: 293,
    height: 293,
    borderRadius: 146.5,
    backgroundColor: "#f9d2d2",
  },
  sosRing3: {
    position: "absolute",
    width: 267,
    height: 267,
    borderRadius: 133.5,
    backgroundColor: "#f2a6a6",
  },
  sosCenter: {
    width: 231,
    height: 231,
    borderRadius: 120.5,
    backgroundColor: "#e02323",
    alignItems: "center",
    justifyContent: "center",
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
  bottomNav: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bottomNavContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  navItem: {
    alignItems: "center",
    width: 68,
  },
  navText: {
    color: "#a4a4a4",
    fontSize: 10,
    marginTop: 4,
  },
  navTextActive: {
    color: "#e02323",
    fontSize: 10,
    marginTop: 4,
  },
  homeIndicator: {
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  homeIndicatorBar: {
    width: 136,
    height: 7,
    backgroundColor: "#a4a4a4",
    borderRadius: 100,
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
});
