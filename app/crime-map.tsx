import React from 'react';
import { Platform, View } from 'react-native';
import { CrimeMap } from '../components/CrimeMap';
import { WebCrimeMap } from '../components/WebCrimeMap';
import { crimeData } from '../constants/mapData';

interface CrimeMapPageProps {
  userType: 'regular' | 'police';
  selectedCrimeType?: string;
  selectedStation?: string;
}

type MapComponentType = typeof CrimeMap | typeof WebCrimeMap;

export default function CrimeMapPage({ userType, selectedCrimeType, selectedStation }: CrimeMapPageProps) {
  const MapComponent = Platform.select<MapComponentType>({
    web: WebCrimeMap,
    native: CrimeMap,
  })!;

  return (
    <View style={{ flex: 1 }}>
      <MapComponent 
        data={crimeData} 
        userType={userType} 
        selectedCrimeType={selectedCrimeType}
        selectedStation={selectedStation}
      />
    </View>
  );
} 