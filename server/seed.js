require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Station = require('./models/Station');
const Line = require('./models/Line');

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI missing in .env');
  process.exit(1);
}

/* ======================
   LOAD JSON FILE
====================== */
function loadJson(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filename}`);
    return [];
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

/* ======================
   UPSERT LINE
====================== */
async function upsertLine(lineObj) {
  const filter = { code: lineObj.code || lineObj.name };
  const updateDoc = {
    name: lineObj.name,
    code: lineObj.code || lineObj.name,
    start: lineObj.start || '',
    end: lineObj.end || ''
  };

  await Line.updateOne(
    filter,
    { $set: updateDoc, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
}

/* ======================
   UPSERT STATION
====================== */
async function upsertStation(stObj) {
  // We use both name AND line as the filter to handle same-name stations on different lines
  const filter = { name: stObj.name, line: stObj.line };

  const update = {
    $set: {
      order: stObj.order || 0,
      interchanges: stObj.interchanges || [] // Array of station names
    },
    $setOnInsert: { createdAt: new Date() }
  };

  await Station.updateOne(filter, update, { upsert: true });
}

/* ======================
   MAIN SEED RUNNER
====================== */
async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    // 1️⃣ Seed Lines
    const lines = loadJson('lines.json');
    console.log('🔄 Processing lines...');
    for (const l of lines) {
      await upsertLine(l);
    }

    // 2️⃣ Seed Stations
    const stations = loadJson('stations.json');
    const distinctLineCodes = new Set();
    
    console.log('🔄 Processing stations...');
    for (const s of stations) {
      await upsertStation(s);
      distinctLineCodes.add(s.line);
    }

    // 3️⃣ Synchronize Station Lists in Lines (Crucial for Dijkstra/Frontend)
    // We do this once per line at the end for better performance
    console.log('🔄 Rebuilding line sequences...');
    for (const lineCode of distinctLineCodes) {
      const lineStations = await Station
        .find({ line: lineCode })
        .sort({ order: 1 })
        .select('name');

      const namesArray = lineStations.map(st => st.name);
      
      await Line.updateOne(
        { code: lineCode },
        { $set: { stations: namesArray } }
      );
      console.log(`✅ Line [${lineCode}] synced with ${namesArray.length} stations.`);
    }

    console.log('🎉 SEEDING COMPLETE');
  } catch (err) {
    console.error('❌ Seeder encountered an error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

/* ======================
   START
====================== */
run();