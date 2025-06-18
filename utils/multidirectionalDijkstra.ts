// Multidirectional Dijkstra's algorithm implementation in TypeScript

export type Edge = { node: string; weight: number };
export type Graph = { [key: string]: Edge[] };

type DijkstraResult = { path: string[]; distance: number } | null;

export function multidirectionalDijkstra(
  graph: Graph,
  start: string,
  end: string
): DijkstraResult {
  if (start === end) {
    return { path: [start], distance: 0 };
  }

  // Forward search
  const forwardVisited: Record<string, number> = { [start]: 0 };
  const forwardPrev: Record<string, string | null> = { [start]: null };
  const forwardQueue: { node: string; dist: number }[] = [{ node: start, dist: 0 }];

  // Backward search
  const backwardVisited: Record<string, number> = { [end]: 0 };
  const backwardPrev: Record<string, string | null> = { [end]: null };
  const backwardQueue: { node: string; dist: number }[] = [{ node: end, dist: 0 }];

  let meetingNode: string | null = null;
  let shortest = Infinity;

  while (forwardQueue.length > 0 && backwardQueue.length > 0) {
    // Forward step
    forwardQueue.sort((a, b) => a.dist - b.dist);
    const currentForward = forwardQueue.shift();
    if (!currentForward) break;
    const { node: fNode, dist: fDist } = currentForward;

    if (backwardVisited[fNode] !== undefined) {
      const totalDist = fDist + backwardVisited[fNode];
      if (totalDist < shortest) {
        shortest = totalDist;
        meetingNode = fNode;
      }
    }

    for (const edge of graph[fNode] || []) {
      const nextDist = fDist + edge.weight;
      if (forwardVisited[edge.node] === undefined || nextDist < forwardVisited[edge.node]) {
        forwardVisited[edge.node] = nextDist;
        forwardPrev[edge.node] = fNode;
        forwardQueue.push({ node: edge.node, dist: nextDist });
      }
    }

    // Backward step
    backwardQueue.sort((a, b) => a.dist - b.dist);
    const currentBackward = backwardQueue.shift();
    if (!currentBackward) break;
    const { node: bNode, dist: bDist } = currentBackward;

    if (forwardVisited[bNode] !== undefined) {
      const totalDist = bDist + forwardVisited[bNode];
      if (totalDist < shortest) {
        shortest = totalDist;
        meetingNode = bNode;
      }
    }

    for (const edge of graph[bNode] || []) {
      const nextDist = bDist + edge.weight;
      if (backwardVisited[edge.node] === undefined || nextDist < backwardVisited[edge.node]) {
        backwardVisited[edge.node] = nextDist;
        backwardPrev[edge.node] = bNode;
        backwardQueue.push({ node: edge.node, dist: nextDist });
      }
    }
  }

  if (!meetingNode) {
    return null;
  }

  // Reconstruct path
  const pathForward: string[] = [];
  let node: string | null = meetingNode;
  while (node && node !== start) {
    pathForward.push(node);
    node = forwardPrev[node];
  }
  if (node) pathForward.push(node);
  pathForward.reverse();

  const pathBackward: string[] = [];
  node = backwardPrev[meetingNode];
  while (node && node !== end) {
    pathBackward.push(node);
    node = backwardPrev[node];
  }
  if (node) pathBackward.push(node);

  const fullPath = [...pathForward, ...pathBackward];

  return {
    path: fullPath,
    distance: shortest,
  };
}
