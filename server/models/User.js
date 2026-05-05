const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Prevents two people from using same email
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true // Important for tracking UPI payments
  },
  password: { 
    type: String, 
    required: true // We will store this as a "hashed" string
  },
  balance: { type: Number, default: 0 },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);