const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  line: { type: String, required: true },
  order: { type: Number, required: true },
  interchanges: [String], // Must be an array of strings
  createdAt: { type: Date, default: Date.now }
});

// Important: Indexing helps performance and ensures the seeder filters correctly
// ✅ CORRECT: This allows "Dahisar East" on L7 and "Dahisar East" on L2A
stationSchema.index({ name: 1, line: 1 }, { unique: true });

module.exports = mongoose.model('Station', stationSchema);