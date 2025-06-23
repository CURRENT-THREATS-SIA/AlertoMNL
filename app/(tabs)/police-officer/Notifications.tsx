import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../../config/fonts';
import { AlertNotification, useAlerts } from '../../context/AlertContext';
import { theme, useTheme } from '../../context/ThemeContext';

// Keep the AlertCard component here as it's the primary view for this screen
const AlertCard: React.FC<{ notification: AlertNotification; onAccept: (alertId: number) => void }> = ({ notification, onAccept }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const getTimeSinceAlert = () => {
    if (!notification.a_created) return 'Just now';
    const alertTime = new Date(notification.a_created);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ${diffInMinutes % 60}m ago`;
  };

  const isUrgent = () => {
    if (!notification.a_created) return true;
    const alertTime = new Date(notification.a_created);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    return diffInMinutes < 5;
  };

  return (
    <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }, isUrgent() && styles.urgentCard]}>
      <Ionicons name="alert-circle" size={48} color={isUrgent() ? "#ff4444" : "#e02323"} style={{ marginBottom: 12 }} />
      <Text style={[styles.title, { color: currentTheme.text }]}>
        {isUrgent() ? '🚨 URGENT: Response Required!' : 'Response Required'}
      </Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}><Text style={[styles.detailLabel, {color: currentTheme.text}]}>From:</Text><Text style={[styles.detailText, {color: currentTheme.text}]}>{notification.user_full_name}</Text></View>
        <View style={styles.detailRow}><Text style={[styles.detailLabel, {color: currentTheme.text}]}>Alert ID:</Text><Text style={[styles.detailText, {color: currentTheme.text}]}>{notification.alert_id}</Text></View>
        <View style={styles.detailRow}><Text style={[styles.detailLabel, {color: currentTheme.text}]}>Location:</Text><Text style={[styles.detailText, {color: currentTheme.text}]} numberOfLines={2}>{notification.location}</Text></View>
        <View style={styles.detailRow}><Text style={[styles.detailLabel, {color: currentTheme.text}]}>Time:</Text><Text style={[styles.detailText, {color: currentTheme.text}]}>{getTimeSinceAlert()}</Text></View>
        {notification.distance && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, {color: currentTheme.text}]}>Distance:</Text>
            <Text style={[styles.detailText, {color: currentTheme.text}]}>{`${notification.distance} km`}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={[styles.acceptButton, isUrgent() && styles.urgentAcceptButton]} onPress={() => onAccept(notification.alert_id)}>
        <Text style={styles.acceptButtonText}>{isUrgent() ? '🚨 ACCEPT URGENT' : 'Accept'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const NotificationsScreen = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const navigation = useNavigation();
  
  // --- ALERTS ARE NOW HANDLED BY THE CONTEXT ---
  const { notifications, isLoading, acceptAlert, refreshAlerts } = useAlerts();

  // The local `handleAccept`, `fetchNotifications`, `useEffect`, and `useState` for alerts are now removed.

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Custom Header with Back Button */}
      <View style={[styles.customHeader, { backgroundColor: currentTheme.background }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={currentTheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>Pending SOS Alerts</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshAlerts}
            tintColor={currentTheme.text}
          />
        }
      >
        {isLoading && notifications.length === 0 ? (
          <Text style={{ color: currentTheme.text, textAlign: 'center', marginTop: 20 }}>Fetching alerts...</Text>
        ) : notifications.length > 0 ? (
          <FlashList
            data={notifications}
            renderItem={({ item }) => <AlertCard notification={item} onAccept={acceptAlert} />}
            keyExtractor={(item) => item.alert_id.toString()}
            estimatedItemSize={280} // Adjusted for larger card
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <Text style={[styles.emptyText, { color: currentTheme.text }]}>No pending alerts at the moment.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    flex: 1,
    textAlign: 'left',
  },
  scrollContainer: { padding: 16, flexGrow: 1 },
  card: { 
    borderRadius: 20, 
    marginBottom: 16,
    padding: 24,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
    alignItems: 'center', 
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: '#e02323',
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsContainer: {
    width: '100%',
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    textAlign: 'right',
    flexShrink: 1,
  },
  detailLabel: {
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
    marginRight: 8,
  },
  acceptButton: { 
    backgroundColor: '#e02323',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  urgentCard: {
    borderWidth: 2,
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  urgentAcceptButton: {
    backgroundColor: '#ff4444',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.poppins.regular,
    textAlign: 'center',
    marginBottom: 8,
  },
});

export default NotificationsScreen;