import { FeatureCollection, Point } from 'geojson';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

interface MapComponentProps {
  selectedCrimeType: string;
  selectedStation: string | null;
  userType: 'regular' | 'police';
  data: FeatureCollection<Point>;
  routeCoords?: { lat: number; lng: number }[] | null;
  officerLocation?: { lat: number; lng: number } | null;
}

// Manila coordinates
const MANILA_CENTER = {
  lng: 120.9842,
  lat: 14.5995,
  zoom: 12
};

const MapComponent: React.FC<MapComponentProps> = ({ selectedCrimeType, selectedStation, userType, data, routeCoords, officerLocation }) => {
  // Combine polyline and officer marker scripts into one map.on('load', ...) block
  const mapboxLoadScript = `
    map.on('load', function() {
      ${routeCoords && routeCoords.length > 1 ? `
      map.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [
              ${routeCoords.map(coord => `[${coord.lng}, ${coord.lat}]`).join(',\n              ')}
            ]
          }
        }
      });
      map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#E02323',
          'line-width': 6
        }
      });
      map.fitBounds([
        [${routeCoords[0].lng}, ${routeCoords[0].lat}],
        [${routeCoords[routeCoords.length-1].lng}, ${routeCoords[routeCoords.length-1].lat}]
      ], { padding: 60 });
      ` : ''}
      ${officerLocation ? `
      new mapboxgl.Marker({ color: '#007AFF' })
        .setLngLat([${officerLocation.lng}, ${officerLocation.lat}])
        .setPopup(new mapboxgl.Popup().setText('Officer Location'))
        .addTo(map);
      ` : ''}
    });
  `;

  const mapboxHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Crime Map</title>
<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
<link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet">
<script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
<style>
body { margin: 0; padding: 0; }
#map { position: absolute; top: 0; bottom: 0; width: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
mapboxgl.accessToken = 'pk.eyJ1IjoiZWl2cnlsbGUiLCJhIjoiY21iZW1za2V5MmlmODJqcHRwdW9reDZuYyJ9.0qvHb-7JmG3oTyWMV7BrSg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [120.9842, 14.5995],
  zoom: 12
});
${mapboxLoadScript}
</script>
</body>
</html>
`;

  const webViewRef = React.useRef<WebView>(null);

  // Render the map using WebView (React Native) or iframe (web)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={mapboxHTML}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Crime Map"
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