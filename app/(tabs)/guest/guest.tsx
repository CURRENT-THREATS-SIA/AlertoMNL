import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createCrimeTypeData, StationName, totalCrime, totalCrimeData, totalRates } from '../../../constants/mapData';
import MapComponent from '../../components/MapComponent';
import { useTheme } from '../../context/ThemeContext';

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

const SIDEBAR_WIDTH = 320;

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
  const { theme } = useTheme();
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationName | null>(null);
  const [crimeStats, setCrimeStats] = useState<CrimeStat[]>([]);
  const [showCrimeTypeDropdown, setShowCrimeTypeDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [filteredMapData, setFilteredMapData] = useState(totalCrimeData);

  const handleCrimeTypeDropdown = () => {
    setShowCrimeTypeDropdown(!showCrimeTypeDropdown);
    setShowStationDropdown(false);
  };

  const handleStationDropdown = () => {
    setShowStationDropdown(!showStationDropdown);
    setShowCrimeTypeDropdown(false);
  };

  const handleReset = () => {
    setSelectedCrimeType('');
    setSelectedStation(null);
  };

  useEffect(() => {
    const filterMapData = () => {
      let dataToUse = totalCrimeData;
      if (selectedCrimeType) {
        dataToUse = createCrimeTypeData(selectedCrimeType);
      }
      
      let filtered = dataToUse.features;
      if (selectedStation) {
        filtered = filtered.filter(feature => 
          feature.properties?.station === selectedStation
        );
      }
      
      setFilteredMapData({
        type: 'FeatureCollection',
        features: filtered
      });
    };
    filterMapData();
  }, [selectedCrimeType, selectedStation]);

  useEffect(() => {
    const calculateCrimeStats = () => {
      let filteredFeatures = totalCrimeData.features;
      let highestCrime = { count: 0, location: '', type: '' };

      if (selectedStation) {
        const stationRates = totalRates[selectedStation];
        const stationCrimeData = totalCrime[selectedStation];
        const stationFeature = filteredFeatures.find(feature => 
          feature.properties?.station === selectedStation
        );
        
        if (stationFeature?.properties) {
          highestCrime = {
            count: stationFeature.properties.count,
            location: selectedStation.split(' - ')[1],
            type: 'Total Crime'
          };
        }

        setCrimeStats([
          { title: 'Index Total Rate', value: `${stationRates.indexRate}%` },
          { title: 'Non-index Total Rate', value: `${stationRates.nonIndexRate}%` },
          { title: 'Total Crime Count', location: highestCrime.location || 'N/A', type: highestCrime.type || 'N/A', value: stationCrimeData.totalCrime.toString() },
        ]);
        return;
      }

      const stations = Object.keys(totalRates) as StationName[];
      const avgIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].indexRate, 0) / stations.length).toFixed(2);
      const avgNonIndexRate = (stations.reduce((sum, station) => sum + totalRates[station].nonIndexRate, 0) / stations.length).toFixed(2);

      filteredFeatures.forEach(feature => {
        const { station, count } = feature.properties as { station: string; count: number };
        if (count > highestCrime.count) {
          highestCrime = { count, location: station.split(' - ')[1], type: 'Total Crime' };
        }
      });

      setCrimeStats([
        { title: 'Index Total Rate', value: `${avgIndexRate}%` },
        { title: 'Non-index Total Rate', value: `${avgNonIndexRate}%` },
        { title: 'Highest Crime', location: highestCrime.location, type: highestCrime.type, value: highestCrime.count.toString() },
      ]);
    };
    calculateCrimeStats();
  }, [selectedStation]);

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <ScrollView contentContainerStyle={styles.sidebarContent}>
          <View style={styles.logoSticky}>
            <Image
              source={{ uri: 'https://c.animaapp.com/mbqzsrccadZLwW/img/chatgpt-image-apr-25--2025--11-37-20-pm-2.png' }}
              style={styles.logo}
            />
            <View>
              <Text style={styles.logoTitle}>ALERTO MNL</Text>
              <Text style={styles.logoSub}>Response System</Text>
            </View>
          </View>

          <View style={[styles.filtersContainer, { zIndex: showCrimeTypeDropdown || showStationDropdown ? 1 : 0 }]}>
            <View style={[styles.card, { zIndex: showCrimeTypeDropdown ? 2 : 1 }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="alert-circle-outline" size={20} color="#e02323" />
                <Text style={styles.cardTitle}>Crime Type</Text>
              </View>
              <View style={[styles.dropdownContainer, { zIndex: showCrimeTypeDropdown ? 3 : 1 }]}>
                <TouchableOpacity style={styles.selectBtn} activeOpacity={0.7} onPress={handleCrimeTypeDropdown}>
                  <Text style={styles.selectTxt} numberOfLines={1}>
                    {selectedCrimeType ? crimeTypes.find(ct => ct.value === selectedCrimeType)?.label : 'Select...'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={theme.subtitle} />
                </TouchableOpacity>
                {showCrimeTypeDropdown && (
                  <View style={[styles.dropdown, { zIndex: 1000 }]}>
                    <ScrollView>
                      {crimeTypes.map((type) => (
                        <TouchableOpacity key={type.id} style={[styles.dropdownOption, selectedCrimeType === type.value && styles.dropdownOptionActive]} onPress={() => { setSelectedCrimeType(type.value); setShowCrimeTypeDropdown(false); }}>
                          <Text style={[styles.dropdownOptionText, selectedCrimeType === type.value && styles.dropdownOptionTextActive]}>{type.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.card, { zIndex: showStationDropdown ? 2 : 1 }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="location-outline" size={20} color="#e02323" />
                <Text style={styles.cardTitle}>Station</Text>
              </View>
              <View style={[styles.dropdownContainer, { zIndex: showStationDropdown ? 3 : 1 }]}>
                <TouchableOpacity style={styles.selectBtn} activeOpacity={0.7} onPress={handleStationDropdown}>
                  <Text style={styles.selectTxt} numberOfLines={1}>
                    {selectedStation ? policeStations.find(ps => ps.value === selectedStation)?.label.replace(/MPD Station \d+ - /, '') : 'Select...'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={theme.subtitle} />
                </TouchableOpacity>
                {showStationDropdown && (
                  <View style={[styles.dropdown, { zIndex: 1000 }]}>
                    <ScrollView>
                      {policeStations.map((station) => (
                        <TouchableOpacity key={station.id} style={[styles.dropdownOption, selectedStation === station.value && styles.dropdownOptionActive]} onPress={() => { setSelectedStation(station.value as StationName); setShowStationDropdown(false); }}>
                          <Text style={[styles.dropdownOptionText, selectedStation === station.value && styles.dropdownOptionTextActive]}>{station.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={18} color="#e02323" />
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>

          <View style={styles.legendCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="map-outline" size={20} color="#e02323" />
              <Text style={styles.cardTitle}>Map Legend</Text>
            </View>
            <View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#65ee15' }]} />
                <Text style={styles.legendLabel}>Low (0-100)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#fc4e2a' }]} />
                <Text style={styles.legendLabel}>Medium (101-799)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#e31a1c' }]} />
                <Text style={styles.legendLabel}>High (800+)</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manila Crime Hotspots</Text>
        </View>
        <View style={styles.mapContainer}>
          <MapComponent data={filteredMapData} userType="guest" />
        </View>
        <View style={styles.statsContainer}>
          {crimeStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statTitle}>{stat.title}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.location && <Text style={styles.statLocation}>{stat.location}</Text>}
              {stat.type && <Text style={styles.statType}>{stat.type}</Text>}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: theme.background },
  sidebar: { width: SIDEBAR_WIDTH, backgroundColor: theme.cardBackground, paddingHorizontal: 20, paddingVertical: 24, borderRightWidth: 1, borderRightColor: theme.border },
  sidebarContent: { paddingBottom: 20, flexGrow: 1 },
  logoSticky: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.border },
  logo: { width: 40, height: 40, marginRight: 12 },
  logoTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#e02323' },
  logoSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: theme.subtitle },
  mainContent: { flex: 1, padding: 24, flexDirection: 'column', gap: 20 },
  header: {},
  headerTitle: { fontSize: 28, fontFamily: 'Poppins-Bold', color: '#e02323' },
  mapContainer: { flex: 1, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  statCard: { flex: 1, backgroundColor: theme.cardBackground, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#999', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statTitle: { fontSize: 14, fontFamily: 'Poppins-Medium', color: theme.subtitle, textAlign: 'center' },
  statValue: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#e02323', marginTop: 4 },
  statLocation: { fontSize: 12, fontFamily: 'Poppins-Regular', color: theme.text },
  statType: { fontSize: 10, fontFamily: 'Poppins-Light', color: theme.subtitle, textTransform: 'uppercase' },
  filtersContainer: { flexDirection: 'column', gap: 12, marginBottom: 16 },
  card: { flex: 1, backgroundColor: theme.cardBackground, borderRadius: 16, padding: 12, shadowColor: '#999', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontFamily: 'Poppins-Medium', color: theme.text, marginLeft: 8 },
  dropdownContainer: { position: 'relative' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: theme.background, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
  selectTxt: { fontSize: 14, fontFamily: 'Poppins-Regular', color: theme.text, flex: 1, marginRight: 4 },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: theme.cardBackground, borderRadius: 10, borderWidth: 1, borderColor: theme.border, marginTop: 6, maxHeight: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5, zIndex: 1000 },
  dropdownOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  dropdownOptionActive: { backgroundColor: '#fff5f5' },
  dropdownOptionText: { fontSize: 14, color: theme.text, fontFamily: 'Poppins-Regular' },
  dropdownOptionTextActive: { color: '#d00000', fontFamily: 'Poppins-Medium' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: '#fff0f0', borderRadius: 12, marginBottom: 16 },
  resetButtonText: { color: '#e02323', fontFamily: 'Poppins-Medium', fontSize: 14, marginLeft: 8 },
  legendCard: { backgroundColor: theme.cardBackground, borderRadius: 16, padding: 16, shadowColor: '#999', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  legendColor: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  legendLabel: { fontSize: 14, fontFamily: 'Poppins-Regular', color: theme.text },
});

export default GuestCrimeMap;
