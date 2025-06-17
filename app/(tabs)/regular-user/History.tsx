import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomTabBar from '../../../app/components/CustomTabBar';
import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';

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
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  
  const statusColors = {
    pending: '#FFA500',
    resolved: '#4CAF50',
    'in-progress': '#2196F3'
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: currentTheme.cardBackground }]} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.dateTime, { color: currentTheme.subtitle }]}>{item.date} at {item.time}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={[styles.location, { color: currentTheme.text }]}>{item.location}</Text>
        <Text style={[styles.crimeType, { color: currentTheme.subtitle }]}>{item.crimeType}</Text>
      </View>
    </TouchableOpacity>
  );
};

const History: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const nuserId = await AsyncStorage.getItem('nuser_id');
      if (!nuserId) return;
      const response = await fetch(`http://mnl911.atwebpages.com/get_user_history.php?nuser_id=${nuserId}`);
      const data = await response.json();
      if (data.success) {
        setHistoryItems(data.history.map((item: any) => ({
          id: item.history_id,
          date: item.trigger_time ? item.trigger_time.split(' ')[0] : '',
          time: item.trigger_time ? item.trigger_time.split(' ')[1] : '',
          location: item.alert_id ? `Alert #${item.alert_id}` : '',
          crimeType: '', // Adjust if you have this info
          status: 'resolved', // Adjust if you have this info
        })));
      }
    };
    fetchHistory();
  }, []);

  const handleHistoryItemPress = (id: number) => {
    router.push(`/regular-user/history/${id}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: currentTheme.text }]}>Crime Report History</Text>
          <Text style={[styles.subtitle, { color: currentTheme.subtitle }]}>View your past crime reports</Text>
          
          <View style={styles.historyList}>
            {historyItems.map((item) => (
              <HistoryCard 
                key={item.id} 
                item={item}
                onPress={() => handleHistoryItemPress(item.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <CustomTabBar activeScreen="History" />
    </SafeAreaView>
  );
};

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
