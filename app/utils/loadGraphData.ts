export async function loadGraphData() {
  console.log('loadGraphData called');
  try {
    // Online URLs for graph data
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

    return {
      graphNodes: filteredGraphNodes,
      graphEdges,
    };
  } catch (e) {
    console.log('loadGraphData error', e);
    throw e;
  }
}