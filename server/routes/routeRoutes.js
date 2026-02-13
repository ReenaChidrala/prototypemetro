const express = require('express');
const router = express.Router();

const buildGraph = require('../utils/buildGraph');
const dijkstra = require('../utils/dijkstra');

router.get('/', (req, res) => {
  res.json({ message: "Route API is working ✅" });
});

router.post('/', async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to required' });
    }

    const graph = await buildGraph();
    const path = dijkstra(graph, from, to);

    if (!path || path.length === 0) {
      return res.status(404).json({ error: 'No route found' });
    }

    res.json({
      from,
      to,
      totalStations: path.length,
      path
    });

  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ error: 'Route calculation failed' });
  }
});

module.exports = router;
