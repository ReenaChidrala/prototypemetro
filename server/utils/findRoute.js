function bfs(graph, start, end) {
  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === end) return path;

    for (const n of graph[node] || []) {
      if (!visited.has(n.node)) {
        visited.add(n.node);
        queue.push([...path, n.node]);
      }
    }
  }
  return null;
}

module.exports = bfs;
