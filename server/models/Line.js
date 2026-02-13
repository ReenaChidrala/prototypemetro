// models/Line.js
const mongoose = require('mongoose');

const lineSchema = new mongoose.Schema({
  name: { type: String, required: true },   // Display name
  code: { type: String, required: true, unique: true }, // L1, L2A, L4
  start: { type: String },
  end: { type: String },
  stations: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Line', lineSchema);
