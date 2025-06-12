import { Feature, Point, Position } from 'geojson';

interface DBSCANPoint {
  id: number;
  coordinates: Position;
  visited: boolean;
  noise: boolean;
  clusterId: number;
  properties: any;
}

export interface DBSCANCluster {
  centroid: Position;
  points: Feature<Point>[];
  properties: {
    point_count: number;
    cluster: boolean;
  };
}

function calculateDistance(point1: Position, point2: Position): number {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  
  // Convert coordinates to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  // Haversine formula
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth's radius in kilometers
  const R = 6371;
  return R * c;
}

function getNeighbors(
  point: DBSCANPoint,
  points: DBSCANPoint[],
  eps: number
): DBSCANPoint[] {
  return points.filter(
    (p) => calculateDistance(point.coordinates, p.coordinates) <= eps
  );
}

function calculateCentroid(points: DBSCANPoint[]): Position {
  const sum = points.reduce(
    (acc, point) => {
      acc[0] += point.coordinates[0];
      acc[1] += point.coordinates[1];
      return acc;
    },
    [0, 0]
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

export function dbscan(
  features: Feature<Point>[],
  eps: number = 0.5, // 0.5 km radius
  minPoints: number = 3
): DBSCANCluster[] {
  let clusterId = 0;
  const points: DBSCANPoint[] = features.map((feature, index) => ({
    id: index,
    coordinates: feature.geometry.coordinates,
    visited: false,
    noise: false,
    clusterId: -1,
    properties: feature.properties
  }));

  const clusters: Map<number, DBSCANPoint[]> = new Map();

  for (const point of points) {
    if (point.visited) continue;

    point.visited = true;
    const neighbors = getNeighbors(point, points, eps);

    if (neighbors.length < minPoints) {
      point.noise = true;
      continue;
    }

    clusterId++;
    point.clusterId = clusterId;
    clusters.set(clusterId, [point]);

    let neighborIndex = 0;
    while (neighborIndex < neighbors.length) {
      const neighbor = neighbors[neighborIndex];

      if (!neighbor.visited) {
        neighbor.visited = true;
        const neighborNeighbors = getNeighbors(neighbor, points, eps);

        if (neighborNeighbors.length >= minPoints) {
          neighbors.push(...neighborNeighbors.filter(
            (n) => !neighbors.includes(n)
          ));
        }
      }

      if (neighbor.clusterId === -1) {
        neighbor.clusterId = clusterId;
        clusters.get(clusterId)!.push(neighbor);
      }

      neighborIndex++;
    }
  }

  // Convert clusters to GeoJSON format
  return Array.from(clusters.values()).map((clusterPoints): DBSCANCluster => {
    const centroid = calculateCentroid(clusterPoints);
    
    return {
      centroid,
      points: clusterPoints.map((p) => features[p.id]),
      properties: {
        point_count: clusterPoints.length,
        cluster: true
      }
    };
  });
} 