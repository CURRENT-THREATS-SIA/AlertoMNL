import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';

interface HistoryItem {
  id: number;
  date: string;
  time: string;
  location: string;
  crimeType: string;
  status: 'pending' | 'resolved' | 'in-progress';
}

const mockHistoryItems: HistoryItem[] = [
  {
    id: 1,
    date: '2024-03-15',
    time: '14:30',
    location: 'Pandacan, Manila',
    crimeType: 'Theft',
    status: 'resolved'
  },
  {
    id: 2,
    date: '2024-03-14',
    time: '09:15',
    location: 'Malate, Manila',
    crimeType: 'Assault',
    status: 'in-progress'
  },
  {
    id: 3,
    date: '2024-03-13',
    time: '18:45',
    location: 'Intramuros, Manila',
    crimeType: 'Robbery',
    status: 'pending'
  },
];

const HistoryCard: React.FC<{ item: HistoryItem; onPress: () => void }> = ({ item, onPress }) => {
  const statusColors = {
    pending: '#FFA500',
    resolved: '#4CAF50',
    'in-progress': '#2196F3'
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateTime}>{item.date} at {item.time}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.crimeType}>{item.crimeType}</Text>
      </View>
    </TouchableOpacity>
  );
};

const History: React.FC = () => {
  const router = useRouter();

  const handleHistoryItemPress = (id: number) => {
    router.push(`/police-officer/history/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Crime Report History</Text>
          <Text style={styles.subtitle}>View your past crime reports</Text>
          
          <View style={styles.historyList}>
            {mockHistoryItems.map((item) => (
              <HistoryCard 
                key={item.id} 
                item={item}
                onPress={() => handleHistoryItemPress(item.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <NavBottomBar activeScreen="History" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
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
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    color: '#212121',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
    color: '#666',
    marginBottom: 8,
  },
  historyList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTime: {
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.poppins.semiBold,
  },
  cardContent: {
    gap: 4,
  },
  location: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
    color: '#E02323',
  },
  crimeType: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
    color: '#666',
  },
});

export default History; 