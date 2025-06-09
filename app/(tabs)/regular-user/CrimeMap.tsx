import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import WebView from 'react-native-webview';
import CustomTabBar from '../../../app/components/CustomTabBar';
import { fonts } from '../../config/fonts';

// Placeholder icons
const SearchIcon = () => <MaterialIcons name="search" size={24} color="#A4A4A4" />;

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

// Manila coordinates
const MANILA_CENTER = {
  lng: 120.9842,
  lat: 14.5995,
  zoom: 12
};

const mapboxHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Crime Map</title>
<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
<link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css" type="text/css">
<style>
body { margin: 0; padding: 0; }
#map { position: absolute; top: 0; bottom: 0; width: 100%; }
.mapboxgl-ctrl-top-left {
  top: 10px !important;
  left: 10px !important;
  right: 10px !important;
  width: calc(100% - 20px) !important;
}
.mapboxgl-ctrl-geocoder {
  width: 100% !important;
  max-width: none !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
  background-color: white !important;
  border-radius: 8px !important;
}
.mapboxgl-ctrl-geocoder--input {
  height: 40px !important;
  padding: 6px 35px !important;
  font-size: 16px !important;
}
.mapboxgl-ctrl-geocoder--icon {
  top: 8px !important;
}
.mapboxgl-ctrl-geocoder--button {
  top: 8px !important;
}
.mapboxgl-ctrl-group {
  margin-top: 60px !important;
}
.current-location-dot {
  width: 24px;
  height: 24px;
  background-color: #4285F4;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
  cursor: pointer;
}
.current-location-accuracy {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(66, 133, 244, 0.15);
  animation: pulse 2s ease-out infinite;
}
.location-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: none;
  z-index: 1000;
}
.location-error {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff4444;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: none;
  z-index: 1000;
  max-width: 80%;
  text-align: center;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
}
</style>
</head>
<body>
<div id="map"></div>
<div class="location-loading">Getting your location...</div>
<div class="location-error">Could not get your location</div>
<script>
mapboxgl.accessToken = 'pk.eyJ1IjoiZWl2cnlsbGUiLCJhIjoiY21iZW1za2V5MmlmODJqcHRwdW9reDZuYyJ9.0qvHb-7JmG3oTyWMV7BrSg';

let retryCount = 0;
const MAX_RETRIES = 3;

// Debug function
function debugLog(message, data) {
  const timestamp = new Date().toISOString();
  console.log(\`[\${timestamp}] \${message}\`, data);
}

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [120.9842, 14.5995],
  zoom: 12
});

// Add loading and error elements
const loadingElement = document.querySelector('.location-loading');
const errorElement = document.querySelector('.location-error');

let userLocation = null;
let locationUpdateTimeout = null;

// Function to get location with retries
function getCurrentLocation(options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      enableHighAccuracy: retryCount === 0, // Only use high accuracy on first try
      timeout: 20000, // 20 seconds timeout
      maximumAge: retryCount * 5000 // Allow older locations on retries
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    debugLog('Getting location with options:', finalOptions);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        debugLog('Location success:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        });
        resolve(position);
      },
      (error) => {
        debugLog('Location error:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          debugLog(\`Retrying (\${retryCount}/\${MAX_RETRIES})...\`);
          // Retry with lower accuracy requirements
          getCurrentLocation({
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 30000
          }).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      },
      finalOptions
    );
  });
}

// Create the geolocate control
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 0
  },
  trackUserLocation: true,
  showUserHeading: true,
  showAccuracyCircle: true
});

// Function to handle location errors
function handleLocationError(error) {
  debugLog("Location error", error);
  loadingElement.style.display = 'none';
  
  let errorMessage = 'Could not get your location. ';
  
  switch(error.code) {
    case 1:
      errorMessage += 'Please check your location permissions.';
      break;
    case 2:
      errorMessage += 'Please check your GPS is enabled.';
      break;
    case 3:
      errorMessage += 'Taking too long to get location. Retrying...';
      // Automatically retry on timeout
      setTimeout(() => {
        retryCount = 0; // Reset retry count
        initializeLocation();
      }, 2000);
      break;
    default:
      errorMessage += error.message || 'Unknown error occurred.';
  }
  
  errorElement.textContent = errorMessage;
  errorElement.style.display = 'block';
  
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

// Function to initialize location
function initializeLocation() {
  loadingElement.style.display = 'block';
  getCurrentLocation()
    .then(position => {
      debugLog('Initial location acquired:', position.coords);
      geolocate.trigger();
    })
    .catch(handleLocationError);
}

// Add search control
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  countries: 'ph',
  bbox: [120.9042, 14.5195, 121.0642, 14.6795],
  placeholder: 'Search locations in Metro Manila...',
  proximity: {
    longitude: 120.9842,
    latitude: 14.5995
  }
});

// Listen for the map load event
map.on('load', () => {
  debugLog("Map loaded");
  
  // Add controls
  map.addControl(geocoder, 'top-left');
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(geolocate, 'top-right');
  
  // Initialize location
  initializeLocation();
});

// Track geolocate control events
geolocate.on('geolocate', (position) => {
  debugLog("Geolocate success", {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy
  });
  
  userLocation = position.coords;
  retryCount = 0; // Reset retry count on success
  
  // Hide messages
  loadingElement.style.display = 'none';
  errorElement.style.display = 'none';
  
  // Center map
  map.flyTo({
    center: [position.coords.longitude, position.coords.latitude],
    zoom: 15,
    essential: true
  });
  
  // Clear existing timeout
  if (locationUpdateTimeout) {
    clearTimeout(locationUpdateTimeout);
  }
  
  // Schedule next update
  locationUpdateTimeout = setTimeout(() => {
    initializeLocation();
  }, 10000);
});

geolocate.on('error', (error) => {
  debugLog("Geolocate error", error);
  handleLocationError(error);
});

// Track location tracking status
geolocate.on('trackuserlocationstart', () => {
  debugLog("Location tracking started");
  loadingElement.style.display = 'block';
});

geolocate.on('trackuserlocationend', () => {
  debugLog("Location tracking ended");
  loadingElement.style.display = 'none';
  
  if (locationUpdateTimeout) {
    clearTimeout(locationUpdateTimeout);
  }
});

// Handle search results
geocoder.on('result', (event) => {
  const { result } = event;
  map.flyTo({
    center: result.center,
    zoom: 15,
    essential: true
  });
});
</script>
</body>
</html>`;

const NativeMapComponent = () => {
  const webViewRef = useRef(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Native message:', data);
    } catch (error) {
      console.error('Native message error:', error);
    }
  };

  return (
    <WebView
      ref={webViewRef}
      source={{ html: mapboxHTML }}
      style={styles.mapBg}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      geolocationEnabled={true}
      allowsBackgroundLocationUpdates={true}
      mediaPlaybackRequiresUserAction={false}
      onMessage={handleMessage}
    />
  );
};

const WebMapComponent = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '25px',
        overflow: 'hidden',
      }}
    >
      <iframe
        srcDoc={mapboxHTML}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="geolocation"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
};

const MapComponent = Platform.select({
  web: WebMapComponent,
  default: NativeMapComponent,
});

const CrimeMap: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const containerPadding = isSmallDevice ? 12 : 24;
  const mapHeight = Math.min(height * 0.35, 400);
  const statsCardWidth = (width - 40 - 16) / 3; // 40 for container padding, 16 for gaps

  // Dropdown state
  const [selectedCrimeType, setSelectedCrimeType] = React.useState('');
  const [selectedStation, setSelectedStation] = React.useState('');

  // State for dropdowns
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
      <CustomTabBar activeScreen="CrimeMap" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootBg: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    justifyContent: 'space-between',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 48,
    elevation: 3,
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

export default CrimeMap;