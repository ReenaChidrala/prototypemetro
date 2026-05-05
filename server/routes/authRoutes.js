const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🟢 SIGNUP (First-time user)
// 🟢 SIGNUP (First-time user)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body; // 'mobile' comes from your Auth.jsx
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({ 
      name, 
      email, 
      phone: mobile, // 🟢 FIX: Map 'mobile' to 'phone' so it matches your Schema
      password: hashedPassword 
    });
    
    res.status(201).json({ message: "Account created!" });
  } catch (err) {
    console.error(err); // This helps you see the REAL error in your terminal
    res.status(400).json({ error: "Email or Mobile already exists or database error!" });
  }
});

// 🔵 LOGIN (Returning user)
// 🔵 LOGIN (Returning user)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        mobile: user.phone // 🟢 FIX: Use user.phone from the database
      } 
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

module.exports = router;