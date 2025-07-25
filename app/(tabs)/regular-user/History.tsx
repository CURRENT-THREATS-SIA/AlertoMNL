import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';
import CustomTabBar from '../../../app/components/CustomTabBar';
import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';
import { getPhilippineDateTimeString } from '../../utils/timezoneConverter';

interface HistoryItem {
  history_id: number;
  alert_id: number;
  location: string;
  victim_fname: string;
  victim_lname: string;
  resolved_at: string;
}

const ChevronRightIcon = () => (
  <Svg height="24" width="24" viewBox="0 0 24 24">
    <Path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" fill="#aaa" />
  </Svg>
);

const HistoryCard: React.FC<{ item: HistoryItem; onPress: () => void }> = ({ item, onPress }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const [timeRange, setTimeRange] = useState<string>('Loading...');

  useEffect(() => {
    const getTimeRange = async () => {
      try {
        // Get the captured SOS received time and resolved time from AsyncStorage
        const sosReceivedTime = await AsyncStorage.getItem(`sos_received_time_${item.alert_id}`);
        const resolvedTime = await AsyncStorage.getItem(`resolved_time_${item.alert_id}`);
        
        if (sosReceivedTime && resolvedTime) {
          // Use captured times for consistent display
          const resolvedTimeFormatted = getPhilippineDateTimeString(resolvedTime);
          setTimeRange(`${sosReceivedTime} - ${resolvedTimeFormatted}`);
        } else if (sosReceivedTime) {
          // Use captured SOS time but fallback to database resolved time
          const resolvedTimeFormatted = getPhilippineDateTimeString(item.resolved_at);
          setTimeRange(`${sosReceivedTime} - ${resolvedTimeFormatted}`);
        } else {
          // Fallback to just resolved time if captured times not found
          const resolvedTimeFormatted = getPhilippineDateTimeString(item.resolved_at);
          setTimeRange(resolvedTimeFormatted);
        }
      } catch (error) {
        console.error('Error formatting time range:', error);
        setTimeRange('Invalid Date');
      }
    };

    getTimeRange();
  }, [item.alert_id, item.resolved_at]);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: currentTheme.cardBackground }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <Text style={[styles.location, { color: currentTheme.text }]}>{item.location || 'Unknown Location'}</Text>
        <Text style={[styles.userName, { color: currentTheme.subtitle }]}>{`${item.victim_fname || ''} ${item.victim_lname || ''}`.trim()}</Text>
        <Text style={[styles.dateTime, { color: currentTheme.subtitle }]}>{timeRange}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={[styles.alertIdText, { color: currentTheme.statusResolved }]}>ALERT #{item.alert_id}</Text>
        <ChevronRightIcon />
      </View>
    </TouchableOpacity>
  );
};

const History: React.FC = () => {
  const router = useRouter();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const nuserId = await AsyncStorage.getItem('nuser_id');
        if (!nuserId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://mnl911.atwebpages.com/get_user_history.php?nuser_id=${nuserId}`);
        const data = await response.json();

        if (data.success) {
          setHistoryItems(data.history.map((item: any) => ({
            history_id: item.history_id,
            alert_id: item.alert_id,
            location: item.location || 'Unknown Location',
            victim_fname: item.victim_fname || '',
            victim_lname: item.victim_lname || '',
            resolved_at: item.resolved_at || item.trigger_time
          })));
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
    router.replace(`/regular-user/history/${id}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Crime Report History</Text>
        <Text style={[styles.subtitle, { color: currentTheme.subtitle }]}>Tap to view more details</Text>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#E02323" />
        ) : (
          <FlashList
            data={historyItems}
            renderItem={({ item, index }) => (
              <HistoryCard
                key={item.history_id + '-' + index}
                item={item}
                onPress={() => handleHistoryItemPress(item.history_id)}
              />
            )}
            keyExtractor={(item, index) => item.history_id + '-' + index}
            estimatedItemSize={80}
            ListEmptyComponent={
              <Text style={[styles.noHistoryText, { color: currentTheme.subtitle }]}>No history records found.</Text>
            }
            ListFooterComponent={<View style={{ height: insets.bottom + 16 }} />}
          />
        )}
      </View>

      <CustomTabBar activeScreen="History" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  },
  location: {
    fontSize: 16,
    fontFamily: fonts.poppins.semiBold,
  },
  userName: {
    fontSize: 14,
    fontFamily: fonts.poppins.regular,
  },
  dateTime: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
  },
  noHistoryText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
  },
});

export default History;
