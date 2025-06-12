import React, { useEffect, useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { crimeData, StationName, totalRates } from '../../../constants/mapData';
import MapComponent from '../../components/MapComponent';
import { fonts } from '../../config/fonts';
// NOTE: All code related to expo-notifications, pop-up modals, and listeners
// has been removed to fix the error in Expo Go.

// --- Your existing constants and types ---
const SearchIcon = () => <View style={styles.iconPlaceholder} />;
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
        feature.properties?.crimeType === selectedCrimeType
      );
    }

    let highestCrime = { count: 0, location: '', type: '' };

    // If a station is selected, show its specific rates
    if (selectedStation) {
      const stationRates = totalRates[selectedStation];
      
      // Find highest crime for the selected station
      filteredFeatures
        .filter(feature => feature.properties?.station === selectedStation)
        .forEach(feature => {
          const properties = feature.properties;
          if (!properties) return;
          
          const { station, crimeType, count } = properties as { station: string; crimeType: string; count: number };
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
      const properties = feature.properties;
      if (!properties) return;
      
      const { station, crimeType, count } = properties as { station: string; crimeType: string; count: number };
      if (count > highestCrime.count) {
        highestCrime = {
          count,
          location: station.split(' - ')[1],
          type: crimeType
        };
      }
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
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.mapSection, { height: mapHeight }]}>
            <MapComponent 
              data={crimeData}
              userType="police"
              selectedCrimeType={selectedCrimeType}
              selectedStation={selectedStation}
            />
          </View>

          {/* Selectors and stats */}
          <TouchableOpacity 
            style={[styles.selectorBtn, { marginBottom: 8 }]}
            activeOpacity={0.7}
            onPress={() => setShowCrimeTypeModal(true)}
          >
            <Text style={[
              styles.selectorBtnText, 
              styles.defaultFont,
              isSmallDevice && { fontSize: 14 }
            ]}>
              {selectedCrimeType ? selectedCrimeType : 'Select Crime Type'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectorBtn, { marginBottom: 16 }]}
            activeOpacity={0.7}
            onPress={() => setShowStationModal(true)}
          >
            <Text style={[
              styles.selectorBtnText, 
              styles.defaultFont,
              isSmallDevice && { fontSize: 14 }
            ]}>
              {selectedStation ? selectedStation : 'Select Station'}
            </Text>
          </TouchableOpacity>

          {/* Crime Type Modal */}
          <Modal
            visible={showCrimeTypeModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCrimeTypeModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowCrimeTypeModal(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Crime Type</Text>
                  <TouchableOpacity 
                    onPress={() => setShowCrimeTypeModal(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {crimeTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.modalOption,
                        selectedCrimeType === type && styles.modalOptionSelected
                      ]}
                      onPress={() => handleCrimeTypeSelect(type)}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        selectedCrimeType === type && styles.modalOptionTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Station Modal */}
          <Modal
            visible={showStationModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowStationModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowStationModal(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Police Station</Text>
                  <TouchableOpacity 
                    onPress={() => setShowStationModal(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {stations.map((station) => (
                    <TouchableOpacity
                      key={station}
                      style={[
                        styles.modalOption,
                        selectedStation === station && styles.modalOptionSelected
                      ]}
                      onPress={() => handleStationSelect(station as StationName)}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        selectedStation === station && styles.modalOptionTextSelected
                      ]}>
                        {station}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Crime Stats */}
          <View style={styles.statsContainer}>
            {crimeStats.map((stat, index) => (
              <View 
                key={index} 
                style={[
                  styles.statCard,
                  { width: width / 3 - 16 }
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
      </ScrollView>

      <NavBottomBar activeScreen="Home" />

    </SafeAreaView>
  );
};

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
  }
});

export default CrimeMap;
