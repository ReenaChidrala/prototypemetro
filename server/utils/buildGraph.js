const Station = require('../models/Station');
const Line = require('../models/Line');

async function buildGraph() {
  const graph = {};

  const stations = await Station.find({});
  const lines = await Line.find({});

  // 1️⃣ Create nodes
  stations.forEach(s => {
    graph[s.name] = [];
  });

  // 2️⃣ Line connections (bidirectional)
  lines.forEach(line => {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const a = line.stations[i];
      const b = line.stations[i + 1];

      if (graph[a] && graph[b]) {
        graph[a].push({ node: b, weight: 1 });
        graph[b].push({ node: a, weight: 1 });
      }
    }
  });

  // 3️⃣ Interchange connections (bidirectional)
  stations.forEach(s => {
    s.interchanges.forEach(i => {
      if (graph[s.name] && graph[i]) {
        graph[s.name].push({ node: i, weight: 1 });
        graph[i].push({ node: s.name, weight: 1 });
      }
    });
  });

  return graph;
}

module.exports = buildGraph;
