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

router.get('/history', async (req, res) => {
  try {
    // This finds journeys where status is 'COMPLETED'
    const history = await Journey.find({ status: 'COMPLETED' })
      .sort({ createdAt: -1 }); // Newest first

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// DELETE a specific journey
router.delete('/:id', async (req, res) => {
  try {
    const deletedJourney = await Journey.findByIdAndDelete(req.params.id);
    if (!deletedJourney) {
      return res.status(404).json({ error: 'Journey not found' });
    }
    res.json({ message: 'Journey deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete journey' });
  }
});

router.post('/book', async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ error: 'Source and Destination are required' });
    }

    const graph = await buildGraph();
    const path = await dijkstra(from, to); 

    if (!path || path.length === 0) {
      return res.status(404).json({ error: 'No route found' });
    }

    // 1️⃣ Get basic display segments (splits by line)
    const displaySegments = await formatPathByLine(path);

    // 2️⃣ 🟢 CALCULATE FARE PER SEGMENT
    // We map through each segment and add a 'segmentFare' property
    const segmentsWithFares = displaySegments.map(segment => {
      // stationCount is the number of hops in this specific line segment
      const stationCount = segment.stations.length - 1; 
      return {
        ...segment,
        segmentFare: stationCount * 5 // Example: ₹5 per station
      };
    });

    // 3️⃣ Calculate totals for the summary section
    const totalStations = path.length - 1;
    const totalFare = totalStations * 5; 
    const totalTime = totalStations * 2; 

    const journey = await Journey.create({
      from, to, path,
      totalFare,
      totalTime,
      status: 'BOOKED'
    });

    const qrSegments = await buildSegments(path, journey._id);
    if (qrSegments && qrSegments.length > 0) {
        await QRSegment.insertMany(qrSegments);
    }

    // 4️⃣ Send CLEAN data including individual segment fares
    res.json({
      journeyId: journey._id,
      route: segmentsWithFares, // Frontend will loop this to show each fare
      totalFare,
      totalTime
    });

  } catch (err) {
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
