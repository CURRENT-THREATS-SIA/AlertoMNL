import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';

interface HistoryItem {
  history_id: number;
  alert_id: number;
  location: string;
  f_name: string;
  l_name: string;
  resolved_at: string;
  date: string;
  time: string;
  status: 'pending' | 'resolved' | 'in-progress';
  crimeType: string;
}

const ChevronRightIcon = () => (
  <Svg height="24" width="24" viewBox="0 0 24 24">
    <Path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" fill="#aaa" />
  </Svg>
);

const HistoryCard: React.FC<{ item: HistoryItem; onPress: () => void }> = ({ item, onPress }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const statusColors = {
    pending: currentTheme.statusPending,
    resolved: currentTheme.statusResolved,
    'in-progress': currentTheme.statusInProgress
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: currentTheme.cardBackground,
          borderColor: currentTheme.cardBorder 
        }
      ]} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.dateTime, { color: currentTheme.text }]}>{item.date} at {item.time}</Text>
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
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const policeId = await AsyncStorage.getItem('police_id');
        if (!policeId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://mnl911.atwebpages.com/get_police_history.php?police_id=${policeId}`);
        const data = await response.json();

        if (data.success) {
          setHistoryItems(data.history);
        } else {
          console.error('API Error:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleHistoryItemPress = (id: number) => {
    router.push(`/police-officer/history/${id}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: currentTheme.text }]}>Crime Report History</Text>
          <Text style={[styles.subtitle, { color: currentTheme.subtitle }]}>View your past crime reports</Text>
          
          <View style={styles.historyList}>
            {historyItems.map((item) => (
              <HistoryCard 
                key={item.history_id} 
                item={item}
                onPress={() => handleHistoryItemPress(item.history_id)}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.poppins.semiBold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    marginBottom: 24,
  },
  historyList: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
  },
  cardContent: {
    gap: 2,
    flex: 1,
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  alertIdText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
  crimeType: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
});

export default History;
