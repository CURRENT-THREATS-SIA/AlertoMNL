import React from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Header from '../../../components/Header';
import NavBottomBar from '../../../components/NavBottomBar';
import { fonts } from '../../config/fonts';

// Only import WebView for native platforms
const WebView = Platform.select({
  native: () => require('react-native-webview').WebView,
  default: () => null,
})();

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
}
.recenter-button {
  position: absolute;
  right: 10px;
  bottom: 100px;
  background-color: white;
  border: none;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  z-index: 1000;
}
.recenter-button:hover {
  background-color: #f5f5f5;
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
<button class="recenter-button" title="Recenter to my location">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
  </svg>
</button>
<script>
mapboxgl.accessToken = 'pk.eyJ1IjoiZWl2cnlsbGUiLCJhIjoiY21iZW1za2V5MmlmODJqcHRwdW9reDZuYyJ9.0qvHb-7JmG3oTyWMV7BrSg';

// Debug function
function debugLog(message, data) {
  console.log('[Debug]', message, data);
}

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [120.9842, 14.5995],
  zoom: 12,
  maxBounds: [
    [120.9042, 14.5195],
    [121.0642, 14.6795]
  ]
});

// Add loading and error elements
const loadingElement = document.querySelector('.location-loading');
const errorElement = document.querySelector('.location-error');
const recenterButton = document.querySelector('.recenter-button');

// Create the geolocate control
const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
    timeout: 10000,  // 10 second timeout
    maximumAge: 0    // Force fresh location
  },
  trackUserLocation: true,
  showUserHeading: true,
  showAccuracyCircle: true
});

// Add search control first (it will be at the top)
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

// Add the geocoder to the map
map.addControl(geocoder, 'top-left');

// Add other controls after the search
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(geolocate, 'top-right');

// Debug: Check if geolocation is available
if ("geolocation" in navigator) {
  debugLog("Geolocation is available");
  
  // Test direct geolocation API
  navigator.geolocation.getCurrentPosition(
    (position) => {
      debugLog("Direct geolocation success", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    },
    (error) => {
      debugLog("Direct geolocation error", {
        code: error.code,
        message: error.message
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
} else {
  debugLog("Geolocation is NOT available");
}

// Listen for the map load event
map.on('load', () => {
  debugLog("Map loaded");
  // Wait a bit before triggering geolocation
  setTimeout(() => {
    debugLog("Triggering geolocation");
    geolocate.trigger();
  }, 1000);
});

// Track geolocate control events
geolocate.on('geolocate', (position) => {
  debugLog("Geolocate success", {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy
  });
  
  const { coords } = position;
  const accuracy = coords.accuracy;
  
  // Hide loading and error messages
  loadingElement.style.display = 'none';
  errorElement.style.display = 'none';
  
  // Center map on user location
  map.flyTo({
    center: [position.coords.longitude, position.coords.latitude],
    zoom: 15
  });
});

geolocate.on('error', (error) => {
  debugLog("Geolocate error", {
    code: error.code,
    message: error.message
  });
  
  loadingElement.style.display = 'none';
  
  let errorMessage = 'Could not get your location';
  
  if (error.code === 1) {
    errorMessage = 'Location permission denied. Please enable location access.';
  } else if (error.code === 2) {
    errorMessage = 'Location unavailable. Please check your device settings.';
  } else if (error.code === 3) {
    errorMessage = 'Location request timed out. Please try again.';
  }
  
  errorElement.textContent = errorMessage;
  errorElement.style.display = 'block';
  
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
});

// Track when geolocation tracking starts
geolocate.on('trackuserlocationstart', () => {
  debugLog("Location tracking started");
  loadingElement.style.display = 'block';
});

// Track when geolocation tracking ends
geolocate.on('trackuserlocationend', () => {
  debugLog("Location tracking ended");
  loadingElement.style.display = 'none';
});

// Handle recenter button click
recenterButton.addEventListener('click', () => {
  debugLog("Recenter button clicked");
  geolocate.trigger();
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
  const webViewRef = React.useRef(null);

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
        src={`data:text/html;charset=utf-8,${encodeURIComponent(mapboxHTML)}`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="geolocation"
      />
    </div>
  );
};

const MapComponent = Platform.select({
  web: WebMapComponent,
  default: NativeMapComponent,
});

const PoliceOfficerHome: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const containerPadding = isSmallDevice ? 12 : 24;
  const mapHeight = Math.min(height * 0.35, 400);
  const statsCardWidth = (width - 40 - 16) / 3;

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
            {MapComponent && <MapComponent />}
          </View>

          {/* Selectors and stats */}
          <TouchableOpacity 
            style={[styles.selectorBtn, { marginBottom: 8 }]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.selectorBtnText, 
              styles.defaultFont,
              isSmallDevice && { fontSize: 14 }
            ]}>
              Select Crime Type
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectorBtn, { marginBottom: 16 }]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.selectorBtnText, 
              styles.defaultFont,
              isSmallDevice && { fontSize: 14 }
            ]}>
              Select Station
            </Text>
          </TouchableOpacity>

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

const styles = StyleSheet.create({
  rootBg: {
    flex: 1,
    backgroundColor: '#f4f4f4',
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
});

export default PoliceOfficerHome;
  