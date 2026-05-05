const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  from: { type: String, required: true },
  to: { type: String, required: true },
  path: { type: [String], required: true },
  status: {
    type: String,
    enum: ['BOOKED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'BOOKED'
  },
  // 🟢 Remove the manual createdAt field
}, { timestamps: true }); // 🟢 Add this here

module.exports = mongoose.model('Journey', journeySchema);