import Mapbox from '@rnmapbox/maps';
import { Feature, FeatureCollection, Point } from 'geojson';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { MAPBOX_TOKEN } from '../constants/mapData';

// Initialize Mapbox only once at the module level
Mapbox.setAccessToken(MAPBOX_TOKEN);

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

  // Log props changes
  useEffect(() => {
    console.log('CrimeMap Props Updated:', {
      selectedCrimeType,
      selectedStation,
      totalDataPoints: data.features.length,
      dataExample: data.features[0]?.properties
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

  useEffect(() => {
    console.log('Starting data filtering:', {
      selectedStation,
      selectedCrimeType,
      selectedCrimeCategory,
      totalDataPoints: data.features.length
    });

    // Filter data based on selected filters
    const filtered: FeatureCollection<Point> = {
      type: 'FeatureCollection',
      features: data.features.filter((feature) => {
        const crimeFeature = feature as CrimeFeature;
        
        // Log each feature being processed
        console.log('Processing feature:', {
          station: crimeFeature.properties.station,
          crimeType: crimeFeature.properties.crimeType,
          coordinates: crimeFeature.geometry.coordinates
        });

        const stationMatch = !selectedStation || crimeFeature.properties.station === selectedStation;
        const crimeTypeMatch = !selectedCrimeType || crimeFeature.properties.crimeType === selectedCrimeType;
        const crimeCategoryMatch = 
          selectedCrimeCategory === 'all' ||
          (selectedCrimeCategory === 'index' && crimeFeature.properties.isIndexCrime) ||
          (selectedCrimeCategory === 'non-index' && !crimeFeature.properties.isIndexCrime);
        
        // Log any mismatches
        if (!stationMatch) {
          console.log('Station mismatch:', {
            expected: selectedStation,
            got: crimeFeature.properties.station,
            exact: selectedStation === crimeFeature.properties.station
          });
        }
        if (!crimeTypeMatch) {
          console.log('Crime type mismatch:', {
            expected: selectedCrimeType,
            got: crimeFeature.properties.crimeType,
            exact: selectedCrimeType === crimeFeature.properties.crimeType
          });
        }
        
        return stationMatch && crimeTypeMatch && crimeCategoryMatch;
      })
    };

    console.log('Filtering complete:', {
      totalFiltered: filtered.features.length,
      samplePoint: filtered.features[0]?.properties,
      selectedFilters: {
        station: selectedStation,
        crimeType: selectedCrimeType,
        category: selectedCrimeCategory
      }
    });

    setFilteredData(filtered);
  }, [selectedStation, selectedCrimeType, selectedCrimeCategory, data]);

  const onSourceLayerPress = (e: { features: Feature[] }) => {
    console.log('Layer pressed:', e.features);
  };

  if (!isMapReady) {
    console.log('Map not ready yet');
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView 
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v11"
        attributionEnabled={false}
        logoEnabled={false}
        onDidFinishLoadingMap={() => {
          console.log('Map finished loading');
          setIsMapReady(true);
        }}
      >
        <Mapbox.Camera
          zoomLevel={11}
          centerCoordinate={[120.9842, 14.5995]}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {isMapReady && filteredData.features.length > 0 && (
          <Mapbox.ShapeSource
            id="crimeSource"
            shape={filteredData}
            cluster
            clusterRadius={75}
          >
            <Mapbox.CircleLayer
              id="clusters"
              filter={['has', 'point_count']}
              style={{
                circleColor: [
                  'step',
                  ['get', 'point_count'],
                  '#ff9999', // 1-20 crimes
                  20,
                  '#ff6666', // 21-50 crimes
                  50,
                  '#ff3333', // 51-100 crimes
                  100,
                  '#ff0000'  // 100+ crimes
                ],
                circleRadius: [
                  'step',
                  ['get', 'point_count'],
                  20, // Base size
                  20,
                  30, // Medium size
                  50,
                  40, // Large size
                  100,
                  50  // Extra large size
                ],
                circleOpacity: 0.85,
                circleStrokeWidth: 2,
                circleStrokeColor: '#ffffff',
                circleStrokeOpacity: 1
              }}
            />

            <Mapbox.SymbolLayer
              id="cluster-count"
              filter={['has', 'point_count']}
              style={{
                textField: '{point_count}',
                textSize: 14,
                textColor: '#ffffff',
                textIgnorePlacement: true,
                textAllowOverlap: true,
                textOffset: [0, 0]
              }}
            />

            <Mapbox.CircleLayer
              id="unclusteredPoints"
              filter={['!', ['has', 'point_count']]}
              style={{
                circleColor: [
                  'case',
                  ['get', 'isIndexCrime'], 
                  '#ff3333',  // Red for index crimes
                  '#ff9933'   // Orange for non-index crimes
                ],
                circleRadius: 8,
                circleStrokeWidth: 2,
                circleStrokeColor: '#ffffff',
                circleOpacity: 0.8,
                circleStrokeOpacity: 1
              }}
            />

            <Mapbox.SymbolLayer
              id="unclustered-point-labels"
              filter={['!', ['has', 'point_count']]}
              style={{
                textField: '{count}',
                textSize: 12,
                textColor: '#ffffff',
                textIgnorePlacement: true,
                textAllowOverlap: true,
                textOffset: [0, 0]
              }}
            />
          </Mapbox.ShapeSource>
        )}
      </Mapbox.MapView>
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