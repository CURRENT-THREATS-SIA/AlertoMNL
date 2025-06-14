import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';

// NOTE: All code related to expo-notifications, pop-up modals, and listeners
// has been removed to fix the error in Expo Go.

// Placeholder icons
const SearchIcon = () => <View style={styles.iconPlaceholder} />;

// Example remote images (replace with local require if you have assets)
const mapBgUri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/frame-3997.png';
const locationUri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/location.png';
const location1Uri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/location-1.png';
const location2Uri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/location-2.png';

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

const crimeStats: CrimeStat[] = [
  { title: 'Index Total Rate', value: '84.41%' },
  { title: 'Non-index Total Rate', value: '505.7%' },
  { title: 'Highest Crime', location: 'Ermita', type: 'Theft', value: '231' },
];

const severityLevels: SeverityLevel[] = [
  { level: 'Low', color: '#65ee15' },
  { level: 'Medium', color: '#f89900' },
  { level: 'High', color: '#ff0000' },
];

const crimeTypes = [
  "Theft", "Robbery", "Assault", "Homicide", "Vandalism", "Drugs", "Other"
];
const stations = [
  "Ermita Police Station", "Sampaloc Police Station", "Tondo Police Station",
  "Malate Police Station", "Sta. Cruz Police Station", "Other"
];

const CrimeMap: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const containerPadding = isSmallDevice ? 12 : 1;
  const mapHeight = Math.min(height * 0.35, 400);

  // Calculate stats card width based on screen width
  const statsCardWidth = (width - 40 - 16) / 3; // 40 for container padding, 16 for gaps

  // Dropdown state
  const [selectedCrimeType, setSelectedCrimeType] = React.useState('');
  const [selectedStation, setSelectedStation] = React.useState('');

  const CrimeMap: React.FC = () => {
    const { width, height } = useWindowDimensions();
    const isSmallDevice = width < 375;
    const mapHeight = Math.min(height * 0.35, 400);
    const statsCardWidth = (width - 40 - 16) / 3;

    // State for dropdowns and stats
    const [selectedCrimeType, setSelectedCrimeType] = useState('');
    const [selectedStation, setSelectedStation] = useState<StationName | null>(null);
    const [showCrimeTypeModal, setShowCrimeTypeModal] = useState(false);
    const [showStationModal, setShowStationModal] = useState(false);
    const [crimeStats, setCrimeStats] = useState<CrimeStat[]>([]);

    // Function to calculate crime statistics based on filters
    const calculateCrimeStats = () => {
      let filteredFeatures = crimeData.features;
      
      // Apply crime type filter if selected
      if (selectedCrimeType) {
        filteredFeatures = filteredFeatures.filter(feature => 
          feature.properties.crimeType === selectedCrimeType
        );
      }

      let highestCrime = { count: 0, location: '', type: '' };

      // If a station is selected, show its specific rates
      if (selectedStation) {
        const stationRates = totalRates[selectedStation];
        
        // Find highest crime for the selected station
        filteredFeatures
          .filter(feature => feature.properties.station === selectedStation)
          .forEach(feature => {
            const { station, crimeType, count } = feature.properties;
            if (count > highestCrime.count) {
              highestCrime = {
                count,
                location: station.split(' - ')[1],
                type: crimeType
              };
            }
          });

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
            title: 'Highest Crime', 
            location: highestCrime.location || 'N/A', 
            type: highestCrime.type || 'N/A', 
            value: highestCrime.count.toString() 
          },
        ]);
        return;
      }

      // If no station is selected, calculate averages of all stations
      const stations = Object.keys(totalRates) as StationName[];
      const avgIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].indexRate, 0) / stations.length).toFixed(2);
      const avgNonIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].nonIndexRate, 0) / stations.length).toFixed(2);

      // Find highest crime across all stations
      filteredFeatures.forEach(feature => {
        const { station, crimeType, count } = feature.properties;
      });

      setCrimeStats([
        { title: 'Index Total Rate', value: `${avgIndexRate}%` },
        { title: 'Non-index Total Rate', value: `${avgNonIndexRate}%` },
        { 
          title: 'Highest Crime',
          location: highestCrime.location,
          type: highestCrime.type,
          value: highestCrime.count.toString()
        },
      ]);
    };

    // Update stats when filters change
    useEffect(() => {
      calculateCrimeStats();
    }, [selectedCrimeType, selectedStation]);

    // Function to handle selection
    const handleCrimeTypeSelect = (value: string) => {
      setSelectedCrimeType(value);
      setShowCrimeTypeModal(false);
    };

    const handleStationSelect = (value: StationName) => {
      setSelectedStation(value);
      setShowStationModal(false);
    };

  return (
    <SafeAreaView style={styles.rootBg}>
      {/* Header */}
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Map section */}
          <View style={styles.contentWrapper}>
            <View style={[styles.mapSection, { height: mapHeight }]}>
              <Image 
                source={{ uri: mapBgUri }} 
                style={styles.mapBg}
                resizeMode="cover"
              />
              <View style={[styles.mapOverlay, { padding: containerPadding }]}>
                {/* Search bar */}
                <View style={styles.searchBar}>
                  <SearchIcon />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search…"
                    placeholderTextColor="#c6c6c6"
                  />
                </View>
                {/* Map controls */}
                <View style={styles.mapControlsRow}>
                  <Image source={{ uri: locationUri }} style={styles.locationIcon} />
                  <Image source={{ uri: location1Uri }} style={styles.locationSmallIcon} />
                </View>
                {/* Legend and location2 */}
                <View style={styles.legendRow}>
                  <View style={styles.legendCard}>
                    {severityLevels.map((item, idx) => (
                      <View key={idx} style={styles.legendItemRow}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <Text style={[styles.legendLabel, styles.defaultFont]}>{item.level}</Text>
                      </View>
                    ))}
                  </View>
                  <Image source={{ uri: location2Uri }} style={styles.location2Icon} />
                </View>
              </View>
            </View>

            {/* Selectors and stats */}
            <View style={styles.selectorsStatsSection}>
              {/* Crime Type Dropdown Button */}
              <View style={[styles.selectorBtn, { marginBottom: 8, position: 'relative', overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={[styles.selectorBtnText, styles.defaultFont, isSmallDevice && { fontSize: 14 }]}>
                  {selectedCrimeType || "Select Crime Type"}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={28}
                  color="#fff"
                  style={styles.dropdownIcon}
                />
                <Picker
                  selectedValue={selectedCrimeType}
                  onValueChange={setSelectedCrimeType}
                  style={styles.pickerOverlay}
                  dropdownIconColor="#fff"
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Crime Type" value="" enabled={false} color="#212121" />
                  {crimeTypes.map(type => (
                    <Picker.Item key={type} label={type} value={type} color="#212121" />
                  ))}
                </Picker>
              </View>
              
              {/* Station Dropdown Button */}
              <View style={[styles.selectorBtn, { marginBottom: 16, position: 'relative', overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={[styles.selectorBtnText, styles.defaultFont, isSmallDevice && { fontSize: 14 }]}>
                  {selectedStation || "Select Station"}
                </Text>
                <MaterialIcons
                  name="arrow-drop-down"
                  size={28}
                  color="#fff"
                  style={styles.dropdownIcon}
                />
                <Picker
                  selectedValue={selectedStation}
                  onValueChange={setSelectedStation}
                  style={styles.pickerOverlay}
                  dropdownIconColor="#fff"
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Station" value="" enabled={false} color="#212121" />
                  {stations.map(station => (
                    <Picker.Item key={station} label={station} value={station} color="#212121" />
                  ))}
                </Picker>
              </View>

              <View style={styles.statsRow}>
                {crimeStats.map((stat, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.statCard,
                      { width: statsCardWidth }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.statTitle, 
                        styles.defaultFont,
                        isSmallDevice && { fontSize: 9 }
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
                            isSmallDevice && { fontSize: 11 }
                          ]}
                        >
                          {stat.location}
                        </Text>
                        <Text 
                          style={[
                            styles.statType, 
                            styles.defaultFont,
                            isSmallDevice && { fontSize: 10 }
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
                        isSmallDevice && { fontSize: 16 }
                      ]}
                    >
                      {stat.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <NavBottomBar activeScreen="Home" />
    </SafeAreaView>
  );
};

export default CrimeMap;

  const styles = StyleSheet.create({
    rootBg: {
      flex: 1,
      backgroundColor: '#F5F5F5',
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
      backgroundColor: 'white',
      padding: 12,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    selectorBtnText: {
      fontSize: 16,
      color: '#212121',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 8,
    },
    statCard: {
      backgroundColor: '#FFD8D8',
      borderRadius: 8,
      padding: 12,
      minHeight: 100,
      width: '31%',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statTitle: {
      fontSize: 11,
      color: '#E02323',
      fontFamily: fonts.poppins.semiBold,
      marginBottom: 4,
      fontWeight: '600',
    },
    statValue: {
      fontSize: 20,
      color: '#000',
      fontFamily: fonts.poppins.bold,
      marginTop: 'auto',
      fontWeight: '700',
    },
    statLocation: {
      fontSize: 12,
      color: '#000',
      fontFamily: fonts.poppins.medium,
      marginBottom: 2,
    },
    statType: {
      fontSize: 11,
      color: '#886A6A',
      fontFamily: fonts.poppins.regular,
      marginBottom: 4,
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
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: fonts.poppins.medium,
      color: '#212121',
    },
    closeButton: {
      padding: 4,
    },
    modalOption: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    modalOptionSelected: {
      backgroundColor: '#F0F0F0',
    },
    modalOptionText: {
      fontSize: 16,
      color: '#212121',
      fontFamily: fonts.poppins.regular,
    },
    modalOptionTextSelected: {
      color: '#007AFF',
      fontFamily: fonts.poppins.medium,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginTop: 16,
    },
  });

  return <CrimeMap />;
};

export default CrimeMap;