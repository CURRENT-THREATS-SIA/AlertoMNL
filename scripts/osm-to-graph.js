const fs = require('fs');
const xml2js = require('xml2js');

const OSM_PATH = 'C:\\Users\\Raul\\Downloads\\planet_120.949,14.573_121.031,14.628.xml\\planet_120.949,14.573_121.031,14.628.xml'; // Update if needed

const parser = new xml2js.Parser();

fs.readFile(OSM_PATH, (err, data) => {
  if (err) throw err;
  parser.parseString(data, (err, result) => {
    if (err) throw err;

    const nodes = {};
    const graphNodes = [];
    const graphEdges = {};

    // Extract nodes
    (result.osm.node || []).forEach(n => {
      const id = n.$.id;
      const lat = parseFloat(n.$.lat);
      const lng = parseFloat(n.$.lon);
      nodes[id] = { id, lat, lng };
      graphNodes.push({ id, lat, lng });
    });

    // Extract edges from ways (only highways)
    (result.osm.way || []).forEach(w => {
      if (!w.nd || !w.tag) return;
      const isRoad = w.tag.some(t => t.$.k === 'highway');
      if (!isRoad) return;

      for (let i = 1; i < w.nd.length; i++) {
        const from = w.nd[i - 1].$.ref;
        const to = w.nd[i].$.ref;
        if (!nodes[from] || !nodes[to]) continue;
        if (!graphEdges[from]) graphEdges[from] = [];
        if (!graphEdges[to]) graphEdges[to] = [];
        const dist = Math.sqrt(
          Math.pow(nodes[from].lat - nodes[to].lat, 2) +
          Math.pow(nodes[from].lng - nodes[to].lng, 2)
        );
        graphEdges[from].push({ node: to, weight: dist });
        graphEdges[to].push({ node: from, weight: dist }); // bidirectional
      }
    });

    fs.writeFileSync('graphNodes.json', JSON.stringify(graphNodes, null, 2));
    fs.writeFileSync('graphEdges.json', JSON.stringify(graphEdges, null, 2));
    console.log('Done! graphNodes.json and graphEdges.json created.');
  });
});