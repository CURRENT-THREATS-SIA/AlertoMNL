export function findNearestNode(lat: number, lng: number, nodes: { id: string, lat: number, lng: number }[]): string | null {
  let minDist = Infinity;
  let nearest: string | null = null;
  for (const node of nodes) {
    const dist = Math.sqrt(
      Math.pow(node.lat - lat, 2) + Math.pow(node.lng - lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = node.id;
    }
  }
  return nearest;
}
