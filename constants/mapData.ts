import { FeatureCollection, Point } from 'geojson';

// Mapbox access token
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWl2cnlsbGUiLCJhIjoiY21iZW1za2V5MmlmODJqcHRwdW9reDZuYyJ9.0qvHb-7JmG3oTyWMV7BrSg';

// Define types for the rates data
export type StationName = 
  | 'MPD Station 1 - Raxabago'
  | 'MPD Station 2 - Tondo'
  | 'MPD Station 3 - Sta Cruz'
  | 'MPD Station 4 - Sampaloc'
  | 'MPD Station 5 - Ermita'
  | 'MPD Station 6 - Sta Ana'
  | 'MPD Station 7 - J. A. Santos'
  | 'MPD Station 8 - Sta. Mesa'
  | 'MPD Station 9 - Malate'
  | 'MPD Station 10 - Pandacan'
  | 'MPD Station 11 - Meisic'
  | 'MPD Station 12 - Delpan'
  | 'MPD Station 13 - Baseco'
  | 'MPD Station 14 - Barbosa';

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
  'MPD Station 1 - Raxabago': { indexRate: 10.74, nonIndexRate: 67.95 },
  'MPD Station 2 - Tondo': { indexRate: 3.48, nonIndexRate: 50.69 },
  'MPD Station 3 - Sta Cruz': { indexRate: 10.67, nonIndexRate: 50.43 },
  'MPD Station 4 - Sampaloc': { indexRate: 7.00, nonIndexRate: 36.76 },
  'MPD Station 5 - Ermita': { indexRate: 17.04, nonIndexRate: 46.07 },
  'MPD Station 6 - Sta Ana': { indexRate: 6.30, nonIndexRate: 33.39 },
  'MPD Station 7 - J. A. Santos': { indexRate: 4.98, nonIndexRate: 38.41 },
  'MPD Station 8 - Sta. Mesa': { indexRate: 4.69, nonIndexRate: 18.82 },
  'MPD Station 9 - Malate': { indexRate: 4.62, nonIndexRate: 21.84 },
  'MPD Station 10 - Pandacan': { indexRate: 3.26, nonIndexRate: 16.93 },
  'MPD Station 11 - Meisic': { indexRate: 3.04, nonIndexRate: 46.80 },
  'MPD Station 12 - Delpan': { indexRate: 4.65, nonIndexRate: 23.64 },
  'MPD Station 13 - Baseco': { indexRate: 2.82, nonIndexRate: 25.44 },
  'MPD Station 14 - Barbosa': { indexRate: 4.51, nonIndexRate: 28.70 }
};

// Total crime counts for each station
export const totalCrime: TotalCrime = {
  'MPD Station 1 - Raxabago': { totalCrime: 2147 },
  'MPD Station 2 - Tondo': { totalCrime: 1478 },
  'MPD Station 3 - Sta Cruz': { totalCrime: 1294 },
  'MPD Station 4 - Sampaloc': { totalCrime: 1448 },
  'MPD Station 5 - Ermita': { totalCrime: 1083 },
  'MPD Station 6 - Sta Ana': { totalCrime: 1184 },
  'MPD Station 7 - J. A. Santos': { totalCrime: 644 },
  'MPD Station 8 - Sta. Mesa': { totalCrime: 724 },
  'MPD Station 9 - Malate': { totalCrime: 588 },
  'MPD Station 10 - Pandacan': { totalCrime: 1366 },
  'MPD Station 11 - Meisic': { totalCrime: 728 },
  'MPD Station 12 - Delpan': { totalCrime: 690 },
  'MPD Station 13 - Baseco': { totalCrime: 771 },
  'MPD Station 14 - Barbosa': { totalCrime: 906 }
};

// Function to create total crime data for map display
export const createTotalCrimeData = (): FeatureCollection<Point> => {
  const stationCoordinates: { [key in StationName]: [number, number] } = {
    'MPD Station 1 - Raxabago': [120.96797525882722, 14.621037543847635],
    'MPD Station 2 - Tondo': [120.96688091754915, 14.608600275384974],
    'MPD Station 3 - Sta Cruz': [120.98540961742403, 14.617274254344],
    'MPD Station 4 - Sampaloc': [121.00235581398012, 14.606285080096086],
    'MPD Station 5 - Ermita': [120.97341477870943, 14.582103848818486],
    'MPD Station 6 - Sta Ana': [121.01204931735994, 14.582451686991714],
    'MPD Station 7 - J. A. Santos': [120.9828293323517, 14.624458188294804],
    'MPD Station 8 - Sta. Mesa': [121.0121887922287, 14.60219449609711],
    'MPD Station 9 - Malate': [120.98790407180788, 14.563267851371528],
    'MPD Station 10 - Pandacan': [121.00356280803682, 14.59315133610341],
    'MPD Station 11 - Meisic': [120.97320556640626, 14.604338428418819],
    'MPD Station 12 - Delpan': [120.9644937515259, 14.599858468564348],
    'MPD Station 13 - Baseco': [120.9613072872162, 14.591323970460065],
    'MPD Station 14 - Barbosa': [120.98472833633424, 14.59871640162997]
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
    'MPD Station 1 - Raxabago': [120.96797525882722, 14.621037543847635],
    'MPD Station 2 - Tondo': [120.96688091754915, 14.608600275384974],
    'MPD Station 3 - Sta Cruz': [120.98540961742403, 14.617274254344],
    'MPD Station 4 - Sampaloc': [121.00235581398012, 14.606285080096086],
    'MPD Station 5 - Ermita': [120.97341477870943, 14.582103848818486],
    'MPD Station 6 - Sta Ana': [121.01204931735994, 14.582451686991714],
    'MPD Station 7 - J. A. Santos': [120.9828293323517, 14.624458188294804],
    'MPD Station 8 - Sta. Mesa': [121.0121887922287, 14.60219449609711],
    'MPD Station 9 - Malate': [120.98790407180788, 14.563267851371528],
    'MPD Station 10 - Pandacan': [121.00356280803682, 14.59315133610341],
    'MPD Station 11 - Meisic': [120.97320556640626, 14.604338428418819],
    'MPD Station 12 - Delpan': [120.9644937515259, 14.599858468564348],
    'MPD Station 13 - Baseco': [120.9613072872162, 14.591323970460065],
    'MPD Station 14 - Barbosa': [120.98472833633424, 14.59871640162997]
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 1 - Raxabago',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 2 - Tondo',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 3 - Sta Cruz',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 4 - Sampaloc',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 5 - Ermita',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 6 - Sta Ana',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 7 - J. A. Santos',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 8 - Sta. Mesa',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 9 - Malate',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 10 - Pandacan',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 11 - Meisic',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 12 - Delpan',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 13 - Baseco',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
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
        station: 'MPD Station 14 - Barbosa',
        crimeType: 'Non-Index Crime',
        count: 783,
        isIndexCrime: false
      }
    },
    // Add your actual crime data points here
  ]
}; 