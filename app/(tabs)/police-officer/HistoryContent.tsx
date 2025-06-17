import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';
import { useTheme } from '../../context/ThemeContext';

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  content: {
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  location: {
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
    color: '#E02323',
  },
  reporter: {
    fontSize: 11,
    fontFamily: fonts.poppins.medium,
    color: '#000',
  },
  dateTime: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  responderInfo: {
    alignItems: 'flex-end',
    gap: 6,
  },
  respondedBy: {
    fontSize: 9,
    fontFamily: fonts.poppins.medium,
    color: '#19F315',
  },
  responder: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  mapImage: {
    width: '100%',
    height: 110,
    borderRadius: 8,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceText: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  dot: {
    fontSize: 5,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  arrivalTime: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 18,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: '#000',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: '#000',
  },
  voiceRecordSection: {
    marginTop: 16,
  },
  voiceRecordTitle: {
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    color: '#000',
    marginBottom: 8,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#E02323',
    borderRadius: 1,
  },
  playButton: {
    marginLeft: 8,
  },
  voiceRecordInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  voiceRecordDuration: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  voiceRecordDate: {
    fontSize: 10,
    fontFamily: fonts.poppins.medium,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  victimInfo: {
    marginTop: 16,
    gap: 8,
  },
  victimInfoTitle: {
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    color: '#000',
  },
  victimInfoText: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: 'rgba(0, 0, 0, 0.24)',
  },
  locationArea: {
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: 'rgba(0, 0, 0, 0.24)',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
});

const HistoryContent: React.FC<{ historyId?: string }> = ({ historyId }) => {
  const [details, setDetails] = useState<HistoryDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
        const response = await fetch(`http://mnl911.atwebpages.com/get_history_details.php?history_id=${historyId}`);
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

  const formatDateTimeRange = (start?: string, end?: string) => {
    if (!start || !end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const formattedDate = startDate.toLocaleDateString('en-US', dateOptions);
    const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
    const endTime = endDate.toLocaleTimeString('en-US', timeOptions);
    return `${formattedDate}, ${startTime} - ${endTime}`;
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
      <SafeAreaView style={styles.container}>
        <Header />
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#E02323" />
        <NavBottomBar activeScreen="History" />
      </SafeAreaView>
    );
  }

  if (error || !details) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={styles.errorText}>Could Not Load Details</Text>
          <Text style={styles.errorSubText}>{error}</Text>
        </View>
        <NavBottomBar activeScreen="History" />
      </SafeAreaView>
    );
  }

  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Crime Report History</Text>

          {/* Location Card */}
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.locationHeader}>
              <View>
                <Text style={[styles.location, { color: '#E02323' }]}>{details?.location}</Text>
                <Text style={[styles.reporter, { color: theme.text }]}>{details?.officer_fname} {details?.officer_lname}</Text>
                <Text style={[styles.dateTime, { color: theme.subtitle }]}>{formatDateTimeRange(details?.triggered_at, details?.resolved_at)}</Text>
              </View>
              <View style={styles.responderInfo}>
                <Text style={[styles.respondedBy, { color: '#19F315' }]}>Responded by</Text>
                <Text style={[styles.responder, { color: theme.subtitle }]}>{details?.officer_fname} {details?.officer_lname}</Text>
              </View>
            </View>

            <View 
              style={[styles.mapImage, {
                backgroundColor: theme.surface,
                justifyContent: 'center',
                alignItems: 'center',
              }]}
            >
              <Text style={{ color: theme.subtitle }}>Map Preview</Text>
            </View>

            <View style={styles.distanceInfo}>
              <Text style={[styles.distanceText, { color: theme.subtitle }]}>{details?.crime_description}</Text>
              <Text style={[styles.dot, { color: theme.subtitle }]}>●</Text>
              <Text style={[styles.arrivalTime, { color: theme.subtitle }]}>{details?.crime_type}</Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>Description</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{details?.crime_description}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>Crime Type</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{details?.crime_type}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={[styles.detailLabel, { color: theme.text }]}>Severity</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>{details?.severity}</Text>
              </View>
            </View>

            {/* Voice Record Section */}
            <View style={styles.voiceRecordSection}>
              <Text style={[styles.voiceRecordTitle, { color: theme.text }]}>{details?.crime_description}</Text>
              <View style={styles.waveformContainer}>
                {[...Array(40)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        height: Math.random() * 15 + 2,
                        opacity: 0.66
                      }
                    ]}
                  />
                ))}
                <TouchableOpacity style={styles.playButton} onPress={handlePlaySound}>
                  <MaterialIcons name={isPlaying ? "pause-circle-filled" : "play-circle-filled"} size={28} color="#E02323" />
                </TouchableOpacity>
              </View>
              <View style={styles.voiceRecordInfo}>
                <Text style={[styles.voiceRecordDuration, { color: theme.subtitle }]}>{details?.crime_description}</Text>
                <Text style={[styles.voiceRecordDate, { color: theme.subtitle }]}>{details?.crime_type}</Text>
              </View>
            </View>

            {/* Victim Information */}
            <View style={styles.victimInfo}>
              <Text style={[styles.victimInfoTitle, { color: theme.text }]}>Victim&apos;s Information</Text>
              <Text style={[styles.victimInfoText, { color: theme.subtitle }]}>{details?.victim_number}</Text>
              <Text style={[styles.victimInfoText, { color: theme.subtitle }]}>{details?.victim_email}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <NavBottomBar activeScreen="History" />
    </SafeAreaView>
  );
};

export default HistoryContent;
