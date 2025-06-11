import React, { useEffect, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { crimeData, StationName, totalRates } from '../../../constants/mapData';
import MapComponent from '../../components/MapComponent';
import { fonts } from '../../config/fonts';

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

const policeStations = [
  { id: 1, label: 'MPD Station 1 - Raxa Bago', value: 'MPD Station 1 - Raxa Bago' },
  { id: 2, label: 'MPD Station 2 - Tondo', value: 'MPD Station 2 - Tondo' },
  { id: 3, label: 'MPD Station 3 - Sta Cruz', value: 'MPD Station 3 - Sta Cruz' },
  { id: 4, label: 'MPD Station 4 - Sampaloc', value: 'MPD Station 4 - Sampaloc' },
  { id: 5, label: 'MPD Station 5 - Ermita', value: 'MPD Station 5 - Ermita' },
  { id: 6, label: 'MPD Station 6 - Sta Ana', value: 'MPD Station 6 - Sta Ana' },
  { id: 7, label: 'MPD Station 7 - J. A. Santos', value: 'MPD Station 7 - J. A. Santos' },
  { id: 8, label: 'MPD Station 8 - Sta. Mesa', value: 'MPD Station 8 - Sta. Mesa' },
  { id: 9, label: 'MPD Station 9 - Malate', value: 'MPD Station 9 - Malate' },
  { id: 10, label: 'MPD Station 10 - Pandacan', value: 'MPD Station 10 - Pandacan' },
  { id: 11, label: 'MPD Station 11 - Meisic', value: 'MPD Station 11 - Meisic' },
  { id: 12, label: 'MPD Station 12 - Delpan', value: 'MPD Station 12 - Delpan' },
  { id: 13, label: 'MPD Station 13 - Baseco', value: 'MPD Station 13 - Baseco' },
  { id: 14, label: 'MPD Station 14 - Barbosa', value: 'MPD Station 14 - Barbosa' },
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

const PoliceOfficerHome: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const mapHeight = Math.min(height * 0.35, 400);

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
              {selectedCrimeType ? 
                crimeTypes.find(ct => ct.value === selectedCrimeType)?.label : 
                'Select Crime Type'}
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
              {selectedStation ? 
                policeStations.find(ps => ps.value === selectedStation)?.label : 
                'Select Station'}
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
                      key={type.id}
                      style={[
                        styles.modalOption,
                        selectedCrimeType === type.value && styles.modalOptionSelected
                      ]}
                      onPress={() => handleCrimeTypeSelect(type.value)}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        selectedCrimeType === type.value && styles.modalOptionTextSelected
                      ]}>
                        {type.label}
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
                  {policeStations.map((station) => (
                    <TouchableOpacity
                      key={station.id}
                      style={[
                        styles.modalOption,
                        selectedStation === station.value && styles.modalOptionSelected
                      ]}
                      onPress={() => handleStationSelect(station.value as StationName)}
                    >
                      <Text style={[
                        styles.modalOptionText,
                        selectedStation === station.value && styles.modalOptionTextSelected
                      ]}>
                        {station.label}
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
  statCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statLocation: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 2,
  },
  statType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    color: '#212121',
    fontFamily: fonts.poppins.semiBold,
  },
});

export default PoliceOfficerHome;
  