import * as Location from 'expo-location';
import { FeatureCollection, Point } from 'geojson';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import { dbscan, DBSCANCluster } from '../../utils/dbscan';

interface MapComponentProps {
  selectedCrimeType?: string;
  selectedStation?: string | null;
  userType: string;
  data?: FeatureCollection<Point>; // For clusters
  routeCoords?: { lat: number; lng: number }[]; // For Dijkstra
  officerLocation?: { lat: number; lng: number };
  incidentLocation?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
  hideControls?: boolean; // New prop to hide UI controls
  hideIncidentMarker?: boolean; // New prop to hide incident marker
  incidentPhotoUrl?: string; // New prop for incident profile picture
}

// Manila coordinates
const MANILA_CENTER = {
  lng: 120.9842,
  lat: 14.5995,
  zoom: 12
};

const MapComponent: React.FC<MapComponentProps> = ({ selectedCrimeType, selectedStation, userType, data, routeCoords, officerLocation, incidentLocation, userLocation, hideControls = false, hideIncidentMarker = false, incidentPhotoUrl }) => {
  const [deviceLocation, setDeviceLocation] = useState<Location.LocationObject | null>(null);
  const webViewRef = useRef<WebView>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef(AppState.currentState);
  
  // Debug logging
  console.log('MapComponent props:', { hideControls, officerLocation: !!officerLocation, userLocation: !!userLocation });
  const [isPatrolMode, setIsPatrolMode] = useState(false);
  const [patrolPath, setPatrolPath] = useState<Location.LocationObject[]>([]);
  const [patrolStartTime, setPatrolStartTime] = useState<number | null>(null);
  const lastIncidentCoordRef = React.useRef<string | null>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Determine mode
  const isRouteMode = routeCoords && routeCoords.length > 1;
  const isClusterMode = !isRouteMode && data && data.features && data.features.length > 0;

  // For clusters
  const [clusters, setClusters] = useState<DBSCANCluster[]>([]);

  const startLocationTracking = async () => {
    // Don't skip location tracking - we need it for the crosshair
    
    try {
      // Request both foreground and background permissions for better tracking
      const foregroundPermission = await Location.requestForegroundPermissionsAsync();
      if (foregroundPermission.status !== 'granted') {
        console.error('Foreground location permission denied');
        return;
      }

      if (Platform.OS !== 'web') {
        const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
        if (backgroundPermission.status === 'granted') {
          console.log('Background location permission granted');
        }
      }

      // Configure high accuracy location tracking
      await Location.enableNetworkProviderAsync();
      
      // Start watching position with high accuracy settings
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // or if moved 1 meter
          mayShowUserSettingsDialog: true // Prompt user to enable high accuracy if needed
        },
        (location) => {
          // Debounce: Only update if moved >10 meters
          const newLoc = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };
          const lastLoc = lastLocationRef.current;
          const moved = !lastLoc || getDistanceFromLatLonInMeters(
            lastLoc.lat, lastLoc.lng, newLoc.lat, newLoc.lng
          ) > 10;
          if (moved) {
            lastLocationRef.current = newLoc;
            setDeviceLocation(location);
            // Inject location into the map with additional data
            const locationUpdate = {
              type: 'updateDeviceLocation',
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                heading: location.coords.heading,
                speed: location.coords.speed,
                altitude: location.coords.altitude,
                timestamp: location.timestamp
              }
            };
            webViewRef.current?.injectJavaScript(`
              window.dispatchEvent(new MessageEvent('message', {
                data: '${JSON.stringify(locationUpdate)}'
              }));
              true;
            `);
          }
          // else: skip update to avoid unnecessary computation/renders
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
    }
  };

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, []);

  useEffect(() => {
    startLocationTracking();
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      stopLocationTracking();
    };
  }, [handleAppStateChange]);

  // Start location tracking when component mounts
  useEffect(() => {
    startLocationTracking();
    return () => {
      stopLocationTracking();
    };
  }, []);

  // Add patrol mode tracking
  const togglePatrolMode = () => {
    if (!isPatrolMode) {
      // Starting patrol mode
      setIsPatrolMode(true);
      setPatrolStartTime(Date.now());
      setPatrolPath([]);
      if (deviceLocation) {
        setPatrolPath([deviceLocation]);
      }
    } else {
      // Ending patrol mode
      setIsPatrolMode(false);
      setPatrolStartTime(null);
      // Here you could send the patrol data to your backend
      if (patrolPath.length > 0) {
        console.log('Patrol completed:', {
          duration: Date.now() - (patrolStartTime || 0),
          distance: calculatePatrolDistance(patrolPath),
          points: patrolPath.length
        });
      }
    }
  };

  // Calculate total patrol distance
  const calculatePatrolDistance = (path: Location.LocationObject[]) => {
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      totalDistance += getDistanceFromLatLonInMeters(
        prev.coords.latitude,
        prev.coords.longitude,
        curr.coords.latitude,
        curr.coords.longitude
      );
    }
    return totalDistance;
  };

  // Haversine formula for distance calculation
  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Update patrol path when location changes
  useEffect(() => {
    if (isPatrolMode && deviceLocation) {
      setPatrolPath(prev => [...prev, deviceLocation]);
    }
  }, [deviceLocation, isPatrolMode]);

  // Add effect to handle incident location marker with destination indicator
  useEffect(() => {
    if (!webViewRef.current || !incidentLocation || hideIncidentMarker || hideControls) return;

    const incidentCoord = [incidentLocation.lng, incidentLocation.lat];
    const isEndPoint = isRouteMode; // Show as end point when in route mode
    // Use the proxy PHP script for the image URL
    function getProxyPhotoUrl(photo_url) {
      const safeUrl = typeof photo_url === 'string' ? photo_url : '';
      const filename = safeUrl.split('/').pop();
      return `http://mnl911.atwebpages.com/get_profile_photo.php?file=${filename}`;
    }
    const photoUrl = incidentPhotoUrl ? getProxyPhotoUrl(incidentPhotoUrl) : '';
    // Only inject the image block if photoUrl is truthy
    const imageBlock = photoUrl ? `
      const img = document.createElement('img');
      img.src = '${photoUrl}';
      img.style.width = '40px';
      img.style.height = '40px';
      img.style.borderRadius = '20px';
      img.style.border = '2px solid #fff';
      img.style.marginBottom = '-10px';
      img.style.zIndex = '20';
      container.appendChild(img);
    ` : '';

    const markerScript = `
      (function() {
        if (window.incidentMarker) {
          window.incidentMarker.remove();
        }
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        ${imageBlock}
        const el = document.createElement('div');
        el.className = 'incident-marker';
        ${isEndPoint ? `
        const label = document.createElement('div');
        label.innerText = 'DESTINATION';
        label.style.position = 'absolute';
        label.style.bottom = '35px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.background = '#E02323';
        label.style.color = 'white';
        label.style.padding = '2px 8px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.whiteSpace = 'nowrap';
        label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        label.style.zIndex = '15';
        container.appendChild(label);
        const centerDot = document.createElement('div');
        centerDot.style.position = 'absolute';
        centerDot.style.top = '50%';
        centerDot.style.left = '50%';
        centerDot.style.transform = 'translate(-50%, -50%)';
        centerDot.style.width = '10px';
        centerDot.style.height = '10px';
        centerDot.style.background = 'white';
        centerDot.style.borderRadius = '50%';
        centerDot.style.zIndex = '2';
        el.appendChild(centerDot);
        ` : ''}
        container.appendChild(el);
        window.incidentMarker = new mapboxgl.Marker(container)
          .setLngLat([${incidentCoord[0]}, ${incidentCoord[1]}])
          .addTo(map);
      })();
    `;
    webViewRef.current.injectJavaScript(markerScript);
  }, [incidentLocation, isRouteMode, hideIncidentMarker, hideControls, incidentPhotoUrl]);

  // Add effect to handle route updates
  useEffect(() => {
    if (!routeCoords || !webViewRef.current) {
      console.log('DEBUG: No routeCoords or webViewRef:', { routeCoords, hasWebView: !!webViewRef.current });
      return;
    }
    
    console.log('DEBUG: Updating route with coords:', routeCoords);
    const coordinates = routeCoords.map(coord => [coord.lng, coord.lat]);
    console.log('DEBUG: Transformed coordinates:', coordinates);
    
    // Use the proxy PHP script for the image URL
    function getProxyPhotoUrl(photo_url) {
      const safeUrl = typeof photo_url === 'string' ? photo_url : '';
      const filename = safeUrl.split('/').pop();
      return `http://mnl911.atwebpages.com/get_profile_photo.php?file=${filename}`;
    }
    const photoUrl = incidentPhotoUrl ? getProxyPhotoUrl(incidentPhotoUrl) : '';
    // Build the image block string for the destination marker (single line, no newlines)
    const imageBlock = photoUrl
      ? "const img = document.createElement('img');" +
        "img.src = '" + photoUrl + "';" +
        "img.style.width = '40px';" +
        "img.style.height = '40px';" +
        "img.style.borderRadius = '20px';" +
        "img.style.border = '2px solid #fff';" +
        "img.style.marginBottom = '-10px';" +
        "img.style.zIndex = '20';" +
        "container.appendChild(img);"
      : '';
    
    const script = `
      console.log('DEBUG: Received route update:', ${JSON.stringify(coordinates)});
      // Remove existing route if it exists
      if (map.getLayer('route-layer')) { map.removeLayer('route-layer'); }
      if (map.getSource('route-source')) { map.removeSource('route-source'); }

      // Add new route
      if (${JSON.stringify(coordinates)}.length > 1) {
        map.addSource('route-source', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: ${JSON.stringify(coordinates)} } }
        });
        map.addLayer({ id: 'route-layer', type: 'line', source: 'route-source', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#e31a1c', 'line-width': 8, 'line-opacity': 0.9 } });
        // Add route markers when hideControls is true (for MapStep)
        const shouldHideControls = ${hideControls ? 'true' : 'false'};
        const routeCoordinates = ${JSON.stringify(coordinates)};
        if (shouldHideControls && routeCoordinates.length > 1) {
          if (window.routeStartMarker) { window.routeStartMarker.remove(); window.routeStartMarker = null; }
          if (window.routeEndMarker) { window.routeEndMarker.remove(); window.routeEndMarker = null; }
          if (window.officerMarker) { window.officerMarker.remove(); window.officerMarker = null; }
          if (window.incidentMarker) { window.incidentMarker.remove(); window.incidentMarker = null; }
          if (window.userMarker) { window.userMarker.remove(); window.userMarker = null; }
          const startCoord = routeCoordinates[0];
          const endCoord = routeCoordinates[routeCoordinates.length - 1];
          const startEl = document.createElement('div');
          startEl.style.width = '30px';
          startEl.style.height = '30px';
          startEl.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="3"/><circle cx="12" cy="12" r="3" fill="#ffffff"/></svg>';
          window.routeStartMarker = new mapboxgl.Marker({ element: startEl }).setLngLat(startCoord).addTo(map);
          // --- Add profile photo above the red pin (end marker) ---
          const container = document.createElement('div');
          container.style.position = 'relative';
          container.style.display = 'flex';
          container.style.flexDirection = 'column';
          container.style.alignItems = 'center';
          ${imageBlock}
          const endEl = document.createElement('div');
          endEl.style.width = '35px';
          endEl.style.height = '42px';
          endEl.innerHTML = '<svg viewBox="0 0 24 32" width="35" height="42"><path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#E02323" stroke="#ffffff" stroke-width="2"/></svg>';
          container.appendChild(endEl);
          window.routeEndMarker = new mapboxgl.Marker({ element: container, anchor: 'bottom' }).setLngLat(endCoord).addTo(map);
        }
        const bounds = ${JSON.stringify(coordinates)}.reduce((b, coord) => b.extend(coord), new mapboxgl.LngLatBounds(${JSON.stringify(coordinates[0])}, ${JSON.stringify(coordinates[0])}));
        map.fitBounds(bounds, { padding: 100, maxZoom: 17, duration: 1000 });
      }
      true;
    `;

    webViewRef.current.injectJavaScript(script);
  }, [routeCoords, hideControls, incidentPhotoUrl]);

  useEffect(() => {
    if (isClusterMode && data) {
      // Use default eps/minPoints or adjust as needed
      const eps = 0.5;
      const minPoints = 3;
      setClusters(dbscan(data.features, eps, minPoints));
    }
  }, [isClusterMode, data]);

  // Add effect to handle officer location marker with route start indicator
  useEffect(() => {
    if (!webViewRef.current || !officerLocation || hideControls) return;
    const officerCoord = [officerLocation.lng, officerLocation.lat];
    const isStartPoint = isRouteMode; // Show as start point when in route mode
    
    const markerScript = `
      (function() {
        if (window.officerMarker) { window.officerMarker.remove(); }
        
        // Create container for the marker
        const container = document.createElement('div');
        container.style.position = 'relative';
        
        // Create the main marker element
        const el = document.createElement('div');
        el.className = 'officer-marker';
        el.style.background = '#4285F4';
        el.style.border = '3px solid #fff';
        el.style.borderRadius = '50%';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.boxShadow = '0 0 0 4px rgba(66,133,244,0.2)';
        el.style.position = 'relative';
        el.style.zIndex = '5';
        
        ${isStartPoint ? `
        // Add "START" label for route mode
        const label = document.createElement('div');
        label.innerText = 'START';
        label.style.position = 'absolute';
        label.style.bottom = '35px';
        label.style.left = '50%';
        label.style.transform = 'translateX(-50%)';
        label.style.background = '#4285F4';
        label.style.color = 'white';
        label.style.padding = '2px 8px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.whiteSpace = 'nowrap';
        label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        container.appendChild(label);
        
        // Add pulsing animation for start point
        el.style.animation = 'startPulse 2s infinite';
        
        // Add animation styles if not already present
        if (!document.getElementById('start-marker-style')) {
          const style = document.createElement('style');
          style.id = 'start-marker-style';
          style.innerHTML = \`
            @keyframes startPulse {
              0% { box-shadow: 0 0 0 4px rgba(66,133,244,0.2); }
              50% { box-shadow: 0 0 0 8px rgba(66,133,244,0.1); }
              100% { box-shadow: 0 0 0 4px rgba(66,133,244,0.2); }
            }
          \`;
          document.head.appendChild(style);
        }
        ` : ''}
        
        container.appendChild(el);
        
        window.officerMarker = new mapboxgl.Marker(container)
          .setLngLat([${officerCoord[0]}, ${officerCoord[1]}])
          .addTo(map);
      })();
    `;
    webViewRef.current.injectJavaScript(markerScript);
  }, [officerLocation, hideControls]);

  // Add effect to handle user location marker
  useEffect(() => {
    if (!webViewRef.current || !userLocation || hideControls) return;
    const userCoord = [userLocation.lng, userLocation.lat];
    const markerScript = `
      (function() {
        if (window.userMarker) { window.userMarker.remove(); }
        const el = document.createElement('div');
        el.className = 'user-marker';
        el.style.background = '#4285F4';
        el.style.border = '3px solid #fff';
        el.style.borderRadius = '50%';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.boxShadow = '0 0 0 4px rgba(66,133,244,0.2)';
        window.userMarker = new mapboxgl.Marker(el)
          .setLngLat([${userCoord[0]}, ${userCoord[1]}])
          .addTo(map);
      })();
    `;
    webViewRef.current.injectJavaScript(markerScript);
  }, [userLocation, hideControls]);

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
  margin-top: 25px !important;
}
.device-location-dot {
  width: 24px;
  height: 24px;
  background-color: #4285F4;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
  cursor: pointer;
}
.device-location-accuracy {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(66, 133, 244, 0.15);
  animation: pulse 2s ease-out infinite;
}
.location-button {
  position: absolute;
  right: 10px;
  bottom: 100px;
  background: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  transition: background-color 0.3s;
}
.location-button:hover {
  background: #f8f8f8;
}
.location-button:active {
  background: #eee;
}
.location-button svg {
  width: 24px;
  height: 24px;
  fill: #666;
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
${hideControls ? `
/* Hide all map controls when hideControls is true */
.mapboxgl-ctrl-top-left,
.mapboxgl-ctrl-top-right,
.mapboxgl-ctrl-bottom-left,
.mapboxgl-ctrl-bottom-right {
  display: none !important;
}
.location-button {
  display: none !important;
}
` : ''}
.cluster-popup .mapboxgl-popup-content {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 0;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.cluster-popup .mapboxgl-popup-tip {
  border-top-color: rgba(0, 0, 0, 0.8);
}
.point-popup .mapboxgl-popup-content {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 0;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.point-popup .mapboxgl-popup-tip {
  border-top-color: rgba(0, 0, 0, 0.8);
}
</style>
</head>
<body>
<div id="map"></div>
${!hideControls ? `
<button class="location-button" id="centerLocationButton" title="Center on my location">
  <svg viewBox="0 0 24 24">
    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
  </svg>
</button>
` : ''}
<div class="location-loading">Getting your location...</div>
<div class="location-error">Could not get your location</div>
<script>
mapboxgl.accessToken = 'pk.eyJ1IjoiZWl2cnlsbGUiLCJhIjoiY21iZW1za2V5MmlmODJqcHRwdW9reDZuYyJ9.0qvHb-7JmG3oTyWMV7BrSg';

let currentLocation = null;
let locationUpdateTime = Date.now();
let isFirstLocation = true;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [${MANILA_CENTER.lng}, ${MANILA_CENTER.lat}],
  zoom: ${MANILA_CENTER.zoom}
});

// Add geocoder control only if controls are not hidden
const shouldHideControls = ${hideControls ? 'true' : 'false'};
let geocoder = null;

if (!shouldHideControls) {
  geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: 'ph',
    bbox: [120.9547, 14.5547, 121.0272, 14.6380], // Expanded to cover all of Manila
    placeholder: 'Search in Manila...',
    flyTo: function(location) {
      if (location && location.center) {
        const [lng, lat] = location.center;
        if (
          lng >= 120.9547 && lng <= 121.0272 &&
          lat >= 14.5547 && lat <= 14.6380
        ) {
          map.flyTo({ center: location.center, zoom: 16 });
        } else {
          showManilaReminder('Reminder: Please select a location within Manila.');
          geocoder.clear();
          // Do NOT move the map
        }
      }
    }
  });
}

// Add a custom reminder div
const reminderDiv = document.createElement('div');
reminderDiv.id = 'manila-reminder';
reminderDiv.style.position = 'absolute';
reminderDiv.style.top = '20px';
reminderDiv.style.left = '50%';
reminderDiv.style.transform = 'translateX(-50%)';
reminderDiv.style.background = '#e02323';
reminderDiv.style.color = 'white';
reminderDiv.style.padding = '12px 24px';
reminderDiv.style.borderRadius = '8px';
reminderDiv.style.fontSize = '16px';
reminderDiv.style.fontFamily = 'sans-serif';
reminderDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
reminderDiv.style.zIndex = '9999';
reminderDiv.style.display = 'none';
document.body.appendChild(reminderDiv);

function showManilaReminder(message) {
  reminderDiv.textContent = message;
  reminderDiv.style.display = 'block';
  setTimeout(() => {
    reminderDiv.style.display = 'none';
  }, 3000);
}

// Only allow results within Manila (for extra safety)
if (geocoder) {
  geocoder.on('result', function(e) {
    const place = e.result;
    const [lng, lat] = place.center;
    const inManila =
      lng >= 120.9547 && lng <= 121.0272 &&
      lat >= 14.5547 && lat <= 14.6380 &&
      place.place_name.includes('Manila');
    if (!inManila) {
      showManilaReminder('Reminder: Please select a location within Manila.');
      geocoder.clear();
      // Force map back to Manila center
      map.flyTo({ center: [120.9842, 14.5995], zoom: 12 });
    }
  });
}

// Only add controls if not hidden
if (!shouldHideControls && geocoder) {
  map.addControl(geocoder);
  map.addControl(new mapboxgl.NavigationControl());
}

// Handle location button click with smooth animation
const locationButton = document.getElementById('centerLocationButton');
if (locationButton) {
  locationButton.addEventListener('click', () => {
    if (currentLocation) {
      map.flyTo({
        center: [currentLocation.longitude, currentLocation.latitude],
        zoom: 17,
        duration: 1000,
        pitch: 60, // Add some tilt for better perspective
        bearing: currentLocation.heading || 0 // Align map with user's heading
      });
    } else {
      // Try to get location when button is clicked
      if ('geolocation' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            map.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 17,
              duration: 1000
            });
          },
          (error) => {
            // Silently handle error
            console.log('Location not available:', error.message);
          }
        );
      }
    }
  });
}

// Initialize device location source and layers
map.on('load', () => {
  // Only add device location layers if controls are not hidden
  const shouldHideControls = ${hideControls ? 'true' : 'false'};
  
  // Clean up any existing markers when controls are hidden
  if (shouldHideControls) {
    // Remove all markers except route markers
    const markerCleanup = () => {
      // Get all markers on the map
      const markers = document.querySelectorAll('.mapboxgl-marker');
      markers.forEach(marker => {
        // Check if it's not a route marker
        const svg = marker.querySelector('svg');
        if (svg) {
          const viewBox = svg.getAttribute('viewBox');
          // Keep only route markers (viewBox="0 0 24 24" for start, "0 0 24 32" for end)
          if (viewBox !== '0 0 24 24' && viewBox !== '0 0 24 32') {
            marker.remove();
          }
        } else {
          // Remove markers without SVG (like officer/incident markers)
          marker.remove();
        }
      });
    };
    
    // Initial cleanup
    markerCleanup();
    
    // Set up periodic cleanup to catch any new markers
    setInterval(markerCleanup, 1000);
  }
  
  if (!shouldHideControls) {
    // Add location source
    map.addSource('device-location', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [${MANILA_CENTER.lng}, ${MANILA_CENTER.lat}]
        },
        properties: {
          accuracy: 0,
          heading: 0,
          speed: 0
        }
      }
    });

    // Add accuracy circle
    map.addLayer({
      id: 'device-location-accuracy',
      type: 'circle',
      source: 'device-location',
      paint: {
        'circle-radius': ['/', ['get', 'accuracy'], 1],
        'circle-color': '#4285F4',
        'circle-opacity': 0.15,
        'circle-pitch-alignment': 'map'
      }
    });

    // Add direction indicator
    map.addLayer({
      id: 'device-location-direction',
      type: 'symbol',
      source: 'device-location',
      layout: {
        'icon-image': 'triangle-15',
        'icon-rotate': ['get', 'heading'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      },
      paint: {
        'icon-color': '#4285F4',
        'icon-opacity': ['case', ['==', ['get', 'speed'], 0], 0, 0.8]
      }
    });
  }
});

// Handle device location updates with improved accuracy
window.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'updateDeviceLocation') {
    const { latitude, longitude, accuracy, heading, speed, timestamp } = data.location;
    const timeSinceLastUpdate = timestamp - locationUpdateTime;
    const shouldHideControls = ${hideControls ? 'true' : 'false'};
    
    // Skip device location updates when controls are hidden
    if (shouldHideControls) {
      return;
    }
    
    // Update only if accuracy is good enough or if it's been a while
    if (accuracy <= 20 || timeSinceLastUpdate > 5000) {
      currentLocation = data.location;
      locationUpdateTime = timestamp;

      // Update location source
      const source = map.getSource('device-location');
      if (source) {
        source.setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          properties: {
            accuracy: accuracy,
            heading: heading || 0,
            speed: speed || 0
          }
        });

        // Center map on first location fix
        if (isFirstLocation) {
          map.flyTo({
            center: [longitude, latitude],
            zoom: 17,
            duration: 1000
          });
          isFirstLocation = false;
        }
      }
    }
  }
});

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
  
  // Only add crime data layers if we have data and features
  const hasData = originalData && originalData.features && originalData.features.length > 0;
  if (!hasData) {
    console.log('No crime data to display, skipping crime layers');
    return;
  }

  // Add the source for crime data
  map.addSource('crimes', {
    type: 'geojson',
    data: originalData,
    cluster: true,
    clusterMaxZoom: 12, // Lower max zoom for better clustering
    clusterRadius: 80, // Larger radius to group nearby stations
    // Custom cluster properties to aggregate crime data
    clusterProperties: {
      // Sum up the crime counts from all points in the cluster
      totalCount: ['+', ['get', 'count']],
      // Keep track of the highest crime count in the cluster
      maxCount: ['max', ['get', 'count']],
      // Count of stations in the cluster
      stationCount: ['+', 1]
    }
  });

  // Add a layer for the clusters
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'crimes',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'case',
        ['<=', ['get', 'totalCount'], 100], '#65ee15', // Low (Green)
        ['<=', ['get', 'totalCount'], 799], '#fc4e2a', // Medium (Orange)
        '#e31a1c' // High (Red)
      ],
      'circle-radius': [
        'step',
        ['get', 'totalCount'],
        25,    // 1-100 crimes
        100,
        35,    // 101-300 crimes
        300,
        45,    // 301-600 crimes
        600,
        55,    // 601-1000 crimes
        1000,
        65     // 1000+ crimes
      ],
      'circle-opacity': 0.9,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-opacity': 0.8
    }
  });

  // Add a layer for cluster counts showing aggregated crime data
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'crimes',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': [
        'concat',
        ['number-format', ['get', 'totalCount'], {}],
        ['case',
          ['>', ['get', 'stationCount'], 1],
          ['concat', '\\n(', ['number-format', ['get', 'stationCount'], {}], ' stations)'],
          ''
        ]
      ],
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': [
        'step',
        ['get', 'totalCount'],
        14,    // Size for 1-100
        100,
        16,    // Size for 101-300
        300,
        18,    // Size for 301-600
        600,
        20,    // Size for 601-1000
        1000,
        24     // Size for 1000+
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
        ['<=', ['get', 'count'], 100], '#65ee15', // Low (Green)
        ['<=', ['get', 'count'], 799], '#fc4e2a', // Medium (Orange)
        '#e31a1c' // High (Red)
      ],
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        0, 12,      // Min size for count of 0
        100, 16,    // Medium size for count of 100
        300, 20,    // Large size for count of 300
        500, 25     // Max size for count of 500+
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
        10, 14,     // Size for count of 10
        50, 16,     // Size for count of 50
        100, 18     // Size for count of 100+
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

  // Add custom popup for clusters
  let popup = null;

  // Add hover effect for clusters
  map.on('mouseenter', 'clusters', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    
    // Create popup if it doesn't exist
    if (!popup) {
      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'cluster-popup'
      });
    }
    
    // Get cluster properties
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    const cluster = features[0];
    const totalCount = cluster.properties.totalCount;
    const stationCount = cluster.properties.stationCount;
    
    // Create popup content
    const popupContent = \`
      <div style="padding: 8px; font-family: Arial, sans-serif;">
        <div style="font-weight: bold; margin-bottom: 4px;">Total Crimes: \${totalCount}</div>
        <div style="font-size: 12px; color: #666;">\${stationCount} station\${stationCount > 1 ? 's' : ''}</div>
      </div>
    \`;
    
    popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
    
    // Optional: You could add a slight size increase on hover
    map.setPaintProperty('clusters', 'circle-radius', [
      'step',
      ['get', 'totalCount'],
      28,    // 1-100 crimes (slightly bigger on hover)
      100,
      38,    // 101-300 crimes
      300,
      48,    // 301-600 crimes
      600,
      58,    // 601-1000 crimes
      1000,
      68     // 1000+ crimes
    ]);
  });

  map.on('mouseleave', 'clusters', () => {
    map.getCanvas().style.cursor = '';
    
    // Remove popup
    if (popup) {
      popup.remove();
      popup = null;
    }
    
    // Reset to original size
    map.setPaintProperty('clusters', 'circle-radius', [
      'step',
      ['get', 'totalCount'],
      25,    // 1-100 crimes
      100,
      35,    // 101-300 crimes
      300,
      45,    // 301-600 crimes
      600,
      55,    // 601-1000 crimes
      1000,
      65     // 1000+ crimes
    ]);
  });

  // Add hover effects for individual points
  map.on('mouseenter', 'unclustered-point', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    
    // Create popup for individual points
    if (!popup) {
      popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'point-popup'
      });
    }
    
    const feature = e.features[0];
    const count = feature.properties.count;
    const station = feature.properties.station;
    const crimeType = feature.properties.crimeType;
    
    const popupContent = \`
      <div style="padding: 8px; font-family: Arial, sans-serif;">
        <div style="font-weight: bold; margin-bottom: 4px;">\${crimeType}: \${count}</div>
        <div style="font-size: 12px; color: #666;">\${station}</div>
      </div>
    \`;
    
    popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
  });

  map.on('mouseleave', 'unclustered-point', () => {
    map.getCanvas().style.cursor = '';
    
    // Remove popup
    if (popup) {
      popup.remove();
      popup = null;
    }
  });

  // Add custom location tracking
  const shouldHideControls = ${hideControls ? 'true' : 'false'};
  
  // Check if we're on a secure origin (HTTPS or localhost)
  const isSecureOrigin = location.protocol === 'https:' || 
                        location.hostname === 'localhost' || 
                        location.hostname === '127.0.0.1' ||
                        location.hostname === '0.0.0.0';
  
  if ('geolocation' in navigator && isSecureOrigin) {
    const locationLoadingEl = document.querySelector('.location-loading');
    const locationErrorEl = document.querySelector('.location-error');
    
    // Watch position with high accuracy
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Update user location marker
        if (!map.getSource('user-location')) {
          map.addSource('user-location', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              properties: {
                accuracy: accuracy
              }
            }
          });

          // Add accuracy circle
          map.addLayer({
            id: 'location-accuracy',
            type: 'circle',
            source: 'user-location',
            paint: {
              'circle-radius': ['/', ['get', 'accuracy'], 1],
              'circle-color': '#4285F4',
              'circle-opacity': 0.15
            }
          });

          // Add user location dot
          map.addLayer({
            id: 'location-dot',
            type: 'circle',
            source: 'user-location',
            paint: {
              'circle-radius': 8,
              'circle-color': '#4285F4',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            }
          });
        } else {
          // Update existing location data
          map.getSource('user-location').setData({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: {
              accuracy: accuracy
            }
          });
        }

        locationLoadingEl.style.display = 'none';
      },
      (error) => {
        // Only show error for actual geolocation failures, not HTTPS requirement
        if (error.code !== 1 || error.message.toLowerCase().includes('denied')) {
          console.error('Error getting location:', error);
          locationErrorEl.textContent = 'Could not get your location';
          locationErrorEl.style.display = 'block';
          setTimeout(() => {
            locationErrorEl.style.display = 'none';
          }, 5000);
        } else {
          // Silently fail for HTTPS-related errors
          console.log('Geolocation requires HTTPS');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Cleanup watch position when map is removed
    map.on('remove', () => {
      navigator.geolocation.clearWatch(watchId);
    });
  } else if (!isSecureOrigin && !shouldHideControls) {
    // Log HTTPS requirement but don't show error to user
    console.log('Geolocation requires secure origin (HTTPS)');
  }
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
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'patrolComplete' && userType === 'police') {
            // Handle patrol completion
            console.log('Patrol completed:', data.data);
            // Here you could send the data to your backend
          }
        }}
        onLoadEnd={sendFiltersToMap}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  webView: {
    flex: 1,
  },
  patrolButton: {
    position: 'absolute',
  },
});

export default MapComponent; 