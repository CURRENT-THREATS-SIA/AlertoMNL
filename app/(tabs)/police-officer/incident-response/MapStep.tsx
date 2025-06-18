import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { multidirectionalDijkstra } from '../../../../utils/multidirectionalDijkstra';
import MapComponent from '../../../components/MapComponent';
import { loadGraphData } from '../../../utils/loadGraphData';

// --- SVG Icon Components for the new UI ---

const LocationIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 2C10.34 2 8.78 2.84 7.76 4.24C6.74 5.64 6.24 7.5 6.24 9.5C6.24 11.5 6.74 13.36 7.76 14.76L12 22L16.24 14.76C17.26 13.36 17.76 11.5 17.76 9.5C17.76 7.5 17.26 5.64 16.24 4.24C15.22 2.84 13.66 2 12 2ZM12 0C13.66 0 15.22 0.84 16.24 2.24C17.26 3.64 17.76 5.5 17.76 7.5C17.76 9.5 17.26 11.36 16.24 12.76L12 20L7.76 12.76C6.74 11.36 6.24 9.5 6.24 7.5C6.24 5.5 6.74 3.64 7.76 2.24C8.78 0.84 10.34 0 12 0Z" fill="#E02323"/>
  </Svg>
);

const ClockIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 2C10.34 2 8.78 2.84 7.76 4.24C6.74 5.64 6.24 7.5 6.24 9.5C6.24 11.5 6.74 13.36 7.76 14.76L12 22L16.24 14.76C17.26 13.36 17.76 11.5 17.76 9.5C17.76 7.5 17.26 5.64 16.24 4.24C15.22 2.84 13.66 2 12 2ZM12 0C13.66 0 15.22 0.84 16.24 2.24C17.26 3.64 17.76 5.5 17.76 7.5C17.76 9.5 17.26 11.36 16.24 12.76L12 20L7.76 12.76C6.74 11.36 6.24 9.5 6.24 7.5C6.24 5.5 6.74 3.64 7.76 2.24C8.78 0.84 10.34 0 12 0Z" fill="#E02323"/>
    <Path d="M12 6V12.59L16.29 16.29L17.71 14.88L13.41 10.59V6H12Z" fill="#E02323"/>
  </Svg>
);

const ReportedIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 2C10.34 2 8.78 2.84 7.76 4.24C6.74 5.64 6.24 7.5 6.24 9.5C6.24 11.5 6.74 13.36 7.76 14.76L12 22L16.24 14.76C17.26 13.36 17.76 11.5 17.76 9.5C17.76 7.5 17.26 5.64 16.24 4.24C15.22 2.84 13.66 2 12 2ZM12 0C13.66 0 15.22 0.84 16.24 2.24C17.26 3.64 17.76 5.5 17.76 7.5C17.76 9.5 17.26 11.36 16.24 12.76L12 20L7.76 12.76C6.74 11.36 6.24 9.5 6.24 7.5C6.24 5.5 6.74 3.64 7.76 2.24C8.78 0.84 10.34 0 12 0Z" fill="#E02323"/>
    <Path d="M12 8V12.59L15.29 15.88L16.71 14.47L13.41 11.17V8H12Z" fill="#E02323"/>
  </Svg>
);

const VictimIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M12 2C10.34 2 8.78 2.84 7.76 4.24C6.74 5.64 6.24 7.5 6.24 9.5C6.24 11.5 6.74 13.36 7.76 14.76L12 22L16.24 14.76C17.26 13.36 17.76 11.5 17.76 9.5C17.76 7.5 17.26 5.64 16.24 4.24C15.22 2.84 13.66 2 12 2ZM12 0C13.66 0 15.22 0.84 16.24 2.24C17.26 3.64 17.76 5.5 17.76 7.5C17.76 9.5 17.26 11.36 16.24 12.76L12 20L7.76 12.76C6.74 11.36 6.24 9.5 6.24 7.5C6.24 5.5 6.74 3.64 7.76 2.24C8.78 0.84 10.34 0 12 0Z" fill="#E02323"/>
    <Path d="M12 10V14.59L15.29 17.88L16.71 16.47L13.41 13.17V10H12Z" fill="#E02323"/>
  </Svg>
);

interface AlertDetails {
  a_address: string;
  a_created: string;
  a_latitude: number;
  a_longitude: number;
  f_name: string;
  l_name: string;
  m_number: string;
}

// Utility: Haversine distance for more accurate nearest node
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Improved findNearestNode using Haversine
function findNearestNodeHaversine(lat: number, lng: number, nodes: GraphNode[]): string | null {
  let minDist = Infinity;
  let nearest: string | null = null;
  for (const node of nodes) {
    const dist = haversine(node.lat, node.lng, lat, lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = node.id;
    }
  }
  return nearest;
}

// Utility: filter graph by proximity to officer/incident, always include start/end nodes
interface GraphNode { id: string; lat: number; lng: number; }
interface GraphEdge { node: string; weight: number; }
interface LatLng { lat: number; lng: number; }
function filterGraphByProximity(
  graphNodes: GraphNode[],
  graphEdges: Record<string, GraphEdge[]>,
  officer: LatLng,
  incident: LatLng,
  radius = 0.05 // increased radius for better connectivity
): { filteredNodes: GraphNode[]; filteredEdges: Record<string, GraphEdge[]> } {
  const isNear = (node: GraphNode) =>
    haversine(node.lat, node.lng, officer.lat, officer.lng) < radius * 111 &&
    haversine(node.lat, node.lng, incident.lat, incident.lng) < radius * 111;
  let filteredNodes = graphNodes.filter(isNear);
  // Always include nearest nodes to officer and incident
  const startNode = findNearestNodeHaversine(officer.lat, officer.lng, graphNodes);
  const endNode = findNearestNodeHaversine(incident.lat, incident.lng, graphNodes);
  const nodeIds = new Set(filteredNodes.map((n) => n.id));
  if (startNode) nodeIds.add(startNode);
  if (endNode) nodeIds.add(endNode);
  filteredNodes = graphNodes.filter(n => nodeIds.has(n.id));
  const filteredEdges: Record<string, GraphEdge[]> = {};
  for (const id of nodeIds) {
    if (graphEdges[id]) {
      filteredEdges[id] = graphEdges[id].filter((e: GraphEdge) => nodeIds.has(e.node));
    }
  }
  return { filteredNodes, filteredEdges };
}

export default function MapStep() {
  const isMountedRef = React.useRef(true);
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  console.log("MapStep loaded"); // Top-level log to confirm component mount
  const router = useRouter();
  const { alert_id } = useLocalSearchParams();
  console.log('MapStep alert_id:', alert_id); // <--- Add this

  const [alertDetails, setAlertDetails] = useState<AlertDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [routeCoords, setRouteCoords] = useState<{ lat: number; lng: number }[] | null>(null);
  const [officerLocation, setOfficerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [officerAddress, setOfficerAddress] = useState<string>('Fetching location...');
  const [graphData, setGraphData] = useState<{ graphNodes: any[]; graphEdges: any } | null>(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [graphError, setGraphError] = useState('');
  const [hasInitialRoute, setHasInitialRoute] = useState(false);

  useEffect(() => {
    if (!alert_id) {
      setError("Alert ID is missing.");
      setIsLoading(false);
      return;
    }
    const fetchAlertDetails = async () => {
      try {
        const response = await fetch(`http://mnl911.atwebpages.com/get_alert_details.php?alert_id=${alert_id}`);
        const result = await response.json();
        if (result.success) {
          // Convert a_latitude and a_longitude to numbers for type safety
          const data = {
            ...result.data,
            a_latitude: parseFloat(result.data.a_latitude),
            a_longitude: parseFloat(result.data.a_longitude)
          };
          setAlertDetails(data);
        } else {
          setError(result.error || 'Failed to fetch alert details.');
        }
      } catch (e) {
        setError('Failed to fetch alert details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlertDetails();
  }, [alert_id]);

  useEffect(() => {
    if (!alert_id) {
      setError('Alert ID is missing. Cannot fetch route.');
      setIsLoading(false);
      return;
    }
    console.log('Fetching route for alert_id:', alert_id); // Add this line

    fetch(`http://mnl911.atwebpages.com/get_sos_route.php?alert_id=${alert_id}`)
      .then(async res => {
        // Check if response is JSON
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setRouteCoords([
            { lat: data.officer.lat, lng: data.officer.lng },
            { lat: data.user.lat, lng: data.user.lng }
          ]);
        } else {
          setRouteCoords(null);
          setError(data.error || 'Failed to fetch route.');
        }
      })
      .catch((err) => {
        setRouteCoords(null);
        setError('Route fetch error: ' + (err.message || 'Failed to fetch route.'));
        console.error('Route fetch error:', err);
      });
  }, [alert_id]);

  useEffect(() => {
    let locationInterval: NodeJS.Timeout;
    const fetchAndSendLocation = async () => {
      try {
        // Request permission if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (!isMountedRef.current) return;
        const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setOfficerLocation(coords);
        // Send to backend
        const policeId = await AsyncStorage.getItem('police_id');
        if (policeId && alert_id) {
          await fetch('http://mnl911.atwebpages.com/update_police_location.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              police_id: policeId,
              alert_id,
              latitude: coords.lat,
              longitude: coords.lng
            })
          });
        }
      } catch {
        // Optionally handle error
      }
    };
    // Initial fetch
    fetchAndSendLocation();
    // Repeat every 5 seconds
    locationInterval = setInterval(fetchAndSendLocation, 5000);

    return () => {
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [alert_id]);

  // Fetch latest police officer location from backend
  useEffect(() => {
    const fetchOfficerLocation = async () => {
      const policeId = await AsyncStorage.getItem('police_id');
      if (!policeId || !alert_id) return;
      try {
        const res = await fetch(`http://mnl911.atwebpages.com/get_police_location.php?police_id=${policeId}&alert_id=${alert_id}`);
        const data = await res.json();
        if (data.success && data.location && isMountedRef.current) {
          setOfficerLocation({ lat: parseFloat(data.location.latitude), lng: parseFloat(data.location.longitude) });
          setError(''); // Clear error on success
        }
      } catch {
        // Optionally handle error
      }
    };
    fetchOfficerLocation();
    const interval = setInterval(fetchOfficerLocation, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [alert_id]);

  useEffect(() => {
    if (officerLocation) {
      // Reverse geocode officer location
      (async () => {
        try {
          const [address] = await Location.reverseGeocodeAsync({ latitude: officerLocation.lat, longitude: officerLocation.lng });
          if (address) {
            setOfficerAddress(`${address.street || ''} ${address.name || ''}, ${address.city || ''}`.trim());
          } else {
            setOfficerAddress('Unknown location');
          }
        } catch {
          setOfficerAddress('Unknown location');
        }
      })();
    }
  }, [officerLocation]);

  // Load graph data on mount
  useEffect(() => {
    loadGraphData()
      .then(setGraphData)
      .catch((e) => setGraphError('Failed to load map data.'))
      .finally(() => setGraphLoading(false));
  }, []);

  // Update Dijkstra effect to use loaded graph data
  useEffect(() => {
    if (!officerLocation || !alertDetails || !graphData) {
      console.log('DEBUG: Missing required data:', { 
        hasOfficerLocation: !!officerLocation, 
        hasAlertDetails: !!alertDetails, 
        hasGraphData: !!graphData 
      });
      return;
    }

    setIsLoading(true);
    console.log('DEBUG: Starting route calculation');

    const calculateRoute = () => {
      if (!isMountedRef.current) return;
      
      const { graphNodes, graphEdges } = graphData;
      const { filteredNodes, filteredEdges } = filterGraphByProximity(
        graphNodes,
        graphEdges,
        officerLocation,
        { lat: Number(alertDetails.a_latitude), lng: Number(alertDetails.a_longitude) },
        0.01
      );

      console.log('DEBUG: Filtered nodes:', filteredNodes.length);
      
      const startNode = findNearestNodeHaversine(officerLocation.lat, officerLocation.lng, filteredNodes);
      const endNode = findNearestNodeHaversine(Number(alertDetails.a_latitude), Number(alertDetails.a_longitude), filteredNodes);
      
      console.log('DEBUG: Found nodes:', { startNode, endNode });

      if (!startNode || !endNode) {
        setRouteCoords(null);
        setError('Officer or incident location is not on the map.');
        setIsLoading(false);
        return;
      }

      const dijkstraResult = multidirectionalDijkstra(filteredEdges, startNode, endNode);
      
      if (dijkstraResult && dijkstraResult.path && dijkstraResult.path.length > 1) {
        const coords = dijkstraResult.path.map(nodeId => {
          const node = filteredNodes.find(n => n.id === nodeId);
          return node ? { lat: node.lat, lng: node.lng } : null;
        }).filter(Boolean) as { lat: number; lng: number }[];

        const fullRoute = [
          officerLocation,
          ...coords,
          { lat: Number(alertDetails.a_latitude), lng: Number(alertDetails.a_longitude) }
        ];

        console.log('DEBUG: Calculated route:', fullRoute);
        setRouteCoords(fullRoute);
        setError('');
      } else {
        console.log('DEBUG: No route found');
        setRouteCoords(null);
        setError('No route found between officer and incident.');
      }
      setIsLoading(false);
    };

    // Calculate route immediately and then every 5 seconds
    calculateRoute();
    const interval = setInterval(calculateRoute, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [officerLocation, alertDetails, graphData]);

  const getFormattedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Add debug log before render
  console.log('RENDER officerLocation:', officerLocation, 'routeCoords:', routeCoords, 'error:', error);

  // --- Improved error display logic ---
  const shouldShowError = !!error && (!officerLocation || !routeCoords);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E02323" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (graphLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E02323" />
        <Text>Loading Map Data...</Text>
      </View>
    );
  }

  if (graphError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{graphError}</Text>
      </View>
    );
  }

  if (shouldShowError || !alertDetails) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Could not load alert details."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, minHeight: 300 }}>
        <MapComponent
          selectedCrimeType={''}
          selectedStation={null}
          userType={'police'}
          data={{ type: 'FeatureCollection', features: [] }}
          routeCoords={routeCoords}
          officerLocation={officerLocation} // Pass officer location to MapComponent
        />
      </View>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <LocationIcon />
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Incident Location</Text>
            <Text style={styles.value}>{alertDetails.a_address}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <LocationIcon />
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Your Location</Text>
            <Text style={styles.value}>{officerAddress}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <ClockIcon />
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Estimated Time Arrival</Text>
            <Text style={styles.value}>15 minutes</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <ReportedIcon />
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Reported</Text>
            <Text style={styles.value}>{getFormattedTime(alertDetails.a_created)}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <VictimIcon />
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Victim</Text>
            <Text style={styles.value}>{alertDetails.f_name} {alertDetails.l_name} ({alertDetails.m_number})</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => router.push(`/police-officer/incident-response/ArrivedStep?alert_id=${alert_id}`)}>
          <Text style={styles.buttonText}>You&apos;ve Arrived</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#E02323',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  infoTextContainer: {
    marginLeft: 16
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
    marginBottom: 1
  },
  value: {
    color: '#666',
    fontSize: 14
  },
  button: {
    marginTop: 8,
    backgroundColor: '#E02323',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});