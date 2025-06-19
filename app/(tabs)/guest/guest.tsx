import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { crimeData, StationName, totalRates } from '../../../constants/mapData';
import MapComponent from '../../components/MapComponent';

interface District {
  id: number;
  name: string;
}

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

const SIDEBAR_WIDTH = 300;

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
  { id: 1, label: 'MPD Station 1 - Raxabago', value: 'MPD Station 1 - Raxabago' },
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

const GuestCrimeMap: React.FC = () => {
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationName | null>(null);
  const [crimeStats, setCrimeStats] = useState<CrimeStat[]>([]);
  const [showCrimeTypeDropdown, setShowCrimeTypeDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);

  const { width, height } = useWindowDimensions();
  const mapHeight = Math.min(height * 0.35, 400);

  // Close other dropdown when one is opened
  const handleCrimeTypeDropdown = () => {
    setShowCrimeTypeDropdown(!showCrimeTypeDropdown);
    setShowStationDropdown(false);
  };

  const handleStationDropdown = () => {
    setShowStationDropdown(!showStationDropdown);
    setShowCrimeTypeDropdown(false);
  };

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

  return (
    <View style={styles.wrapper}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <ScrollView contentContainerStyle={styles.sidebarContent}>
          {/* Logo */}
          <View style={styles.logoSticky}>
            <Image
              source={{
                uri: 'https://c.animaapp.com/mbqzsrccadZLwW/img/chatgpt-image-apr-25--2025--11-37-20-pm-2.png',
              }}
              style={styles.logo}
            />
            <View>
              <Text style={styles.logoTitle}>ALERTO MNL</Text>
              <Text style={styles.logoSub}>Response System</Text>
            </View>
          </View>

          {/* Crime Type Selector */}
          <View style={[styles.card, { zIndex: showCrimeTypeDropdown ? 3 : 1 }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="alert-circle-outline" size={20} color="#e02323" />
              <Text style={styles.cardTitle}>Crime Type</Text>
            </View>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.selectBtn}
                activeOpacity={0.7}
                onPress={handleCrimeTypeDropdown}
              >
                <Text style={styles.selectTxt}>
                  {selectedCrimeType ? 
                    crimeTypes.find(ct => ct.value === selectedCrimeType)?.label || selectedCrimeType : 
                    'Select Crime Type'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
              
              {showCrimeTypeDropdown && (
                <View style={[styles.dropdown, { zIndex: 1000 }]}>
                  {crimeTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.dropdownOption,
                        selectedCrimeType === type.value && styles.dropdownOptionActive
                      ]}
                      onPress={() => {
                        setSelectedCrimeType(type.value);
                        setShowCrimeTypeDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        selectedCrimeType === type.value && styles.dropdownOptionTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Station Selector */}
          <View style={[styles.card, { zIndex: showStationDropdown ? 3 : 1 }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={20} color="#e02323" />
              <Text style={styles.cardTitle}>Station</Text>
            </View>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.selectBtn}
                activeOpacity={0.7}
                onPress={handleStationDropdown}
              >
                <Text style={styles.selectTxt}>
                  {selectedStation ? 
                    policeStations.find(ps => ps.value === selectedStation)?.label : 
                    'Select Station'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
              
              {showStationDropdown && (
                <View style={[styles.dropdown, { zIndex: 1000 }]}>
                  {policeStations.map((station) => (
                    <TouchableOpacity
                      key={station.id}
                      style={[
                        styles.dropdownOption,
                        selectedStation === station.value && styles.dropdownOptionActive
                      ]}
                      onPress={() => {
                        setSelectedStation(station.value as StationName);
                        setShowStationDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        selectedStation === station.value && styles.dropdownOptionTextActive
                      ]}>
                        {station.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Last Crime Info */}
          <View style={styles.infoCard}>
            <Ionicons name="alert-circle-outline" size={20} color="#e02323" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Last Crime</Text>
              <Text style={styles.infoSub}>Tondo • 1 day ago</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        <Text style={styles.mainHeader}>Welcome!</Text>
        <Text style={styles.mainSubheader}>
          A public crime mapping in City of Manila for safety and awareness
        </Text>

        {/* Mapbox Section */}
        <View style={[styles.mapContainer, { height: mapHeight }]}>
          <MapComponent
            data={crimeData}
            userType="guest"
            selectedCrimeType={selectedCrimeType}
            selectedStation={selectedStation}
          />
          
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#65ee15' }]} />
              <Text style={styles.legendLabel}>Low</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#feb24c' }]} />
              <Text style={styles.legendLabel}>Medium</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: '#e31a1c' }]} />
              <Text style={styles.legendLabel}>High</Text>
            </View>
          </View>
        </View>

        {/* Based on the System Legend
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: '#65ee15' }]} />
                <Text style={styles.legendLabel}>No reported cases</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: '#feb24c' }]} />
                <Text style={styles.legendLabel}>Low severity</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: '#fc4e2a' }]} />
                <Text style={styles.legendLabel}>Medium severity</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: '#e31a1c' }]} />
                <Text style={styles.legendLabel}>High severity</Text>
              </View>
            </View> */}

        {/* Crime Stats */}
        <View style={styles.statsContainer}>
          {crimeStats.map((stat, index) => (
            <View 
              key={index} 
              style={[
                styles.statCard,
                { backgroundColor: index === 0 ? '#EFFBF6' : index === 1 ? '#EFF6FF' : '#FEF3F2' }
              ]}
            >
              <Text style={styles.statTitle}>{stat.title}</Text>
              {stat.location && (
                <>
                  <Text style={styles.statLocation}>{stat.location}</Text>
                  <Text style={styles.statType}>{stat.type}</Text>
                </>
              )}
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fafafa',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    backgroundColor: '#fff',
  },
  sidebarContent: {
    padding: 16,
    paddingBottom: 40,
  },
  logoSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 8,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e02323',
  },
  logoSub: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 2,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectTxt: {
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    maxHeight: 200,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptionActive: {
    backgroundColor: '#f5f5f5',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOptionTextActive: {
    color: '#e02323',
    fontWeight: '600',
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 20,
  },
  mainHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#b50000',
  },
  mainSubheader: {
    fontSize: 14,
    color: '#58578c',
    marginBottom: 24,
  },
  mapContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fef3f2',
    position: 'relative',
    zIndex: 0,
  },
  infoText: { 
    marginLeft: 8 
  },
  infoTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#e02323' 
  },
  infoSub: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
});

export default GuestCrimeMap;
