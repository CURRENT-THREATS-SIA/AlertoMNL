import Mapbox from '@rnmapbox/maps';
import { Feature, FeatureCollection, Point } from 'geojson';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { MAPBOX_TOKEN } from '../constants/mapData';
import { dbscan, DBSCANCluster } from '../utils/dbscan';

// Initialize Mapbox only once at the module level
Mapbox.setAccessToken(MAPBOX_TOKEN);

interface CrimeProperties {
  id: string;
  crimeType: string;
  station: string;
  count: number;
  isIndexCrime: boolean;
}

interface CrimeFeature extends Feature<Point> {
  properties: CrimeProperties;
}

interface CrimeMapProps {
  data: FeatureCollection<Point>;
  userType: string;
  selectedCrimeType: string | null;
  selectedStation: string | null;
}

export const CrimeMap: React.FC<CrimeMapProps> = ({ data, userType, selectedCrimeType, selectedStation }) => {
  const [selectedCrimeCategory, setSelectedCrimeCategory] = useState<'all' | 'index' | 'non-index'>('all');
  const [filteredData, setFilteredData] = useState<FeatureCollection<Point>>(data);
  const [isMapReady, setIsMapReady] = useState(false);
  const [clusters, setClusters] = useState<DBSCANCluster[]>([]);
  const [zoomLevel, setZoomLevel] = useState(12);

  // Log props changes
  useEffect(() => {
    console.log('CrimeMap Props Updated:', {
      selectedCrimeType,
      selectedStation,
      totalDataPoints: data.features.length,
      dataExample: (data.features[0] as CrimeFeature)?.properties
    });
  }, [data, selectedCrimeType, selectedStation]);

  useEffect(() => {
    // Initialize map when component mounts
    const initializeMap = async () => {
      try {
        await Mapbox.requestAndroidLocationPermissions();
        console.log('Map initialization successful');
        setIsMapReady(true);
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    };

    initializeMap();
  }, []);

  // Filter data based on selected crime type and station
  useEffect(() => {
    const filtered = {
      type: 'FeatureCollection',
      features: data.features.filter((feature) => {
        const crimeFeature = feature as CrimeFeature;
        const matchesCrimeType = !selectedCrimeType || crimeFeature.properties.crimeType === selectedCrimeType;
        const matchesStation = !selectedStation || crimeFeature.properties.station === selectedStation;
        return matchesCrimeType && matchesStation;
      })
    } as FeatureCollection<Point>;

    setFilteredData(filtered);
  }, [data, selectedCrimeType, selectedStation]);

  // Apply DBSCAN clustering
  useEffect(() => {
    if (filteredData.features.length === 0) return;

    // Adjust eps (radius) based on zoom level
    const eps = Math.max(0.2, 1.0 - (zoomLevel - 10) * 0.1); // Decrease radius as zoom increases
    const minPoints = Math.max(2, Math.floor(filteredData.features.length * 0.02)); // At least 2% of total points

    const newClusters = dbscan(filteredData.features, eps, minPoints);
    setClusters(newClusters);
  }, [filteredData, zoomLevel]);

  // Create cluster features for rendering
  const clusterFeatures = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: clusters.map((cluster): Feature<Point> => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: cluster.centroid
        },
        properties: {
          cluster: true,
          point_count: cluster.points.length,
          point_count_abbreviated: cluster.points.length
        }
      }))
    } as FeatureCollection<Point>;
  }, [clusters]);

  // Create unclustered point features
  const unclusteredFeatures = useMemo(() => {
    const clusteredPointIds = new Set(
      clusters.flatMap(cluster => 
        cluster.points.map(p => (p as CrimeFeature).properties.id)
      )
    );

    return {
      type: 'FeatureCollection',
      features: filteredData.features.filter(
        feature => !clusteredPointIds.has((feature as CrimeFeature).properties.id)
      )
    } as FeatureCollection<Point>;
  }, [filteredData, clusters]);

  const onSourceLayerPress = (e: { features: Feature[] }) => {
    console.log('Layer pressed:', e.features);
  };

  if (!isMapReady) {
    console.log('Map not ready yet');
    return <View style={{ flex: 1 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Mapbox.MapView
        style={{ flex: 1 }}
        zoomEnabled
        rotateEnabled={false}
        onRegionDidChange={(region) => {
          setZoomLevel(region.properties.zoomLevel);
        }}
      >
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={[120.9842, 14.5995]}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {isMapReady && (
          <>
            {/* Render clusters */}
            <Mapbox.ShapeSource
              id="clusters"
              shape={clusterFeatures}
            >
              <Mapbox.CircleLayer
                id="clustered-points"
                style={{
                  circleColor: [
                    'step',
                    ['get', 'point_count'],
                    '#ffeda0',  // 1-10 points
                    10,
                    '#feb24c',  // 11-25 points
                    25,
                    '#fc4e2a',  // 26-50 points
                    50,
                    '#e31a1c',  // 51-100 points
                    100,
                    '#800026'   // 100+ points
                  ],
                  circleRadius: [
                    'step',
                    ['get', 'point_count'],
                    25,    // 1-10 points
                    10,
                    35,    // 11-25 points
                    25,
                    45,    // 26-50 points
                    50,
                    55,    // 51-100 points
                    100,
                    65     // 100+ points
                  ],
                  circleOpacity: 0.9,
                  circleStrokeWidth: 3,
                  circleStrokeColor: '#ffffff',
                  circleStrokeOpacity: 0.8
                }}
              />
              <Mapbox.SymbolLayer
                id="cluster-count"
                style={{
                  textField: '{point_count_abbreviated}',
                  textSize: [
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
                  ],
                  textColor: '#ffffff',
                  textFont: ['DIN Offc Pro Medium', 'Arial Unicode MS Bold']
                }}
              />
            </Mapbox.ShapeSource>

            {/* Render unclustered points */}
            <Mapbox.ShapeSource
              id="unclustered-points"
              shape={unclusteredFeatures}
            >
              <Mapbox.CircleLayer
                id="unclustered-point"
                style={{
                  circleColor: [
                    'case',
                    ['get', 'isIndexCrime'],
                    '#e31a1c',  // Bright red for index crimes
                    '#feb24c'   // Orange for non-index crimes
                  ],
                  circleRadius: [
                    'interpolate',
                    ['linear'],
                    ['get', 'count'],
                    1, 12,      // Min size for count of 1
                    5, 16,      // Medium size for count of 5
                    10, 20,     // Large size for count of 10
                    20, 25      // Max size for count of 20+
                  ],
                  circleStrokeWidth: 2,
                  circleStrokeColor: '#ffffff',
                  circleOpacity: 0.85,
                  circleStrokeOpacity: 0.8
                }}
              />
              <Mapbox.SymbolLayer
                id="unclustered-point-count"
                style={{
                  textField: '{count}',
                  textSize: [
                    'interpolate',
                    ['linear'],
                    ['get', 'count'],
                    1, 12,      // Size for count of 1
                    5, 14,      // Size for count of 5
                    10, 16,     // Size for count of 10
                    20, 18      // Size for count of 20+
                  ],
                  textColor: '#ffffff',
                  textHaloColor: 'rgba(0, 0, 0, 0.3)',
                  textHaloWidth: 2
                }}
              />
            </Mapbox.ShapeSource>
          </>
        )}
      </Mapbox.MapView>
    </View>
  );
};