import { FeatureCollection, Point } from 'geojson';

// Mapbox access token
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWl2cnlsbGUiLCJhIjoiY21iZW1za2V5MmlmODJqcHRwdW9reDZuYyJ9.0qvHb-7JmG3oTyWMV7BrSg';

// Define types for the rates data
export type StationName = 
  | 'Station 1'
  | 'Station 2'
  | 'Station 3'
  | 'Station 4'
  | 'Station 5'
  | 'Station 6'
  | 'Station 7'
  | 'Station 8'
  | 'Station 9'
  | 'Station 10'
  | 'Station 11'
  | 'Station 12'
  | 'Station 13'
  | 'Station 14';

export interface StationRates {
  indexRate: number;
  nonIndexRate: number;
}

export type TotalRates = {
  [key in StationName]: StationRates;
};

// Define TotalCrime type
export interface StationTotalCrime {
  totalCrime: number;
}

export type TotalCrime = {
  [key in StationName]: StationTotalCrime;
};

// Total crime rates
export const totalRates: TotalRates = {
  'Station 1': { indexRate: 10.74, nonIndexRate: 67.95 },
  'Station 2': { indexRate: 3.48, nonIndexRate: 50.69 },
  'Station 3': { indexRate: 10.67, nonIndexRate: 50.43 },
  'Station 4': { indexRate: 7.00, nonIndexRate: 36.76 },
  'Station 5': { indexRate: 17.04, nonIndexRate: 46.07 },
  'Station 6': { indexRate: 6.30, nonIndexRate: 33.39 },
  'Station 7': { indexRate: 4.98, nonIndexRate: 38.41 },
  'Station 8': { indexRate: 4.69, nonIndexRate: 18.82 },
  'Station 9': { indexRate: 4.62, nonIndexRate: 21.84 },
  'Station 10': { indexRate: 3.26, nonIndexRate: 16.93 },
  'Station 11': { indexRate: 3.04, nonIndexRate: 46.80 },
  'Station 12': { indexRate: 4.65, nonIndexRate: 23.64 },
  'Station 13': { indexRate: 2.82, nonIndexRate: 25.44 },
  'Station 14': { indexRate: 4.51, nonIndexRate: 28.70 }
};

// Total crime counts for each station
export const totalCrime: TotalCrime = {
  'Station 1': { totalCrime: 2147 },
  'Station 2': { totalCrime: 1478 },
  'Station 3': { totalCrime: 1294 },
  'Station 4': { totalCrime: 1448 },
  'Station 5': { totalCrime: 1083 },
  'Station 6': { totalCrime: 1184 },
  'Station 7': { totalCrime: 644 },
  'Station 8': { totalCrime: 724 },
  'Station 9': { totalCrime: 588 },
  'Station 10': { totalCrime: 1366 },
  'Station 11': { totalCrime: 728 },
  'Station 12': { totalCrime: 690 },
  'Station 13': { totalCrime: 771 },
  'Station 14': { totalCrime: 906 }
};

// Function to create total crime data for map display
export const createTotalCrimeData = (): FeatureCollection<Point> => {
  const stationCoordinates: { [key in StationName]: [number, number] } = {
    'Station 1': [120.96797525882722, 14.621037543847635],
    'Station 2': [120.96688091754915, 14.608600275384974],
    'Station 3': [120.98540961742403, 14.617274254344],
    'Station 4': [121.00235581398012, 14.606285080096086],
    'Station 5': [120.97341477870943, 14.582103848818486],
    'Station 6': [121.01204931735994, 14.582451686991714],
    'Station 7': [120.9828293323517, 14.624458188294804],
    'Station 8': [121.0121887922287, 14.60219449609711],
    'Station 9': [120.98790407180788, 14.563267851371528],
    'Station 10': [121.00356280803682, 14.59315133610341],
    'Station 11': [120.97320556640626, 14.604338428418819],
    'Station 12': [120.9644937515259, 14.599858468564348],
    'Station 13': [120.9613072872162, 14.591323970460065],
    'Station 14': [120.98472833633424, 14.59871640162997]
  };

  const features = Object.entries(totalCrime).map(([stationName, crimeData]) => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: stationCoordinates[stationName as StationName]
    },
    properties: {
      station: stationName,
      crimeType: 'Total Crime',
      count: crimeData.totalCrime,
      isIndexCrime: false
    }
  }));

  return {
    type: 'FeatureCollection',
    features
  };
};

// Export the total crime data for map display
export const totalCrimeData = createTotalCrimeData();

// Function to create crime data for a specific crime type
export const createCrimeTypeData = (crimeType: string): FeatureCollection<Point> => {
  const stationCoordinates: { [key in StationName]: [number, number] } = {
    'Station 1': [120.96797525882722, 14.621037543847635],
    'Station 2': [120.96688091754915, 14.608600275384974],
    'Station 3': [120.98540961742403, 14.617274254344],
    'Station 4': [121.00235581398012, 14.606285080096086],
    'Station 5': [120.97341477870943, 14.582103848818486],
    'Station 6': [121.01204931735994, 14.582451686991714],
    'Station 7': [120.9828293323517, 14.624458188294804],
    'Station 8': [121.0121887922287, 14.60219449609711],
    'Station 9': [120.98790407180788, 14.563267851371528],
    'Station 10': [121.00356280803682, 14.59315133610341],
    'Station 11': [120.97320556640626, 14.604338428418819],
    'Station 12': [120.9644937515259, 14.599858468564348],
    'Station 13': [120.9613072872162, 14.591323970460065],
    'Station 14': [120.98472833633424, 14.59871640162997]
  };

  // Filter the original crime data for the specific crime type
  const features = crimeData.features.filter(feature => 
    feature.properties && feature.properties.crimeType === crimeType
  );

  return {
    type: 'FeatureCollection',
    features
  };
};

// Replace this with your actual crime data
export const crimeData: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Murder',
        count: 49,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Homicide',
        count: 6,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Physical Injury',
        count: 19,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Rape',
        count: 60,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Robbery',
        count: 35,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Theft',
        count: 88,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Carnapping MV',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Carnapping MC',
        count: 35,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96797525882722, 14.621037543847635]
      },
      properties: {
        station: 'Station 1',
        crimeType: 'Non-Index Crime',
        count: 1854,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Murder',
        count: 9,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Homicide',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Physical Injury',
        count: 12,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Rape',
        count: 24,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Robbery',
        count: 11,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Theft',
        count: 27,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Carnapping MV',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Carnapping MC',
        count: 9,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.96688091754915, 14.608600275384974]
      },
      properties: {
        station: 'Station 2',
        crimeType: 'Non-Index Crime',
        count: 1383,
        isIndexCrime: false
      }
    },
    
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Murder',
        count: 5,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Homicide',
        count: 13,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Physical Injury',
        count: 23,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Rape',
        count: 54,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Robbery',
        count: 36,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Theft',
        count: 136,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Carnapping MV',
        count: 4,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Carnapping MC',
        count: 19,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Complex Crime',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98540961742403, 14.617274254344]
      },
      properties: {
        station: 'Station 3',
        crimeType: 'Non-Index Crime',
        count: 1376,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Murder',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Homicide',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Physical Injury',
        count: 23,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Rape',
        count: 26,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Robbery',
        count: 25,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Theft',
        count: 80,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Carnapping MV',
        count: 7,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Carnapping MC',
        count: 25,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00235581398012, 14.606285080096086]
      },
      properties: {
        station: 'Station 4',
        crimeType: 'Non-Index Crime',
        count: 1003,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Murder',
        count: 13,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Homicide',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Physical Injury',
        count: 43,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Rape',
        count: 42,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Robbery',
        count: 82,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Theft',
        count: 231,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Carnapping MV',
        count: 17,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Carnapping MC',
        count: 32,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Complex Crime',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97341477870943, 14.582103848818486]
      },
      properties: {
        station: 'Station 5',
        crimeType: 'Non-Index Crime',
        count: 1257,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Murder',
        count: 9,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Homicide',
        count: 4,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Physical Injury',
        count: 28,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Rape',
        count: 27,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Robbery',
        count: 24,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Theft',
        count: 69,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Carnapping MV',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Carnapping MC',
        count: 7,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Complex Crime',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.01204931735994, 14.582451686991714]
      },
      properties: {
        station: 'Station 6',
        crimeType: 'Non-Index Crime',
        count: 911,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Murder',
        count: 17,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Homicide',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Physical Injury',
        count: 11,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Rape',
        count: 28,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Robbery',
        count: 16,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Theft',
        count: 49,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Carnapping MV',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Carnapping MC',
        count: 10,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9828293323517, 14.624458188294804]
      },
      properties: {
        station: 'Station 7',
        crimeType: 'Non-Index Crime',
        count: 1048,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Murder',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Homicide',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Physical Injury',
        count: 14,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Rape',
        count: 27,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Robbery',
        count: 18,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Theft',
        count: 62,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Carnapping MV',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Carnapping MC',
        count: 5,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.0121887922287, 14.60219449609711]
      },
      properties: {
        station: 'Station 8',
        crimeType: 'Non-Index Crime',
        count: 508,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Murder',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Homicide',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Physical Injury',
        count: 14,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Rape',
        count: 23,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Robbery',
        count: 25,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Theft',
        count: 42,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Carnapping MV',
        count: 5,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Carnapping MC',
        count: 13,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98790407180788, 14.563267851371528]
      },
      properties: {
        station: 'Station 9',
        crimeType: 'Non-Index Crime',
        count: 596,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Murder',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Homicide',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Physical Injury',
        count: 10,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Rape',
        count: 13,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Robbery',
        count: 16,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Theft',
        count: 36,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Carnapping MV',
        count: 1,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Carnapping MC',
        count: 10,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [121.00356280803682, 14.59315133610341]
      },
      properties: {
        station: 'Station 10',
        crimeType: 'Non-Index Crime',
        count: 462,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Murder',
        count: 4,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Homicide',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Physical Injury',
        count: 8,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Rape',
        count: 5,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Robbery',
        count: 9,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Theft',
        count: 48,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Carnapping MV',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Carnapping MC',
        count: 7,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.97320556640626, 14.604338428418819]
      },
      properties: {
        station: 'Station 11',
        crimeType: 'Non-Index Crime',
        count: 1277,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Murder',
        count: 12,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Homicide',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Physical Injury',
        count: 6,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Rape',
        count: 16,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Robbery',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Theft',
        count: 4,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Carnapping MV',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Carnapping MC',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9644937515259, 14.599858468564348]
      },
      properties: {
        station: 'Station 12',
        crimeType: 'Non-Index Crime',
        count: 645,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Murder',
        count: 19,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Homicide',
        count: 4,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Physical Injury',
        count: 6,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Rape',
        count: 35,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Robbery',
        count: 2,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Theft',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Carnapping MV',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Carnapping MC',
        count: 5,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.9613072872162, 14.591323970460065]
      },
      properties: {
        station: 'Station 13',
        crimeType: 'Non-Index Crime',
        count: 694,
        isIndexCrime: false
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Murder',
        count: 8,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Homicide',
        count: 4,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Physical Injury',
        count: 14,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Rape',
        count: 24,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Robbery',
        count: 23,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Theft',
        count: 35,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Carnapping MV',
        count: 3,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Carnapping MC',
        count: 13,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Complex Crime',
        count: 0,
        isIndexCrime: true
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [120.98472833633424, 14.59871640162997]
      },
      properties: {
        station: 'Station 14',
        crimeType: 'Non-Index Crime',
        count: 783,
        isIndexCrime: false
      }
    },
    // Add your actual crime data points here
  ]
}; 