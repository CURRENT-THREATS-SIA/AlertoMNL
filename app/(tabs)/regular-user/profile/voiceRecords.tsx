import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';

import { useVoiceRecords, VoiceRecord } from '../../../context/VoiceRecordContext';

const VoiceRecordItem: React.FC<{ record: VoiceRecord }> = ({ record }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSound = async () => {
    try {
      if (isPlaying && sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: record.uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={styles.recordItemContainer}>
      <View style={styles.recordItem}>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{record.title}</Text>
          <View style={styles.recordMeta}>
            <MaterialIcons name="access-time" size={12} color="#666" style={styles.metaIcon} />
            <Text style={styles.recordDuration}>{record.duration}</Text>
            <MaterialIcons name="calendar-today" size={12} color="#666" style={styles.metaIcon} />
            <Text style={styles.recordDate}>{record.date}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.playButton} onPress={playSound}>
          <View style={styles.playButtonContainer}>
            <MaterialIcons 
              name={isPlaying ? "stop-circle" : "play-circle-filled"} 
              size={32} 
              color="#e02323" 
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const VoiceRecords: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { records } = useVoiceRecords();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Voice Records</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="mic-none" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No recordings yet</Text>
            </View>
          ) : (
            records.map((record) => (
              <VoiceRecordItem key={record.id} record={record} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.semiBold,
    color: '#212121',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  recordItemContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  recordInfo: {
    flex: 1,
    marginRight: 16,
  },
  recordTitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
    color: '#212121',
    marginBottom: 6,
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  recordDuration: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: '#666',
    marginRight: 12,
  },
  recordDate: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    color: '#666',
  },
  playButton: {
    borderRadius: 12,
  },
  playButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(224, 35, 35, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
    color: '#666',
  },
});

export default VoiceRecords;
