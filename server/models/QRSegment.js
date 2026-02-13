const mongoose = require('mongoose');

const qrSegmentSchema = new mongoose.Schema({
  journeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Journey',
    required: true,
   
  },
  segmentOrder: { type: Number, required: true },
  line: { type: String, required: true },
  fromStation: { type: String, required: true },
  toStation: { type: String, required: true },
  type: {
    type: String,
    enum: ['ENTRY', 'INTERCHANGE', 'EXIT'],
    required: true
  },
  token: { type: String, required: true, unique: true },
  scanned: { type: Boolean, default: false },
  scannedAt: { type: Date },

  // 🕒 This tracks when the ticket was created
  createdAt: { 
    type: Date, 
    default: Date.now,
   
  }
});

// 🔥 THE AUTO-DELETE MAGIC:
// This tells MongoDB to delete the document 86400 seconds (24 hours) after createdAt
qrSegmentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('QRSegment', qrSegmentSchema);