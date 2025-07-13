import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';
import { getPhilippineDateTimeString } from '../../utils/timezoneConverter';

interface HistoryDetails {
  location: string;
  triggered_at: string;
  resolved_at: string;
  victim_fname: string;
  victim_lname: string;
  victim_number: string;
  victim_email: string;
  officer_fname: string;
  officer_lname: string;
  crime_type: string;
  severity: string;
  crime_description: string;
  voice_record_url: string;
  officer_number: string;
  officer_email: string;
  officer_station: string;
  officer_badge: string;
  alert_id: string;
}

const HistoryContent: React.FC<{ historyId?: string }> = ({ historyId }) => {
  const [details, setDetails] = useState<HistoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('Loading...');

  const router = useRouter();

  async function handlePlaySound() {
    if (!details?.voice_record_url) return;

    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (sound && !isPlaying) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    const fullAudioUrl = `http://mnl911.atwebpages.com/${details.voice_record_url}`;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullAudioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          await newSound.setPositionAsync(0);
        }
      });
    } catch (e) {
      console.error('Error loading sound', e);
      alert('Could not play the audio file.');
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (!historyId) {
      setError('History ID was not provided.');
      setIsLoading(false);
      return;
    }
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://mnl911.atwebpages.com/regular_history_details.php?history_id=${historyId}`);
        const data = await response.json();
        if (response.ok && data.success) {
          setDetails(data.details);
        } else {
          setError(data.error || 'Failed to fetch details from the server.');
        }
      } catch (err) {
        setError('An error occurred. Please check your connection and the server script.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [historyId]);

  useEffect(() => {
    const getTimeRange = async () => {
      if (!details?.alert_id || !details?.triggered_at || !details?.resolved_at) {
        setTimeRange('N/A');
        return;
      }

      try {
        // Get the captured SOS received time and resolved time from AsyncStorage
        const sosReceivedTime = await AsyncStorage.getItem(`sos_received_time_${details.alert_id}`);
        const resolvedTime = await AsyncStorage.getItem(`resolved_time_${details.alert_id}`);
        
        if (sosReceivedTime && resolvedTime) {
          // Use captured times for consistent display
          const resolvedTimeFormatted = getPhilippineDateTimeString(resolvedTime);
          setTimeRange(`${sosReceivedTime} - ${resolvedTimeFormatted}`);
        } else if (sosReceivedTime) {
          // Use captured SOS time but fallback to database resolved time
          const resolvedTimeFormatted = getPhilippineDateTimeString(details.resolved_at);
          setTimeRange(`${sosReceivedTime} - ${resolvedTimeFormatted}`);
        } else {
          // Fallback to database times if captured times not found
          const startTime = getPhilippineDateTimeString(details.triggered_at);
          const endTime = getPhilippineDateTimeString(details.resolved_at);
          setTimeRange(`${startTime} - ${endTime}`);
        }
      } catch (error) {
        console.error('Date formatting error:', error);
        setTimeRange('N/A');
      }
    };

    getTimeRange();
  }, [details?.alert_id, details?.triggered_at, details?.resolved_at]);

  const formatDateTimeRange = (start?: string, end?: string) => {
    return timeRange;
  };

  const renderLocation = (locationString: string) => {
    if (!locationString) return <Text style={styles.location}>Unknown Location</Text>;
    const firstCommaIndex = locationString.indexOf(',');
    if (firstCommaIndex !== -1) {
      const street = locationString.substring(0, firstCommaIndex);
      const area = locationString.substring(firstCommaIndex + 1).trim();
      return (
        <View>
          <Text style={styles.location}>{street}</Text>
          <Text style={styles.locationArea}>{area}</Text>
        </View>
      );
    }
    return <Text style={styles.location}>{locationString}</Text>;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#E02323" />
      </SafeAreaView>
    );
  }

  if (error || !details) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={[styles.errorText, { color: currentTheme.text }]}>Could Not Load Details</Text>
          <Text style={[styles.errorSubText, { color: currentTheme.subtitle }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: currentTheme.cardBackground,
            borderBottomColor: currentTheme.border,
          },
        ]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/regular-user/History')}>
          <MaterialIcons name="arrow-back" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <Text
          style={[styles.headerTitle, { color: currentTheme.text }]}
          numberOfLines={1}
          ellipsizeMode="tail">
          Crime Report Details
        </Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
            <View style={styles.locationHeader}>
              <View style={styles.locationDetails}>
                {renderLocation(details.location)}
                <Text style={[styles.dateTime, { color: currentTheme.subtitle }]}>{formatDateTimeRange(details.triggered_at, details.resolved_at)}</Text>
              </View>
              <View style={styles.responderInfo}>
                <Text style={[styles.respondedBy, { color: currentTheme.text }]}>Responded by</Text>
                <Text
                  style={[
                    styles.responder,
                    { color: currentTheme.subtitle },
                    { maxWidth: 120 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {details.officer_fname} {details.officer_lname}
                </Text>
              </View>
            </View>
            {details.officer_fname && details.officer_lname ? (
              <View style={styles.victimInfo}>
                <Text style={[styles.victimInfoTitle, { color: currentTheme.text }]}>Police Information</Text>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Name:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{`${details.officer_fname} ${details.officer_lname}`}</Text>
                </View>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Phone Number:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{details.officer_number || 'N/A'}</Text>
                </View>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Email:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{details.officer_email || 'N/A'}</Text>
                </View>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Station:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{details.officer_station || 'N/A'}</Text>
                </View>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Badge Number:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{details.officer_badge || 'N/A'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.victimInfo}>
                <Text style={[styles.victimInfoTitle, { color: currentTheme.text }]}>Victim's Information</Text>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Name:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{`${details.victim_fname} ${details.victim_lname}`}</Text>
                </View>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Phone Number:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{details.victim_number}</Text>
                </View>
                <View style={styles.victimDetailRow}>
                  <Text style={[styles.victimInfoLabel, { color: currentTheme.text }]}>Email:</Text>
                  <Text style={[styles.victimInfoText, { color: currentTheme.subtitle }]}>{details.victim_email}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={[styles.detailLabel, { color: currentTheme.text }]}>Description</Text>
                <Text style={[styles.detailValue, { color: currentTheme.subtitle }]}>{details.crime_description || 'None'}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={[styles.detailLabel, { color: currentTheme.text }]}>Crime Type</Text>
                <Text style={[styles.detailValue, { color: currentTheme.subtitle }]}>{details.crime_type || 'None'}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={[styles.detailLabel, { color: currentTheme.text }]}>Severity</Text>
                <Text style={[styles.detailValue, { color: currentTheme.subtitle }]}>{details.severity || 'None'}</Text>
              </View>
            </View>

            {details.voice_record_url && (
              <View style={styles.voiceRecordSection}>
                <Text style={styles.voiceRecordTitle}>SOS Voice Recording</Text>
                <View style={styles.waveformContainer}>
                  <TouchableOpacity style={styles.playButton} onPress={handlePlaySound}>
                    <MaterialIcons
                      name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
                      size={40}
                      color="#E02323"
                    />
                  </TouchableOpacity>
                  <View style={styles.waveform}>
                    {[...Array(40)].map((_, index) => (
                      <View
                        key={index}
                        style={[styles.waveformBar, { height: Math.random() * 20 + 4 }]}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: fonts.poppins.semiBold,
  },
  errorText: { fontSize: 18, fontWeight: 'bold', fontFamily: fonts.poppins.semiBold, color: '#333', textAlign: 'center' },
  errorSubText: { fontSize: 14, fontFamily: fonts.poppins.regular, color: '#666', marginTop: 8, textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollViewContent: { padding: 20 },
  content: { gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  locationDetails: { flex: 1, marginRight: 10 },
  location: { fontSize: 16, fontFamily: fonts.poppins.medium, color: '#E02323', flexWrap: 'wrap' },
  locationArea: { fontSize: 14, fontFamily: fonts.poppins.regular, color: '#E02323', flexWrap: 'wrap' },
  dateTime: { fontSize: 12, fontFamily: fonts.poppins.medium, color: 'rgba(0, 0, 0, 0.4)', marginTop: 8 },
  responderInfo: { alignItems: 'flex-end', gap: 6, maxWidth: 120 },
  respondedBy: { fontSize: 11, fontFamily: fonts.poppins.medium, color: '#19F315' },
  responder: { fontSize: 12, fontFamily: fonts.poppins.medium, color: 'rgba(0, 0, 0, 0.4)', maxWidth: 120 },
  detailsRow: { flexDirection: 'row', gap: 18 },
  detailColumn: { flex: 1 },
  detailLabel: { fontSize: 14, fontFamily: fonts.poppins.semiBold, color: '#000', marginBottom: 2 },
  detailValue: { fontSize: 12, fontFamily: fonts.poppins.regular, color: '#333' },
  victimInfo: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 16 },
  victimInfoTitle: { fontSize: 15, fontFamily: fonts.poppins.semiBold, color: '#000', marginBottom: 12 },
  victimDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  victimInfoLabel: { fontSize: 14, fontFamily: fonts.poppins.medium, color: '#333', marginRight: 8 },
  victimInfoText: { fontSize: 14, fontFamily: 'Roboto', color: '#7E7E7E' },
  voiceRecordSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 16 },
  voiceRecordTitle: { fontSize: 15, fontFamily: fonts.poppins.semiBold, color: '#212121', marginBottom: 12 },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', height: 40 },
  playButton: { marginRight: 12 },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', height: '100%', gap: 2 },
  waveformBar: { width: 3, backgroundColor: 'rgba(224, 35, 35, 0.6)', borderRadius: 2 },
});

export default HistoryContent;


