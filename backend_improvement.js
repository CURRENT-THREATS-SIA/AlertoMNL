// Improved backend implementation to handle close coordinates

// Improved findNearestNode function to handle close coordinates
function findNearestNode(lat, lng, nodes, excludeNodeId = null) {
  let minDist = Infinity;
  let nearest = null;
  
  for (const node of nodes) {
    // Skip the excluded node if specified
    if (excludeNodeId && node.id === excludeNodeId) {
      continue;
    }
    
    const dist = haversine(node.lat, node.lng, lat, lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = node.id;
    }
  }
  return nearest;
}

// Modified route calculation logic
app.post('/calculate_route', async (req, res) => {
  if (!graphNodes || !graphEdges) {
    return res.status(503).json({ success: false, error: 'Graph data not loaded yet.' });
  }
  
  const { start, end } = req.body;
  
  // Find the nearest node for start
  const startNode = findNearestNode(start.lat, start.lng, graphNodes);
  
  // Find the nearest node for end, excluding the start node if they're very close
  const endNode = findNearestNode(end.lat, end.lng, graphNodes, startNode);

  console.log('Start coordinates:', start);
  console.log('End coordinates:', end);
  console.log('Start node:', startNode);
  console.log('End node:', endNode);

  if (!startNode || !endNode) {
    console.log('No nearby node found for start or end.');
    return res.json({ success: false, error: 'No nearby node found.' });
  }

  // If start and end nodes are the same, try to find a different end node
  if (startNode === endNode) {
    console.log('Start and end nodes are the same, trying to find alternative end node...');
    
    // Find the second closest node for the end point
    let secondNearest = null;
    let secondMinDist = Infinity;
    
    for (const node of graphNodes) {
      if (node.id === startNode) continue; // Skip the start node
      
      const dist = haversine(node.lat, node.lng, end.lat, end.lng);
      if (dist < secondMinDist) {
        secondMinDist = dist;
        secondNearest = node.id;
      }
    }
    
    if (secondNearest) {
      console.log('Using alternative end node:', secondNearest);
      const endNode = secondNearest;
    } else {
      console.log('No alternative end node found, coordinates are too close.');
      return res.json({ 
        success: false, 
        error: 'Start and end locations are too close together to calculate a meaningful route.' 
      });
    }
  }

  const result = dijkstra(graphEdges, startNode, endNode);

  console.log('Dijkstra result:', result);

  if (!result.path || result.path.length <= 1) {
    console.log('No valid route found by Dijkstra.');
    return res.json({ success: false, error: 'No route found.' });
  }
  
  // Convert node IDs to lat/lng
  const coords = result.path.map(id => {
    const node = graphNodes.find(n => n.id === id);
    return node ? { lat: node.lat, lng: node.lng } : null;
  }).filter(Boolean);

  console.log('Route coordinates:', coords.length);

  res.json({ success: true, route: coords });
}); 