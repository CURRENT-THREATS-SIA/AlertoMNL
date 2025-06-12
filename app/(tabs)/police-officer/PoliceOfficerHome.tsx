import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
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
  const statsCardWidth = (width - 40 - 16) / 3;

  // Your existing dropdown state
  const [selectedCrimeType, setSelectedCrimeType] = React.useState('');
  const [selectedStation, setSelectedStation] = React.useState('');

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
                        <Text style={[styles.statLocation, styles.defaultFont, isSmallDevice && { fontSize: 11 }]}>
                          {stat.location}
                        </Text>
                        <Text style={[styles.statType, styles.defaultFont, isSmallDevice && { fontSize: 10 }]}>
                          {stat.type}
                        </Text>
                      </>
                    ) : null}
                    
                    <Text style={[styles.statValue, styles.defaultFont, isSmallDevice && { fontSize: 16 }]}>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  mapSection: {
    width: '100%',
    borderRadius: 25,
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
    width: '100%',
    backgroundColor: '#E02323',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.poppins.bold,
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
  dropdownIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -14,
    zIndex: 1,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    color: 'transparent',
    backgroundColor: 'transparent',
    opacity: 0,
    width: '100%',
    height: '100%',
  },
  pickerItem: {
    color: '#212121',
    backgroundColor: '#fff',
  },
});