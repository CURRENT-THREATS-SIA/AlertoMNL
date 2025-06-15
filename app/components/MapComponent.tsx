import { FeatureCollection, Point } from 'geojson';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

interface MapComponentProps {
  selectedCrimeType: string;
  selectedStation: string | null;
  userType: 'regular' | 'police';
  data: FeatureCollection<Point>;
}

// Manila coordinates
const MANILA_CENTER = {
  lng: 120.9842,
  lat: 14.5995,
  zoom: 12
};

const MapComponent: React.FC<MapComponentProps> = ({ selectedCrimeType, selectedStation, userType, data }) => {
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

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [${MANILA_CENTER.lng}, ${MANILA_CENTER.lat}],
  zoom: ${MANILA_CENTER.zoom}
});

// Add geocoder control
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  countries: 'ph',
  bbox: [120.9745, 14.5907, 120.9942, 14.6019], // Manila bounding box
  placeholder: 'Search in Manila...'
});

map.addControl(geocoder);
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,
  showUserHeading: true
}));

// Handle messages from React Native
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'updateFilters') {
    console.log('Filters updated:', data.crimeType, data.station);
    
    // Get the current source data
    const source = map.getSource('crimes');
    if (!source) return;

    // Filter the original data based on selections
    const filteredFeatures = originalData.features.filter(feature => {
      const matchesCrimeType = !data.crimeType || feature.properties.crimeType === data.crimeType;
      const matchesStation = !data.station || feature.properties.station === data.station;
      return matchesCrimeType && matchesStation;
    });

    // Update the source with filtered data
    source.setData({
      type: 'FeatureCollection',
      features: filteredFeatures
    });

    // Fly to the selected station if one is selected
    if (data.station) {
      const stationFeature = originalData.features.find(f => f.properties.station === data.station);
      if (stationFeature) {
        map.flyTo({
          center: stationFeature.geometry.coordinates,
          zoom: 14,
          essential: true
        });
      }
    } else {
      // If no station selected, reset to Manila view
      map.flyTo({
        center: [${MANILA_CENTER.lng}, ${MANILA_CENTER.lat}],
        zoom: ${MANILA_CENTER.zoom},
        essential: true
      });
    }
  }
});

// Store original data when map loads
let originalData;
map.on('load', () => {
  // Store the original data for filtering
  originalData = ${JSON.stringify(data)};

  // Add the source for crime data
  map.addSource('crimes', {
    type: 'geojson',
    data: originalData,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // Add a layer for the clusters
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'crimes',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#ffeda0',  // 1-10 crimes (light yellow)
        10,
        '#feb24c',  // 11-25 crimes (orange)
        25,
        '#fc4e2a',  // 26-50 crimes (red-orange)
        50,
        '#e31a1c',  // 51-100 crimes (bright red)
        100,
        '#800026'   // 100+ crimes (dark red)
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        25,    // 1-10 crimes
        10,
        35,    // 11-25 crimes
        25,
        45,    // 26-50 crimes
        50,
        55,    // 51-100 crimes
        100,
        65     // 100+ crimes
      ],
      'circle-opacity': 0.9,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-opacity': 0.8
    }
  });

  // Add a layer for cluster counts
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'crimes',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': [
        'step',
        ['get', 'point_count'],
        14,    // Size for 1-10
        10,
        16,    // Size for 11-25
        25,
        18,    // Size for 26-50
        50,
        20,    // Size for 51-100
        100,
        24     // Size for 100+
      ]
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': 'rgba(0, 0, 0, 0.3)',
      'text-halo-width': 2
    }
  });

  // Add a layer for individual points
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'crimes',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['get', 'isIndexCrime'],
        '#e31a1c',  // Bright red for index crimes
        '#feb24c'   // Orange for non-index crimes
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        1, 12,      // Min size for count of 1
        5, 16,      // Medium size for count of 5
        10, 20,     // Large size for count of 10
        20, 25      // Max size for count of 20+
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.85,
      'circle-stroke-opacity': 0.8
    }
  });

  // Add a layer for point counts with enhanced visibility
  map.addLayer({
    id: 'unclustered-point-count',
    type: 'symbol',
    source: 'crimes',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': '{count}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        1, 12,      // Size for count of 1
        5, 14,      // Size for count of 5
        10, 16,     // Size for count of 10
        20, 18      // Size for count of 20+
      ]
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': 'rgba(0, 0, 0, 0.3)',
      'text-halo-width': 2
    }
  });

  // Add click event for clusters
  map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('crimes').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
      });
    });
  });

  // Add hover effect for clusters
  map.on('mouseenter', 'clusters', () => {
    map.getCanvas().style.cursor = 'pointer';
    // Optional: You could add a slight size increase on hover
    map.setPaintProperty('clusters', 'circle-radius', [
      'step',
      ['get', 'point_count'],
      28,    // 1-10 crimes (slightly bigger on hover)
      10,
      38,    // 11-25 crimes
      25,
      48,    // 26-50 crimes
      50,
      58,    // 51-100 crimes
      100,
      68     // 100+ crimes
    ]);
  });

  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
    // Reset to original size
    map.setPaintProperty('clusters', 'circle-radius', [
      'step',
      ['get', 'point_count'],
      25,    // 1-10 crimes
      10,
      35,    // 11-25 crimes
      25,
      45,    // 26-50 crimes
      50,
      55,    // 51-100 crimes
      100,
      65     // 100+ crimes
    ]);
  });
});
</script>
</body>
</html>
`;

  const sendFiltersToMap = () => {
    const message = {
      type: 'updateFilters',
      crimeType: selectedCrimeType,
      station: selectedStation
    };
    if (Platform.OS === 'web') {
      // For web platform
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify(message), '*');
      }
    } else {
      // For mobile platforms
      webViewRef.current?.injectJavaScript(`
        window.dispatchEvent(new MessageEvent('message', {
          data: '${JSON.stringify(message)}'
        }));
        true;
      `);
    }
  };

  React.useEffect(() => {
    sendFiltersToMap();
  }, [selectedCrimeType, selectedStation]);

  const webViewRef = React.useRef<WebView>(null);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={mapboxHTML}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapboxHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          console.log('Message from WebView:', data);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
});

export default MapComponent; 