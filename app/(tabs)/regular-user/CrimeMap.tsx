import { Feature, Point } from 'geojson';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

import * as Location from 'expo-location';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomTabBar from '../../../app/components/CustomTabBar';
import { createCrimeTypeData, crimeData, StationName, totalCrime, totalCrimeData, totalRates } from '../../../constants/mapData';
import MapComponent from '../../components/MapComponent';
import SelectionModal from '../../components/SelectionModal';
import { fonts } from '../../config/fonts';
import { theme, useTheme } from '../../context/ThemeContext';

interface CrimeFeature extends Feature<Point> {
  properties: {
    station: StationName;
    crimeType: string;
    count: number;
    isIndexCrime: boolean;
  };
}

// Placeholder icons
const SearchIcon = () => <MaterialIcons name="search" size={24} color="#A4A4A4" />;

// Crime types and stations data
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

export type CrimeStat = {
  title: string;
  value: string;
  location?: string;
  type?: string;
};

export type SeverityLevel = {
  level: string;
  color: string;
};

const severityLevels: SeverityLevel[] = [
  { level: 'Low', color: '#65ee15' },
  { level: 'Medium', color: '#f89900' },
  { level: 'High', color: '#ff0000' },
];

const CrimeMap: React.FC = () => {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? theme.dark : theme.light;
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const containerPadding = isSmallDevice ? 12 : 1;
  const mapHeight = Math.min(height * 0.45, 500);
  const [isLegendVisible, setIsLegendVisible] = useState(false);
  const legendAnimation = new Animated.Value(0);

  // State for dropdowns and stats
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationName | null>(null);
  const [showCrimeTypeModal, setShowCrimeTypeModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [crimeStats, setCrimeStats] = useState<CrimeStat[]>([]);
  const [filteredMapData, setFilteredMapData] = useState(totalCrimeData);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  // Add reset function
  const handleReset = () => {
    setSelectedCrimeType('');
    setSelectedStation(null);
    setShowCrimeTypeModal(false);
    setShowStationModal(false);
    setFilteredMapData(totalCrimeData);
  };

  // Function to filter map data based on selections
  const filterMapData = () => {
    let dataToUse = totalCrimeData;
    
    // If a specific crime type is selected, use that crime type's data
    if (selectedCrimeType) {
      dataToUse = createCrimeTypeData(selectedCrimeType);
    }
    
    let filtered = dataToUse.features as CrimeFeature[];
    
    // Apply station filter if selected
    if (selectedStation) {
      filtered = filtered.filter(feature => 
        feature.properties.station === selectedStation
      );
    }
    
    // Update the count properties with merged data
    filtered = filtered.map(feature => {
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

  // Function to calculate crime statistics based on filters
  const calculateCrimeStats = () => {
    let filteredFeatures = totalCrimeData.features as CrimeFeature[];
    
    // Apply crime type filter if selected
    if (selectedCrimeType) {
      // For total crime data, we need to check if the crime type matches
      // Since we're showing total crime, we'll filter based on whether the station has that crime type
      filteredFeatures = filteredFeatures.filter(feature => {
        // For total crime data, we'll show all stations but highlight the ones with the selected crime type
        return true; // Show all stations for now, filtering will be handled by the map
      });
    }

    // Apply station filter if selected
    if (selectedStation) {
      filteredFeatures = filteredFeatures.filter(feature => 
        feature.properties.station === selectedStation
      );
    }

    let highestCrime = { count: 0, location: '', type: '' };

    // If a station is selected, show its specific rates
    if (selectedStation) {
      const stationRates = totalRates[selectedStation];
      const stationCrimeData = totalCrime[selectedStation];
      
      // Find the selected station's crime data
      const stationFeature = filteredFeatures.find(feature => 
        feature.properties.station === selectedStation
      );
      
      if (stationFeature) {
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

      // Use merged data for the selected crime type count
      const mergedCrimeCount = selectedCrimeType 
        ? getMergedCrimeCount(selectedStation, selectedCrimeType)
        : getMergedTotalCrime(selectedStation);

      setCrimeStats([
        { 
          title: 'Index Total Rate', 
          value: `${stationRates.indexRate}%`
        },
        { 
          title: 'Non-index Total Rate', 
          value: `${stationRates.nonIndexRate}%`
        },
        { 
          title: selectedCrimeType ? `${selectedCrimeType} Count` : 'Total Crime Count', 
          location: highestCrime.location || 'N/A', 
          type: highestCrime.type || 'N/A', 
          value: mergedCrimeCount.toString() 
        },
      ]);
      return;
    }

    // If no station is selected, calculate averages of all stations
    const stations = Object.keys(totalRates) as StationName[];
    const avgIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].indexRate, 0) / stations.length).toFixed(2);
    const avgNonIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].nonIndexRate, 0) / stations.length).toFixed(2);

    // Find highest crime across all stations using merged data
    filteredFeatures.forEach((feature: CrimeFeature) => {
      const { station } = feature.properties;
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
      { 
        title: 'Index Total Rate', 
        value: `${avgIndexRate}%`
      },
      { 
        title: 'Non-index Total Rate', 
        value: `${avgNonIndexRate}%`
      },
      { 
        title: selectedCrimeType ? `Highest ${selectedCrimeType}` : 'Highest Crime', 
        location: highestCrime.location || 'N/A', 
        type: highestCrime.type || 'N/A', 
        value: highestCrime.count.toString() 
      },
    ]);

  };

  // Recalculate stats when filters change
  useEffect(() => {
    console.log('Filter state changed:', {
      crimeType: selectedCrimeType,
      station: selectedStation,
      timestamp: new Date().toISOString()
    });
    
    // Log the filtered data before calculation
    const filteredFeatures = totalCrimeData.features.filter((feature) => {
      const crimeFeature = feature as CrimeFeature;
      const matchesStation = !selectedStation || crimeFeature.properties.station === selectedStation;
      return matchesStation;
    });
    
    console.log('Filtered data stats:', {
      totalFeatures: filteredFeatures.length,
      crimeTypeFilter: selectedCrimeType,
      stationFilter: selectedStation
    });
    
    calculateCrimeStats();
  }, [selectedCrimeType, selectedStation]);

  // Function to handle selection with logging
  const handleCrimeTypeSelect = (value: string) => {
    setSelectedCrimeType(value);
    setShowCrimeTypeModal(false);
  };

  const handleStationSelect = (value: string) => {
    setSelectedStation(value as StationName);
    setShowStationModal(false);
  };

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
  }, [isLegendVisible]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      // Optionally, watch position for live updates
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 10 },
        (loc) => setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })
      );
      return () => sub.remove();
    })();
  }, []);

  return (
    <SafeAreaView style={[styles.rootBg, { backgroundColor: currentTheme.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.mapSection, { height: mapHeight }]}>
            <MapComponent 
              selectedCrimeType={selectedCrimeType} 
              selectedStation={selectedStation}
              userType="regular"
              data={filteredMapData}
              userLocation={userLocation ?? undefined}
              hideControls={false}
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
            onSelect={handleStationSelect}
            resetLabel="Show All Stations"
            onReset={() => {
              setSelectedStation(null);
              setShowStationModal(false);
            }}
            cardBorderColor={currentTheme.cardBorder}
          />

          <View style={styles.statsRow}>
            {crimeStats.map((stat, index) => (
              <View 
                key={index} 
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
            ))}
          </View>
        </View>
      </ScrollView>

      <CustomTabBar activeScreen="CrimeMap" />
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
    flex: 1,
    padding: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    backgroundColor:'#FEF3F2' ,
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
    color: '#212121',
    marginBottom: 2,
    fontFamily: fonts.poppins.regular,
  },
  statType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: fonts.poppins.bold,

  },
  statValue: {
    fontSize: 20,
    color: '#212121',
    fontFamily: fonts.poppins.bold,
    fontWeight: 900,
  },
  defaultFont: {
    fontFamily: fonts.poppins.regular,
  },
  legendToggle: {
    position: 'absolute',
    right: 10,
    bottom: 45,
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
    color: '#333',
    fontFamily: fonts.poppins.regular,
  },
});

export default CrimeMap;