const express = require('express');
const router = express.Router();

const Journey = require('../models/Journey');
const QRSegment = require('../models/QRSegment');
const buildGraph = require('../utils/buildGraph');
const dijkstra = require('../utils/dijkstra');
const buildSegments = require('../utils/buildSegments');
const formatPathByLine = require('../utils/formatPathByLine');


/* =========================
   BOOK JOURNEY + CREATE QRs
========================= */



router.get('/test', (req, res) => {
  res.send('Journey route working');
});

router.post('/book', async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'Source and Destination are required' });
    }

    // 1️⃣ Build graph (Already has await, good)
    const graph = await buildGraph();

    // 2️⃣ Find full path - ADDED await here
    // If your dijkstra.js is async, it MUST have await
    const path = await dijkstra(from, to); 

    if (!path || path.length === 0) {
      return res.status(404).json({ error: 'No route found' });
    }

    // 3️⃣ Save journey - path is now a real array of strings
    const journey = await Journey.create({
      from,
      to,
      path,
      status: 'BOOKED'
    });

    // 4️⃣ Build QR segments - ADDED await here
    const qrSegments = await buildSegments(path, journey._id);
    if (qrSegments && qrSegments.length > 0) {
        await QRSegment.insertMany(qrSegments);
    }

    // 5️⃣ Format for Frontend - ADDED await here
    const displaySegments = await formatPathByLine(path);

    // 6️⃣ Send CLEAN data to frontend
    res.json({
      journeyId: journey._id,
      route: displaySegments
    });

  } catch (err) {
    // Better error logging to see exactly where it fails
    console.error('Booking failed:', err.message);
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});



/* =========================
   SCAN QR (ONE TIME ONLY)
========================= */
router.post('/scan', async (req, res) => {
  const { token } = req.body;

  const seg = await QRSegment.findOne({ token });
  if (!seg) {
    return res.status(400).json({ error: 'Invalid QR' });
  }

  // ❌ Already scanned
  if (seg.scanned) {
    return res.status(400).json({ error: 'QR already used' });
  }

  // 🔒 Sequence check
  if (seg.segmentOrder > 0) {
    const prev = await QRSegment.findOne({
      journeyId: seg.journeyId,
      segmentOrder: seg.segmentOrder - 1
    });

    if (!prev || !prev.scanned) {
      return res.status(403).json({
        error: 'Previous QR not scanned'
      });
    }
  }

  // ✅ Mark scanned
  seg.scanned = true;
  seg.scannedAt = new Date();
  await seg.save();

  // Update journey status
  await Journey.updateOne(
    { _id: seg.journeyId },
    { status: 'IN_PROGRESS' }
  );

  const total = await QRSegment.countDocuments({
    journeyId: seg.journeyId
  });

  if (seg.segmentOrder === total - 1) {
    await Journey.updateOne(
      { _id: seg.journeyId },
      { status: 'COMPLETED' }
    );
  }

  res.json({
    success: true,
    type: seg.type
  });
});

/* =========================
   GET JOURNEY DETAILS
========================= */
router.get('/:journeyId', async (req, res) => {
  const journey = await Journey.findById(req.params.journeyId);
  if (!journey) {
    return res.status(404).json({ error: 'Journey not found' });
  }

  const segments = await QRSegment.find({
    journeyId: journey._id
  }).sort({ segmentOrder: 1 });

  res.json({
    journeyId: journey._id,
    status: journey.status,
    path: journey.path,
    segments
  });
});

module.exports = router;
