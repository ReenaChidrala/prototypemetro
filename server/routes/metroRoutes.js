// server/routes/metroRoutes.js
const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const Line = require('../models/Line');

/* ====================
   GET ROUTES
==================== */

// Get all stations
// server/routes/metroRoutes.js

// Get all stations
router.get('/stations', async (req, res) => {
  try {
    const { query } = req.query;

    // If there IS a query, filter in DB
    if (query) {
      const stations = await Station.find({
        name: { $regex: query, $options: "i" }
      }).limit(10);
      return res.json(stations);
    }

    // If there is NO query, return ALL stations
    const stations = await Station.find({}); 
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stations" });
  }
});

// Get all lines
router.get('/lines', async (req, res) => {
  try {
    const lines = await Line.find({});
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lines' });
  }
});

/* ====================
   POST ROUTES
==================== */

// Add a new station
// Add a new station
router.post('/stations', async (req, res) => {
  try {
    const { name, line, interchanges = [] } = req.body;
    if (!name || !line) {
      return res.status(400).json({ error: 'Station name and line are required' });
    }

    // Create station
    const station = await Station.create({
      name,
      line,            // line = code (L1, L4)
      interchanges
    });

    // Update or create line (USING CODE)
    let ln = await Line.findOne({ code: line });
    if (!ln) {
      ln = await Line.create({
        code: line,
        name: line,      // or full display name if you have it
        stations: [name]
      });
    } else if (!ln.stations.includes(name)) {
      ln.stations.push(name);
      await ln.save();
    }

    res.status(201).json({ message: 'Station added', station });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Station already exists in this line' });
    }
    res.status(500).json({ error: 'Failed to add station', details: err.message });
  }
});


// Add a new line
router.post('/lines', async (req, res) => {
  try {
    const { code, name, stations = [] } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Line code and name required' });
    }

    const line = await Line.create({ code, name, stations });

    for (const s of stations) {
      await Station.updateOne(
        { name: s, line: code },
        { $setOnInsert: { name: s, line: code, interchanges: [] } },
        { upsert: true }
      );
    }

    res.status(201).json({ message: 'Line added', line });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Line already exists' });
    }
    res.status(500).json({ error: 'Failed to add line', details: err.message });
  }
});


module.exports = router;
