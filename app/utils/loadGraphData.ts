import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
const GRAPH_NODES_CACHE_KEY = 'cached_graph_nodes';
const GRAPH_EDGES_CACHE_KEY = 'cached_graph_edges';
const CACHE_TIMESTAMP_KEY = 'graph_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function loadGraphData() {
  console.log('loadGraphData called');
  
  try {
    // Check cache first
    const cachedTimestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();
    
    if (cachedTimestamp && (now - parseInt(cachedTimestamp)) < CACHE_DURATION) {
      console.log('Loading graph data from cache...');
      const [cachedNodes, cachedEdges] = await Promise.all([
        AsyncStorage.getItem(GRAPH_NODES_CACHE_KEY),
        AsyncStorage.getItem(GRAPH_EDGES_CACHE_KEY)
      ]);
      
      if (cachedNodes && cachedEdges) {
        const graphNodes = JSON.parse(cachedNodes);
        const graphEdges = JSON.parse(cachedEdges);
        
        // Filter graphNodes to only those present in graphEdges
        const filteredGraphNodes = graphNodes.filter((node: { id: string }) => graphEdges.hasOwnProperty(node.id));
        console.log('Loaded from cache - Filtered graphNodes count:', filteredGraphNodes.length);
        
        return {
          graphNodes: filteredGraphNodes,
          graphEdges,
        };
      }
    }

    // Cache miss or expired, fetch from online
    console.log('Fetching graph data from online sources...');
    const nodesUrl = 'https://drive.google.com/uc?export=download&id=1-eNNWnCwlSm0gG1deFPTyR726NWDAHWS';
    const edgesUrl = 'https://drive.google.com/uc?export=download&id=1DoXz1PTDVtiKyl0_DzRGCdCv2T_SklxD';

    const [nodesResponse, edgesResponse] = await Promise.all([
      fetch(nodesUrl),
      fetch(edgesUrl)
    ]);

    if (!nodesResponse.ok || !edgesResponse.ok) {
      throw new Error('Failed to fetch graph data from online sources.');
    }

    const nodesString = await nodesResponse.text();
    const edgesString = await edgesResponse.text();

    // Debug: log the first 200 chars
    console.log('nodesString:', nodesString.slice(0, 200));
    console.log('edgesString:', edgesString.slice(0, 200));

    let graphNodes, graphEdges;
    try {
      graphEdges = JSON.parse(nodesString); // nodesString is actually the adjacency list
    } catch (e) {
      throw new Error('Failed to parse graphEdges: ' + (e instanceof Error ? e.message : e));
    }
    try {
      graphNodes = JSON.parse(edgesString); // edgesString is actually the array of nodes
    } catch (e) {
      throw new Error('Failed to parse graphNodes: ' + (e instanceof Error ? e.message : e));
    }

    // Filter graphNodes to only those present in graphEdges
    const filteredGraphNodes = graphNodes.filter((node: { id: string }) => graphEdges.hasOwnProperty(node.id));
    console.log('Filtered graphNodes count:', filteredGraphNodes.length);

    // Cache the data
    await Promise.all([
      AsyncStorage.setItem(GRAPH_NODES_CACHE_KEY, JSON.stringify(filteredGraphNodes)),
      AsyncStorage.setItem(GRAPH_EDGES_CACHE_KEY, JSON.stringify(graphEdges)),
      AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString())
    ]);

    return {
      graphNodes: filteredGraphNodes,
      graphEdges,
    };
  } catch (e) {
    console.log('loadGraphData error', e);
    throw e;
  }
}