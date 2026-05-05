const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // For password security
const jwt = require('jsonwebtoken'); // For login sessions
const User = require('../models/User');

// 🟢 SIGNUP ROUTE (axios.post('/api/users/signup'))
router.post('/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // 1. Validation: Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone: mobile }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or Mobile already registered' });
    }

    // 2. Hash Password: Secure the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User: Map 'mobile' from Frontend to 'phone' from Schema
    const user = new User({ 
      name, 
      email, 
      phone: mobile, // 📱 Translates 'mobile' to 'phone'
      password: hashedPassword 
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (err) {
    console.error('Signup Error:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// 🔵 LOGIN ROUTE (axios.post('/api/users/login'))
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // 3. Generate Token
    const token = jwt.sign({ id: user._id }, 'YOUR_SECRET_KEY', { expiresIn: '7d' });

    // 4. Send response (mapping phone back to mobile for Frontend)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.phone, // 📱 Sends phone as 'mobile' to match React
        balance:user.balance // 🟢 Include balance in the login response
      }
    });

  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});
// 💰 WALLET UPDATE ROUTE (axios.post('/api/auth/update-balance'))
// 💰 WALLET & FARE DEDUCTION ROUTE
// This is called after a successful Razorpay payment
router.post('/update-balance', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // We use $inc (increment)
    // If amount is 500, it adds 500. 
    // If amount is -20 (negative), it deducts 20.
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } }, 
      { new: true } // This returns the user with the updated balance
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'Balance updated', 
      newBalance: user.balance 
    });

  } catch (err) {
    console.error('Update Balance Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;