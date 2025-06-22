import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../../../config/fonts';
import { useTheme } from '../../../context/ThemeContext';

import { useVoiceRecords, VoiceRecord } from '../../../context/VoiceRecordContext';

const VoiceRecordItem: React.FC<{ record: VoiceRecord }> = ({ record }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { theme } = useTheme();

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
    <View style={[styles.recordItemContainer, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.recordItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.recordInfo}>
          <Text style={[styles.recordTitle, { color: theme.text }]}>{record.title}</Text>
          <View style={styles.recordMeta}>
            <MaterialIcons name="access-time" size={12} color={theme.subtitle} style={styles.metaIcon} />
            <Text style={[styles.recordDuration, { color: theme.subtitle }]}>{record.duration}</Text>
            <MaterialIcons name="calendar-today" size={12} color={theme.subtitle} style={styles.metaIcon} />
            <Text style={[styles.recordDate, { color: theme.subtitle }]}>{record.date}</Text>
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
  const { theme, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Voice Records</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <FlashList
          data={records}
          renderItem={({ item }) => <VoiceRecordItem record={item} />}
          keyExtractor={(item) => item.id}
          estimatedItemSize={80}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="mic-none" size={48} color={theme.subtitle} />
              <Text style={[styles.emptyStateText, { color: theme.subtitle }]}>No recordings yet</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: fonts.poppins.medium,
    marginTop: 12,
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
});

export default VoiceRecords;
