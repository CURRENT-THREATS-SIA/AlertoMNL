import MapboxGL from '@rnmapbox/maps';
import { Feature, FeatureCollection, Point } from 'geojson';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { MAPBOX_TOKEN } from '../constants/mapData';

// Initialize Mapbox only once at the module level
if (Platform.OS === 'web') {
  MapboxGL.setAccessToken(MAPBOX_TOKEN);
}

interface CrimeMapProps {
  data: FeatureCollection<Point>;
  userType: 'regular' | 'police';
  selectedCrimeType?: string;
  selectedStation?: string;
}

interface CrimeFeature extends Feature<Point> {
  properties: {
    station: string;
    crimeType: string;
    count: number;
    isIndexCrime: boolean;
  };
}

export const CrimeMap: React.FC<CrimeMapProps> = ({ data, userType, selectedCrimeType, selectedStation }) => {
  const [selectedCrimeCategory, setSelectedCrimeCategory] = useState<'all' | 'index' | 'non-index'>('all');
  const [filteredData, setFilteredData] = useState<FeatureCollection<Point>>(data);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Initialize map when component mounts
    const initializeMap = async () => {
      try {
        if (Platform.OS !== 'web') {
          await MapboxGL.setAccessToken(MAPBOX_TOKEN);
        }
        setIsMapReady(true);
      } catch (error) {
        console.error('Error initializing Mapbox:', error);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (Platform.OS !== 'web') {
        MapboxGL.setAccessToken('');
      }
    };
  }, []);

  useEffect(() => {
    // Filter data based on selected filters
    const filtered: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: data.features.filter((feature) => {
        const crimeFeature = feature as CrimeFeature;
        const stationMatch = !selectedStation || crimeFeature.properties.station === selectedStation;
        const crimeTypeMatch = !selectedCrimeType || crimeFeature.properties.crimeType === selectedCrimeType;
        const crimeCategoryMatch = 
          selectedCrimeCategory === 'all' ||
          (selectedCrimeCategory === 'index' && crimeFeature.properties.isIndexCrime) ||
          (selectedCrimeCategory === 'non-index' && !crimeFeature.properties.isIndexCrime);
        
        return stationMatch && crimeTypeMatch && crimeCategoryMatch;
      })
    };
    setFilteredData(filtered);
  }, [selectedStation, selectedCrimeType, selectedCrimeCategory, data]);

  if (!isMapReady) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView 
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v11"
        attributionEnabled={false}
        logoEnabled={false}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
      >
        <MapboxGL.Camera
          zoomLevel={11}
          centerCoordinate={[120.9842, 14.5995]}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {isMapReady && (
          <MapboxGL.ShapeSource
            id="crimeSource"
            cluster
            clusterRadius={50}
            shape={filteredData}
          >
            <MapboxGL.SymbolLayer
              id="pointCount"
              style={{
                textField: ['get', 'point_count'],
                textSize: 12,
                textColor: '#ffffff',
                textIgnorePlacement: true,
                textAllowOverlap: true
              }}
            />

            <MapboxGL.CircleLayer
              id="clusters"
              filter={['has', 'point_count']}
              style={{
                circleColor: [
                  'step',
                  ['get', 'point_count'],
                  '#51bbd6',
                  100,
                  '#f1f075',
                  750,
                  '#f28cb1'
                ],
                circleRadius: [
                  'step',
                  ['get', 'point_count'],
                  20,
                  100,
                  30,
                  750,
                  40
                ],
                circleOpacity: 0.84,
                circleStrokeWidth: 2,
                circleStrokeColor: '#fff'
              }}
            />

            <MapboxGL.CircleLayer
              id="unclusteredPoints"
              filter={['!', ['has', 'point_count']]}
              style={{
                circleColor: ['case', 
                  ['get', 'isIndexCrime'], 
                  '#ff0000', 
                  '#ffa500'
                ],
                circleRadius: 8,
                circleStrokeWidth: 2,
                circleStrokeColor: '#ffffff',
                circleOpacity: 0.84
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  }
});