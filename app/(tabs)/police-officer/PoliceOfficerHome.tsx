import React, { useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import MapComponent from '../../../components/MapComponent';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';

// Placeholder icons
const SearchIcon = () => <View style={styles.iconPlaceholder} />;

// Example remote images (replace with local require if you have assets)
const mapBgUri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/frame-3997.png';
const locationUri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/location.png';
const location1Uri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/location-1.png';
const location2Uri = 'https://c.animaapp.com/mb7vub0tMSk30H/img/location-2.png';

// Crime types and stations data
const crimeTypes = [
  { id: 1, label: 'Theft', value: 'theft' },
  { id: 2, label: 'Robbery', value: 'robbery' },
  { id: 3, label: 'Assault', value: 'assault' },
  { id: 4, label: 'Homicide', value: 'homicide' },
  { id: 5, label: 'Drug-related', value: 'drug' },
  { id: 6, label: 'Others', value: 'others' },
];

const policeStations = [
  { id: 1, label: 'MPD Station 1 - Raxabago', value: 'station1' },
  { id: 2, label: 'MPD Station 2 - Moriones', value: 'station2' },
  { id: 3, label: 'MPD Station 3 - Sta Cruz', value: 'station3' },
  { id: 4, label: 'MPD Station 4 - Sampaloc', value: 'station4' },
  { id: 5, label: 'MPD Station 5 - Ermita', value: 'station5' },
  { id: 6, label: 'MPD Station 6 - Sta Ana', value: 'station6' },
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

const CrimeMap: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const containerPadding = isSmallDevice ? 12 : 1;
  const mapHeight = Math.min(height * 0.35, 400);

  // Calculate stats card width based on screen width
  const statsCardWidth = (width - 40 - 16) / 3; // 40 for container padding, 16 for gaps

  // State for dropdowns
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [showCrimeTypeModal, setShowCrimeTypeModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);

  // Function to handle selection
  const handleCrimeTypeSelect = (value: string) => {
    setSelectedCrimeType(value);
    setShowCrimeTypeModal(false);
  };

  const handleStationSelect = (value: string) => {
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
        <View style={styles.contentWrapper}>
          <View style={[styles.mapSection, { height: mapHeight }]}>
            {MapComponent && <MapComponent />}
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
                      onPress={() => handleStationSelect(station.value)}
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
      </ScrollView>

      <NavBottomBar activeScreen="Home" />
    </SafeAreaView>
  );
};

export default CrimeMap;

const styles = StyleSheet.create({
  rootBg: {
    flex: 1,
    backgroundColor: '#fff',
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
  mapBg: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
  mapOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#00000',
    shadowOpacity: 0.15,
    shadowRadius: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
    fontFamily: fonts.poppins.regular,
  },
  mapControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationIcon: { width: 58, height: 56 },
  locationSmallIcon: { width: 22, height: 22 },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    width: 100,
    height: 100,
    justifyContent: 'center',
  },
  legendItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: '#000',
    fontFamily: fonts.poppins.regular,
  },
  location2Icon: { width: 81, height: 81 },
  selectorsStatsSection: {
    width: '100%',
    marginBottom: 16,
  },
  selectorBtn: {
    backgroundColor: '#212121',
    borderRadius: 8,
    padding: 12,
  },
  selectorBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.poppins.regular,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8, // Add gap between cards
  },
  statCard: {
    backgroundColor: '#FFD8D8',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    width: '31%', // Approximately (100% - 2 gaps) / 3
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
    color: '#000',
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
});
