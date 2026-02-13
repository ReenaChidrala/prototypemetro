const Station = require('../models/Station');

async function dijkstra(start, end) {
  const stations = await Station.find();
  const graph = {};

 // ... inside dijkstra function ...

  stations.forEach(s => {
    graph[s.name] = graph[s.name] || []; 
    
    stations.forEach(n => {
      // Logic: If they are on the same line and orders are adjacent, they are connected
      if (n.line === s.line && Math.abs(n.order - s.order) === 1) {
        if (!graph[s.name].includes(n.name)) {
          graph[s.name].push(n.name);
        }
      }
    });

    // Logic: Interchanges are explicit connections
    // Ensure your JSON has the EXACT name of the target station
    if (s.interchanges && Array.isArray(s.interchanges)) {
      s.interchanges.forEach(interchangeStationName => {
        if (interchangeStationName && !graph[s.name].includes(interchangeStationName)) {
          graph[s.name].push(interchangeStationName);
        }
      });
    }
  });

// ... rest of your dijkstra logic ...

  const dist = {}, prev = {}, visited = new Set();
  Object.keys(graph).forEach(v => dist[v] = Infinity);
  
  if (!graph[start]) return []; // Safety check
  dist[start] = 0;

  while (true) {
    let u = null;
    for (let v in dist) {
      if (!visited.has(v) && (u === null || dist[v] < dist[u])) u = v;
    }

    if (!u || u === end || dist[u] === Infinity) break;
    visited.add(u);

    // FIX: Add safety check for graph[u]
    const neighbors = graph[u] || [];
    neighbors.forEach(n => {
      let alt = dist[u] + 1;
      if (alt < dist[n]) {
        dist[n] = alt;
        prev[n] = u;
      }
    });
  }

  const path = [];
  let cur = end;
  while (cur) { 
    path.unshift(cur); 
    cur = prev[cur]; 
  }
  return path[0] === start ? path : [];
}

module.exports = dijkstra;