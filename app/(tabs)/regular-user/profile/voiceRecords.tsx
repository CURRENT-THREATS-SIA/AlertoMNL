import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { fonts } from '../../../config/fonts';

interface VoiceRecord {
  id: string;
  title: string;
  duration: string;
  date: string;
}

const dummyRecords: VoiceRecord[] = [
  { id: '1', title: 'Voice record 1', duration: '1:30', date: '04/30/2025' },
  { id: '2', title: 'Voice record 1', duration: '1:30', date: '04/30/2025' },
  { id: '3', title: 'Voice record 1', duration: '1:30', date: '04/30/2025' },
  { id: '4', title: 'Voice record 1', duration: '1:30', date: '04/30/2025' },
  { id: '5', title: 'Voice record 1', duration: '1:30', date: '04/30/2025' },
  { id: '6', title: 'Voice record 1', duration: '1:30', date: '04/30/2025' },
];

const VoiceRecordItem: React.FC<{ record: VoiceRecord }> = ({ record }) => {
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
        <TouchableOpacity style={styles.playButton}>
          <View style={styles.playButtonContainer}>
            <MaterialIcons name="play-circle-filled" size={32} color="#e02323" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const VoiceRecords: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Records</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {dummyRecords.map((record) => (
            <VoiceRecordItem key={record.id} record={record} />
          ))}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
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
});

export default VoiceRecords;
