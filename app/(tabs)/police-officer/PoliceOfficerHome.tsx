import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { createCrimeTypeData, crimeData, StationName, totalCrime, totalCrimeData, totalRates } from '../../../constants/mapData';
import MapComponent from '../../components/MapComponent';
import SelectionModal from '../../components/SelectionModal';
import { fonts } from '../../config/fonts';
import { useAlerts } from '../../context/AlertContext';
import { theme, useTheme } from '../../context/ThemeContext';

export type CrimeStat = {
  title: string;
  value: string;
  location?: string;
  type?: string;
};

// Crime types and stations data (match regular user)
const crimeTypes = [
  { id: 1, label: 'Murder', value: 'Murder' },
  { id: 2, label: 'Homicide', value: 'Homicide' },
  { id: 3, label: 'Physical Injuries', value: 'Physical Injury' },
  { id: 4, label: 'Rape', value: 'Rape' },
  { id: 5, label: 'Robbery', value: 'Robbery' },
  { id: 6, label: 'Theft', value: 'Theft' },
  { id: 7, label: 'Carnapping MV', value: 'Carnapping MV' },
  { id: 8, label: 'Carnapping MC', value: 'Carnapping MC' },
  { id: 9, label: 'Complex Crime', value: 'Complex Crime' },
  { id: 10, label: 'Non-Index Crime', value: 'Non-Index Crime' },
];

// Update policeStations to show full names but keep internal values as 'Station 1', etc.
const policeStations = [
  { id: 1, label: 'MPD Station 1 - Raxabago', value: 'Station 1' },
  { id: 2, label: 'MPD Station 2 - Tondo', value: 'Station 2' },
  { id: 3, label: 'MPD Station 3 - Sta Cruz', value: 'Station 3' },
  { id: 4, label: 'MPD Station 4 - Sampaloc', value: 'Station 4' },
  { id: 5, label: 'MPD Station 5 - Ermita', value: 'Station 5' },
  { id: 6, label: 'MPD Station 6 - Sta Ana', value: 'Station 6' },
  { id: 7, label: 'MPD Station 7 - J. A. Santos', value: 'Station 7' },
  { id: 8, label: 'MPD Station 8 - Sta. Mesa', value: 'Station 8' },
  { id: 9, label: 'MPD Station 9 - Malate', value: 'Station 9' },
  { id: 10, label: 'MPD Station 10 - Pandacan', value: 'Station 10' },
  { id: 11, label: 'MPD Station 11 - Meisic', value: 'Station 11' },
  { id: 12, label: 'MPD Station 12 - Delpan', value: 'Station 12' },
  { id: 13, label: 'MPD Station 13 - Baseco', value: 'Station 13' },
  { id: 14, label: 'MPD Station 14 - Barbosa', value: 'Station 14' },
];

interface AlertNotification {
  alert_id: number;
  user_full_name: string;
  location: string;
  a_created?: string;
  distance?: string;
}

const AlertModal: React.FC<{
  notification: AlertNotification | null;
  visible: boolean;
  onAccept: (alertId: number) => void;
  onDismiss: () => void;
}> = ({ notification, visible, onAccept, onDismiss }) => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  if (!notification) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalAlertContainer, { backgroundColor: currentTheme.cardBackground }]}>
          <Ionicons name="warning" size={48} color="#E02323" style={{ marginBottom: 16 }} />
          <Text style={[styles.title, { color: currentTheme.text }]}>
            New Emergency Alert!
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.subtitle }]}>
            An urgent SOS has been triggered. Please respond immediately.
          </Text>
          <View style={styles.acceptButtonContainer}>
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={() => {
                onAccept(notification.alert_id);
                onDismiss(); // Close modal immediately on accept
              }}>
              <Text style={styles.acceptButtonText}>Respond to Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CrimeMap: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const isSmallDevice = width < 375;
  const mapHeight = Math.min(height * 0.45, 500);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const legendAnimation = new Animated.Value(0);
  
  // State for dropdowns and stats
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationName | null>(null);
  const [showCrimeTypeModal, setShowCrimeTypeModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [crimeStats, setCrimeStats] = useState<CrimeStat[]>([]);

  // --- ALERTS ARE NOW HANDLED BY THE CONTEXT ---
  const { notifications, acceptAlert, activeAlert, clearActiveAlert } = useAlerts();

  // --- NEW: State for the Alert Modal ---
  const [modalAlert, setModalAlert] = useState<AlertNotification | null>(null);
  const seenAlertIds = useRef(new Set<number>());

  // --- Map Filtering State from master ---
  const [filteredMapData, setFilteredMapData] = useState(totalCrimeData);

  // --- NEW: State for the officer's location ---
  const [officerLocation, setOfficerLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Add state for dynamic data
  const [dynamicCrimeCounts, setDynamicCrimeCounts] = useState<any>({});
  const [dynamicTotalCrime, setDynamicTotalCrime] = useState<any>({});

  // Fetch dynamic data from backend on mount
  useEffect(() => {
    console.log('Fetching dynamic crime stats...');
    fetch('http://mnl911.atwebpages.com/get_crime_stats.php')
      .then(res => res.json())
      .then(data => {
        console.log('Dynamic crime stats received:', data);
        if (data.success) {
          setDynamicCrimeCounts(data.crimeCounts);
          setDynamicTotalCrime(data.totalCrime);
        } else {
          console.error('Failed to fetch crime stats:', data.error);
        }
      })
      .catch(err => console.error('Error fetching dynamic crime stats:', err));
  }, []);

  // Helper to get merged count for a station/type
  const getMergedCrimeCount = (station: string, type: string) => {
    // Find base count from crimeData (individual crime type data)
    const baseFeature = crimeData.features.find(
      (f: any) => f.properties.station === station && f.properties.crimeType === type
    );
    const baseCount = baseFeature && baseFeature.properties ? baseFeature.properties.count : 0;
    const dynamicCount = dynamicCrimeCounts[station]?.[type] || 0;
    const mergedCount = baseCount + dynamicCount;
    
    console.log(`Merged count for ${station} - ${type}:`, {
      baseCount,
      dynamicCount,
      mergedCount
    });
    
    return mergedCount;
  };

  // Helper to get merged total crime for a station
  const getMergedTotalCrime = (station: string) => {
    const baseTotal = totalCrime[station as StationName]?.totalCrime || 0;
    const dynamicTotal = dynamicTotalCrime[station] || 0;
    return baseTotal + dynamicTotal;
  };

  // Only show the modal for the latest unseen alert IF there's no active alert
  useEffect(() => {
    if (activeAlert) {
      // If there's an active alert, don't show any new alert modals
      setModalAlert(null);
      return;
    }

    if (notifications.length > 0) {
      const latestUnseen = notifications.find(alert => !seenAlertIds.current.has(alert.alert_id));
      if (latestUnseen) {
        setModalAlert(latestUnseen);
      } else {
        setModalAlert(null);
      }
    } else {
      setModalAlert(null);
    }
  }, [notifications, activeAlert]);

  // Function to toggle legend visibility with animation
  const toggleLegend = () => {
    setIsLegendVisible(!isLegendVisible);
  };

  // Start animation when legend becomes visible
  useEffect(() => {
    if (isLegendVisible) {
      Animated.spring(legendAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [isLegendVisible, legendAnimation]);

  // Function to calculate crime statistics based on filters
  const calculateCrimeStats = () => {
    let filteredFeatures = totalCrimeData.features;
    let highestCrime = { count: 0, location: '', type: '' };
    
    // If a station is selected, show its specific rates
    if (selectedStation) {
      const stationRates = totalRates[selectedStation];
      const stationCrimeData = totalCrime[selectedStation];
      
      // Find the selected station's crime data
      const stationFeature = filteredFeatures.find(feature => 
        feature.properties?.station === selectedStation
      );
      
      if (stationFeature) {
        const properties = stationFeature.properties;
        if (properties) {
          // Use merged count for the selected crime type
          const mergedCount = selectedCrimeType 
            ? getMergedCrimeCount(selectedStation, selectedCrimeType)
            : getMergedTotalCrime(selectedStation);
          
          // Get the display name for the selected station
          const stationDisplayName = policeStations.find(ps => ps.value === selectedStation)?.label || selectedStation;
          const locationName = stationDisplayName.split(' - ')[1] || stationDisplayName;
          
          highestCrime = {
            count: mergedCount,
            location: locationName,
            type: selectedCrimeType || 'Total Crime'
          };
        }
      }
      
      setCrimeStats([
        { title: 'Index Total Rate', value: `${stationRates.indexRate}%` },
        { title: 'Non-index Total Rate', value: `${stationRates.nonIndexRate}%` },
        { title: selectedCrimeType ? `${selectedCrimeType} Count` : 'Total Crime Count', location: highestCrime.location || 'N/A', type: highestCrime.type || 'N/A', value: highestCrime.count.toString() },
      ]);
      return;
    }
    
    // If no station is selected, calculate averages of all stations
    const stations = Object.keys(totalRates) as StationName[];
    const avgIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].indexRate, 0) / stations.length).toFixed(2);
    const avgNonIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].nonIndexRate, 0) / stations.length).toFixed(2);
    
    // Find highest crime across all stations using merged data
    filteredFeatures.forEach(feature => {
      const properties = feature.properties;
      if (!properties) return;
      const { station } = properties as { station: string; count: number };
      const mergedCount = selectedCrimeType 
        ? getMergedCrimeCount(station, selectedCrimeType)
        : getMergedTotalCrime(station);
      
      if (mergedCount > highestCrime.count) {
        // Get the display name for this station
        const stationDisplayName = policeStations.find(ps => ps.value === station)?.label || station;
        const locationName = stationDisplayName.split(' - ')[1] || stationDisplayName;
        
        highestCrime = {
          count: mergedCount,
          location: locationName,
          type: selectedCrimeType || 'Total Crime'
        };
      }
    });
    
    setCrimeStats([
      { title: 'Index Total Rate', value: `${avgIndexRate}%` },
      { title: 'Non-index Total Rate', value: `${avgNonIndexRate}%` },
      { title: selectedCrimeType ? `Highest ${selectedCrimeType}` : 'Highest Crime', location: highestCrime.location, type: highestCrime.type, value: highestCrime.count.toString() },
    ]);
  };

  // Update stats when filters change
  useEffect(() => {
    calculateCrimeStats();
  }, [selectedStation, selectedCrimeType, dynamicCrimeCounts, dynamicTotalCrime]);

  const handleCrimeTypeSelect = (value: string) => {
    setSelectedCrimeType(value);
    setShowCrimeTypeModal(false);
  };

  const handleStationSelect = (value: StationName) => {
    setSelectedStation(value);
    setShowStationModal(false);
  };

  // Function to filter map data based on selections
  const filterMapData = () => {
    let dataToUse = totalCrimeData;
    
    // If a specific crime type is selected, use that crime type's data
    if (selectedCrimeType) {
      dataToUse = createCrimeTypeData(selectedCrimeType);
    }
    
    let filtered = dataToUse.features;
    
    // Apply station filter if selected
    if (selectedStation) {
      filtered = filtered.filter(feature => 
        feature.properties?.station === selectedStation
      );
    }
    
    // Update the count properties with merged data
    filtered = filtered.map(feature => {
      if (!feature.properties) return feature;
      
      const mergedCount = selectedCrimeType 
        ? getMergedCrimeCount(feature.properties.station, selectedCrimeType)
        : getMergedTotalCrime(feature.properties.station);
      
      return {
        ...feature,
        properties: {
          ...feature.properties,
          count: mergedCount
        }
      };
    });
    
    setFilteredMapData({
      type: 'FeatureCollection',
      features: filtered
    });
  };

  // Update filtered data when selections change or dynamic data updates
  useEffect(() => {
    filterMapData();
  }, [selectedCrimeType, selectedStation, dynamicCrimeCounts, dynamicTotalCrime]);

  // --- NEW: Effect to get and watch the officer's location ---
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      console.log('Initial officer location:', loc.coords.latitude, loc.coords.longitude); // Debug log
      setOfficerLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      // Optionally, watch position for live updates
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 10 },
        (loc) => {
          console.log('Updated officer location:', loc.coords.latitude, loc.coords.longitude); // Debug log
          setOfficerLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      );
      return () => sub.remove();
    })();
  }, []);

  // Refresh push notification token on app launch
  useEffect(() => {
    const refreshPushToken = async () => {
      try {
        const policeId = await AsyncStorage.getItem('police_id');
        if (!policeId) return;

        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            console.log('Permission not granted for notifications');
            return;
          }
        }

        const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
        if (expoPushToken) {
          const formData = new FormData();
          formData.append('police_id', policeId);
          formData.append('expo_push_token', expoPushToken);
          
          const tokenResponse = await fetch('http://mnl911.atwebpages.com/register_police_token.php', {
            method: 'POST',
            body: formData,
          });
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.success) {
              console.log('Push token refreshed successfully');
            } else {
              console.error('Failed to refresh push token:', tokenData.error);
            }
          }
        }
      } catch (error) {
        console.error('Error refreshing push token:', error);
      }
    };

    refreshPushToken();
  }, []);

  const router = useRouter();

  return (
    <SafeAreaView style={[styles.rootBg, { backgroundColor: currentTheme.background }]}>
      <AlertModal 
        visible={!!modalAlert}
        notification={modalAlert}
        onAccept={alertId => {
          acceptAlert(alertId);
          if (modalAlert) seenAlertIds.current.add(modalAlert.alert_id);
          setModalAlert(null);
        }}
        onDismiss={() => {
          if (modalAlert) seenAlertIds.current.add(modalAlert.alert_id);
          setModalAlert(null);
        }}
      />
      <Header />
      
      {/* Combined Active Alert Banner with Return to Map */}
      {activeAlert && (
        <TouchableOpacity
          style={{
            marginBottom: 12,
            borderRadius: 12,
            backgroundColor: '#E02323',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 3,
            elevation: 3,
            paddingVertical: 10,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          activeOpacity={0.85}
          onPress={() => router.push(`/police-officer/incident-response?alert_id=${activeAlert.alert_id}`)}
          accessibilityLabel="Return to Map"
        >
          <Ionicons name="warning" size={22} color="#fff" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 1, textAlign: 'center' }}>
              🚨 ACTIVE CALL
            </Text>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15, textAlign: 'center', marginBottom: 1 }}>
              Responding to Alert #{activeAlert.alert_id}
            </Text>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center', marginTop: 2, letterSpacing: 0.5 }}>
              Return to Map
            </Text>
          </View>
          {/* Chevron and X button side by side */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
            <Ionicons name="chevron-forward" size={22} color="#fff" />
            <TouchableOpacity
              style={{
                marginLeft: 6,
                backgroundColor: 'rgba(0,0,0,0.15)',
                borderRadius: 16,
                padding: 4,
              }}
              onPress={e => {
                e.stopPropagation && e.stopPropagation();
                clearActiveAlert();
              }}
              accessibilityLabel="Dismiss Active Alert"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.mapSection, { height: mapHeight }]}>
            <MapComponent 
              data={filteredMapData}
              userType="police"
              selectedCrimeType={selectedCrimeType}
              selectedStation={selectedStation}
              userLocation={officerLocation ?? undefined}
            />
            
            {/* Legend Toggle Button */}
            <TouchableOpacity
              style={[styles.legendToggle, { backgroundColor: currentTheme.cardBackground }]}
              onPress={toggleLegend}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="help"
                size={24}
                color={currentTheme.text}
              />
            </TouchableOpacity>

            {/* Animated Legend Container */}
            {isLegendVisible && (
              <Animated.View 
                style={[
                  styles.legendContainer,
                  { 
                    backgroundColor: currentTheme.cardBackground,
                    opacity: legendAnimation,
                    transform: [{
                      scale: legendAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.legendHeader}>
                  <Text style={[styles.legendTitle, { color: currentTheme.text }]}>Legend</Text>
                  <TouchableOpacity onPress={toggleLegend}>
                    <MaterialIcons name="close" size={20} color={currentTheme.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendColor, { backgroundColor: '#65ee15' }]} />
                  <Text style={[styles.legendLabel, { color: currentTheme.text }]}>Low (0-100)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendColor, { backgroundColor: '#fc4e2a' }]} />
                  <Text style={[styles.legendLabel, { color: currentTheme.text }]}>Medium (101-799)</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendColor, { backgroundColor: '#e31a1c' }]} />
                  <Text style={[styles.legendLabel, { color: currentTheme.text }]}>High (800+)</Text>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Selectors and stats */}
          <TouchableOpacity 
            style={[styles.selectorBtn, { marginBottom: 8 }]}
            activeOpacity={0.7}
            onPress={() => setShowCrimeTypeModal(true)}
            accessibilityLabel="Select crime type"
          >
            <Text style={[
              styles.selectorBtnText, 
              styles.defaultFont,
              isSmallDevice && { fontSize: 14 }
            ]}>
              {selectedCrimeType ? 
                crimeTypes.find(ct => ct.value === selectedCrimeType)?.label || selectedCrimeType : 
                'Select Crime Type'}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"    
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectorBtn,]}
            activeOpacity={0.7}
            onPress={() => setShowStationModal(true)}
            accessibilityLabel="Select police station"
          >
            <Text style={[
              styles.selectorBtnText, 
              styles.defaultFont,
              isSmallDevice && { fontSize: 14 }
            ]}>
              {selectedStation ? 
                policeStations.find(ps => ps.value === selectedStation)?.label : 
                'Select Station'}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"    
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {/* Crime Type Modal */}
          <SelectionModal
            visible={showCrimeTypeModal}
            onClose={() => setShowCrimeTypeModal(false)}
            title="Select Crime Type"
            options={crimeTypes}
            selectedValue={selectedCrimeType}
            onSelect={handleCrimeTypeSelect}
            resetLabel="Show All Crime Types"
            onReset={() => {
              setSelectedCrimeType('');
              setShowCrimeTypeModal(false);
            }}
            cardBorderColor={currentTheme.cardBorder}
          />
          {/* Station Modal */}
          <SelectionModal
            visible={showStationModal}
            onClose={() => setShowStationModal(false)}
            title="Select Police Station"
            options={policeStations}
            selectedValue={selectedStation}
            onSelect={value => handleStationSelect(value as StationName)}
            resetLabel="Show All Stations"
            onReset={() => {
              setSelectedStation(null);
              setShowStationModal(false);
            }}
            cardBorderColor={currentTheme.cardBorder}
          />

          {/* Crime Stats */}
          <View style={styles.statsContainer}>
            {crimeStats.map((stat, index) => (
              <React.Fragment key={index}>
                <View 
                  style={[
                    styles.statCard,
                    { 
                      width: width / 3 - 16,
                      backgroundColor: currentTheme.cardBackground
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.statTitle, 
                      styles.defaultFont,
                      isSmallDevice && { fontSize: 12 }
                    ]}
                    numberOfLines={2}
                  >
                    {stat.title}
                  </Text>
                  
                  {stat.location ? (
                    <>
                      <Text 
                        style={[
                          styles.statLocation, 
                          styles.defaultFont,
                          isSmallDevice && { fontSize: 11 },
                          { color: currentTheme.text }
                        ]}
                      >
                        {stat.location}
                      </Text>
                      <Text 
                        style={[
                          styles.statType, 
                          styles.defaultFont,
                          isSmallDevice && { fontSize: 9 },
                          { color: currentTheme.subtitle }
                        ]}
                      >
                        {stat.type}
                      </Text>
                    </>
                  ) : null}
                  
                  <Text 
                    style={[
                      styles.statValue, 
                      styles.defaultFont,
                      isSmallDevice && { fontSize: 16 },
                      { color: currentTheme.text }
                    ]}
                  >
                    {stat.value}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>

      <NavBottomBar activeScreen="Home" />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootBg: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    padding: 16,
  },
  mapSection: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  selectorBtn: {
    backgroundColor: '#E02323',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',       // ← row layout
    justifyContent: 'space-between',
  },
  selectorBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 12,
    color: '#E02323',
    marginBottom: 4,
    fontFamily: fonts.poppins.semiBold,
    fontWeight: '700',
  },
  statLocation: {
    fontSize: 14,
    marginBottom: 2,
    fontFamily: fonts.poppins.regular,
  },
  statType: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: fonts.poppins.bold,
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.poppins.bold,
    fontWeight: '900',
  },
  bottomNav: {
    width: '100%',
    height: 65,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      android: {
        height: 110,
      },
      ios: {
        height: 75,
      },
    }),
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavIconContainerActive: {
    backgroundColor: '#FFE6E6',
  },
  bottomNavIconActive: {
    color: '#E02323',
  },
  bottomNavIconInactive: {
    color: '#A4A4A4',
  },
  bottomNavLabelActive: {
    color: '#E02323',
    fontSize: 12,
    fontFamily: fonts.poppins.medium,
    textAlign: 'center',
  },
  bottomNavLabelInactive: {
    color: '#A4A4A4',
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
    textAlign: 'center',
  },
  homeIndicatorWrap: {
    width: '100%',
    height: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  homeIndicator: {
    width: 136,
    height: 7,
    backgroundColor: '#A4A4A4',
    borderRadius: 100,
  },
  iconPlaceholder: {
    width: 22,
    height: 22,
    backgroundColor: '#ccc',
    borderRadius: 11,
  },
  defaultFont: {
    fontFamily: fonts.poppins.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.poppins.semiBold,
    color: '#E02323',
  },
  closeButton: {
    padding: 4,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionSelected: {
    backgroundColor: '#FFE5E5',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    color: '#000',
  },
  modalOptionTextSelected: {
    color: '#E02323',
    fontFamily: fonts.poppins.semiBold,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  legendToggle: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 11,
  },
  legendContainer: {
    position: 'absolute',
    right: 60,
    bottom: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 12,
    zIndex: 10,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: fonts.poppins.semiBold,
    color: '#333',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 12,
    fontFamily: fonts.poppins.regular,
  },
  alertsContainer: {
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 22,
    fontFamily: fonts.poppins.bold,
    color: '#E02323',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  card: {
    width: 320,
    marginRight: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#E02323',
  },
  urgentCard: {
    backgroundColor: '#fff0f0',
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.poppins.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontFamily: fonts.poppins.semiBold,
    fontSize: 14,
  },
  detailText: {
    fontFamily: fonts.poppins.regular,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  acceptButton: {
    backgroundColor: '#E02323',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  urgentAcceptButton: {
    backgroundColor: '#ff4444',
  },
  acceptButtonText: {
    color: '#fff',
    fontFamily: fonts.poppins.bold,
    fontSize: 16,
  },
  modalAlertContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  acceptButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    position: 'relative',
    minHeight: 64,
  },
  activeAlertText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.poppins.medium,
  },
  clearActiveButton: {
    padding: 5,
  },
});

export default CrimeMap;