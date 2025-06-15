// Dijkstra's algorithm for adjacency list graph
// graphEdges: { [nodeId: string]: { node: string, weight: number }[] }
// start: string (node id)
// end: string (node id)
// Returns: { path: string[], distance: number }

export type Edge = { node: string; weight: number };
export type GraphEdges = { [nodeId: string]: Edge[] };
export type DijkstraResult = { path: string[]; distance: number };

export function multidirectionalDijkstra(
  graphEdges: GraphEdges,
  start: string,
  end: string
): DijkstraResult {
  const distances: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const queue: { node: string; dist: number }[] = [];

  for (const node in graphEdges) {
    distances[node] = Infinity;
    prev[node] = null;
  }
  distances[start] = 0;
  queue.push({ node: start, dist: 0 });

  while (queue.length > 0) {
    // Get node with smallest distance
    queue.sort((a, b) => a.dist - b.dist);
    const { node: current } = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    if (current === end) break;
    const neighbors = graphEdges[current] || [];
    for (const { node: neighbor, weight } of neighbors) {
      const alt = distances[current] + weight;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        prev[neighbor] = current;
        queue.push({ node: neighbor, dist: alt });
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let u: string | null = end;
  if (prev[u] !== null || u === start) {
    while (u) {
      path.unshift(u);
      u = prev[u];
    }
  }
  return { path, distance: distances[end] };
}
