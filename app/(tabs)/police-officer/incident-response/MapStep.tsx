import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import {
  multidirectionalDijkstra,
} from "../../../../utils/multidirectionalDijkstra";
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

type DijkstraResult = { path: string[]; distance: number };

interface RouteResult extends DijkstraResult {
  coords?: { lat: number; lng: number }[];
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
    haversine(node.lat, node.lng, officer.lat, officer.lng) < radius * 111 ||
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
  const [error, setError] = useState("");
  const [routeCoords, setRouteCoords] = useState<
    { lat: number; lng: number }[] | null
  >(null);
  const [officerLocation, setOfficerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [officerAddress, setOfficerAddress] = useState<string>('Fetching location...');
  const [graphData, setGraphData] = useState<{ graphNodes: any[]; graphEdges: any } | null>(null);
  const [graphLoading, setGraphLoading] = useState(true);
  const [graphError, setGraphError] = useState("");
  const routeIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [showAccuracyModal, setShowAccuracyModal] = useState(false);
  const hasShownAccuracyWarning = React.useRef(false);

  useEffect(() => {
    if (!alert_id) {
      setError("Alert ID is missing.");
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
          setError(result.error || "Failed to fetch alert details.");
        }
      } catch (e) {
        setError("Failed to fetch alert details.");
      }
    };
    fetchAlertDetails();
  }, [alert_id]);

  useEffect(() => {
    let locationInterval: NodeJS.Timeout;
    const fetchAndSendLocation = async () => {
      try {
        // Request permission if not already granted
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        if (!isMountedRef.current) return;
        const accuracy = loc.coords.accuracy ?? 9999;
        setLocationAccuracy(accuracy);
        if (accuracy > 25 && !hasShownAccuracyWarning.current) {
          setShowAccuracyModal(true);
          hasShownAccuracyWarning.current = true;
        }

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
    // Repeat every 10 seconds
    locationInterval = setInterval(fetchAndSendLocation, 10000);

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
    const interval = setInterval(fetchOfficerLocation, 10000);
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
      console.log("DEBUG: Missing required data:", {
        hasOfficerLocation: !!officerLocation,
        hasAlertDetails: !!alertDetails,
        hasGraphData: !!graphData,
      });
      return;
    }

    const calculateRoute = async () => {
      if (!isMountedRef.current) return;

      // --- EXTERNAL API CALL ---
      let dijkstraResult: RouteResult | null = null;
      try {
        const apiUrl =
          "https://djikstra-calculation.onrender.com/calculate_route";
        const payload = {
          start: officerLocation,
          end: {
            lat: Number(alertDetails.a_latitude),
            lng: Number(alertDetails.a_longitude),
          },
        };
        console.log("Calling Dijkstra API with coordinates:", {
          url: apiUrl,
        });
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.route) && data.route.length > 0) {
          dijkstraResult = { path: [], distance: 0, coords: data.route };
        } else {
          // If API succeeds but finds no route, throw to fallback
          throw new Error(
            data.error || "API was successful but found no route."
          );
        }
      } catch (err) {
        console.error(
          "External Dijkstra API failed, falling back to local:",
          err
        );
        // Fallback to local calculation
        try {
          const { graphNodes, graphEdges } = graphData;
          const { filteredNodes, filteredEdges } = filterGraphByProximity(
            graphNodes,
            graphEdges,
            officerLocation,
            {
              lat: Number(alertDetails.a_latitude),
              lng: Number(alertDetails.a_longitude),
            },
            0.1 // Use a larger radius for local fallback
          );
          // BUG FIX: Always find nearest node from the FULL graph
          const startNode = findNearestNodeHaversine(
            officerLocation.lat,
            officerLocation.lng,
            graphNodes 
          );
          const endNode = findNearestNodeHaversine(
            Number(alertDetails.a_latitude),
            Number(alertDetails.a_longitude),
            graphNodes
          );

          if (startNode && endNode) {
            const localResult = multidirectionalDijkstra(
              filteredEdges,
              startNode,
              endNode
            );
            if (
              localResult &&
              localResult.path &&
              localResult.path.length > 1
            ) {
              dijkstraResult = {
                ...localResult,
                coords: localResult.path
                  .map((nodeId: string) => {
                    const node = filteredNodes.find((n) => n.id === nodeId);
                    return node ? { lat: node.lat, lng: node.lng } : null;
                  })
                  .filter(Boolean) as { lat: number; lng: number }[],
              };
            } else {
              dijkstraResult = null;
            }
          } else {
            dijkstraResult = null;
          }
        } catch (e) {
          dijkstraResult = null;
          console.error("Local Dijkstra calculation also failed:", e);
        }
      }

      if (
        dijkstraResult &&
        dijkstraResult.coords &&
        dijkstraResult.coords.length > 0
      ) {
        const fullRoute = [
          officerLocation,
          ...dijkstraResult.coords,
          {
            lat: Number(alertDetails.a_latitude),
            lng: Number(alertDetails.a_longitude),
          },
        ];

        console.log("DEBUG: Calculated route:", fullRoute.length, "points");
        setRouteCoords(fullRoute);
        setError("");
      } else {
        console.log("DEBUG: No route found");
        setRouteCoords(null);
        setError("No route found between officer and incident.");
      }
    };

    calculateRoute();
    routeIntervalRef.current = setInterval(calculateRoute, 10000);

    return () => {
      if (routeIntervalRef.current) clearInterval(routeIntervalRef.current);
    };
  }, [officerLocation, alertDetails, graphData]);

  // Stop route calculation if navigated away or resolved
  useEffect(() => {
    return () => {
      if (routeIntervalRef.current) clearInterval(routeIntervalRef.current);
    };
  }, []);

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

  // Calculate distance to incident (in meters)
  let distanceToIncident = null;
  if (officerLocation && alertDetails) {
    distanceToIncident = haversine(
      officerLocation.lat,
      officerLocation.lng,
      Number(alertDetails.a_latitude),
      Number(alertDetails.a_longitude)
    ) * 1000; // haversine returns km, convert to meters
  }

  if (graphLoading || !alertDetails) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E02323" />
        <Text>
          {graphLoading ? "Loading Map Data..." : "Loading Alert Details..."}
        </Text>
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
          routeCoords={routeCoords ?? undefined}
          officerLocation={officerLocation ?? undefined}
          incidentLocation={
            alertDetails
              ? {
                  lat: alertDetails.a_latitude,
                  lng: alertDetails.a_longitude,
                }
              : undefined
          }
        />
      </View>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <LocationIcon />
          <View style={styles.infoTextContainer}>
            <Text style={styles.label}>Incident Location</Text>
            <Text style={styles.value}>{alertDetails.a_address}</Text>
            {locationAccuracy !== null && locationAccuracy > 25 && (
              <Text style={[styles.value, { color: '#E02323', fontWeight: 'bold' }]}>Warning: Your location accuracy is poor ({locationAccuracy.toFixed(1)} meters). Please enable high-accuracy mode in your device settings.</Text>
            )}
            {distanceToIncident !== null && (
              <Text style={styles.value}>
                Distance to incident: {distanceToIncident.toFixed(1)} meters
              </Text>
            )}
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
        <TouchableOpacity
          style={[styles.button, distanceToIncident !== null && distanceToIncident > 20 ? { backgroundColor: '#ccc' } : {}]}
          onPress={() => {
            if (distanceToIncident !== null && distanceToIncident <= 20) {
              router.push(`/police-officer/incident-response/ArrivedStep?alert_id=${alert_id}`);
            }
          }}
          disabled={distanceToIncident === null || distanceToIncident > 20}
        >
          <Text style={styles.buttonText}>You&apos;ve Arrived</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={showAccuracyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccuracyModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center', maxWidth: 320 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#E02323', marginBottom: 12 }}>Location Accuracy Warning</Text>
            <Text style={{ color: '#333', fontSize: 15, marginBottom: 16, textAlign: 'center' }}>
              Your current location accuracy is {locationAccuracy ? locationAccuracy.toFixed(1) : '?'} meters, which may not be sufficient for incident response.
              {'\n'}
              Please enable "High accuracy" mode in your device's location settings (Settings → Location → Mode → High accuracy) and ensure you have a clear view of the sky.
            </Text>
            <TouchableOpacity style={{ backgroundColor: '#E02323', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }} onPress={() => setShowAccuracyModal(false)}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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