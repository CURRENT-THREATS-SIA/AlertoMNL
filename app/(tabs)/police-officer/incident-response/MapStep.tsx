import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import { multidirectionalDijkstra } from '../../../../utils/multidirectionalDijkstra';
import MapComponent from '../../../components/MapComponent';
import { loadGraphData } from '../../../utils/loadGraphData';
import { findNearestNode } from '../../../utils/nearestNode';

// --- SVG Icon Components for the new UI ---

const LocationIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M12 10a3 3 0 100-6 3 3 0 000 6z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const ClockIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" />
        <Path d="M12 6v6l4 2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const ReportedIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke="#333" strokeWidth="2" />
        <Path d="M12 8v4" stroke="#333" strokeWidth="2" strokeLinecap="round" />
        <Path d="M12 16h.01" stroke="#333" strokeWidth="2" strokeLinecap="round" />
    </Svg>
);

const VictimIcon = () => (
    <Svg height="24" width="24" viewBox="0 0 24 24" fill="none">
        <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);


// --- Main Component ---
interface AlertDetails {
  a_address: string;
  a_created: string;
  a_latitude: number;
  a_longitude: number;
  f_name: string;
  l_name: string;
  m_number: string;
}

export default function MapStep() {
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
        console.error(e);
        setError('An error occurred. Please check your connection.');
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
    let isMounted = true;

    const fetchAndSendLocation = async () => {
      try {
        // Request permission if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (!isMounted) return;
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
      } catch (e) {
        // Optionally handle error
      }
    };

    // Initial fetch
    fetchAndSendLocation();
    // Repeat every 5 seconds
    locationInterval = setInterval(fetchAndSendLocation, 5000);

    return () => {
      isMounted = false;
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [alert_id]);

  // Fetch latest police officer location from backend
  useEffect(() => {
    const fetchOfficerLocation = async () => {
      const policeId = await AsyncStorage.getItem('police_id');
      console.log('DEBUG policeId:', policeId, 'alert_id:', alert_id); // Debug log
      if (!policeId || !alert_id) return;
      try {
        const res = await fetch(`http://mnl911.atwebpages.com/get_police_location.php?police_id=${policeId}&alert_id=${alert_id}`);
        const data = await res.json();
        console.log('DEBUG get_police_location response:', data); // Debug log
        if (data.success && data.location) {
          setOfficerLocation({ lat: parseFloat(data.location.latitude), lng: parseFloat(data.location.longitude) });
          setError(''); // Clear error on success
        } else {
          console.log('DEBUG Officer location not found:', data.error); // Debug log
        }
      } catch (e) {
        console.error('Fetch error:', e); // Debug log
      }
    };
    fetchOfficerLocation();
    // Optionally, poll every few seconds for real-time updates
    const interval = setInterval(fetchOfficerLocation, 5000);
    return () => clearInterval(interval);
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
        } catch (e) {
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
    if (!officerLocation || !alertDetails || !graphData) return;
    const { graphNodes, graphEdges } = graphData;
    const startNode = findNearestNode(officerLocation.lat, officerLocation.lng, graphNodes);
    const endNode = findNearestNode(Number(alertDetails.a_latitude), Number(alertDetails.a_longitude), graphNodes);
    if (!startNode || !endNode) {
      setError('Officer or incident location is not on the map.');
      return;
    }
    const dijkstraResult = multidirectionalDijkstra(graphEdges, startNode, endNode);
    if (dijkstraResult && dijkstraResult.path) {
      const coords = dijkstraResult.path.map(nodeId => {
        const node = graphNodes.find(n => n.id === nodeId);
        return node ? { lat: node.lat, lng: node.lng } : null;
      }).filter(Boolean) as { lat: number; lng: number }[];
      const fullRoute = [
        officerLocation,
        ...coords,
        { lat: Number(alertDetails.a_latitude), lng: Number(alertDetails.a_longitude) }
      ];
      setRouteCoords(fullRoute);
      setError('');
    } else {
      setError('No route found between officer and incident.');
    }
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
        <Text>Loading Incident Details...</Text>
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
            <Text style={styles.label}>Location</Text>
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
            <Text style={styles.value}>{alertDetails.f_name} {alertDetails.l_name}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// --- Add your styles below ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
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
    marginLeft: 12
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
  }
});