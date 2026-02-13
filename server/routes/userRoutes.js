const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create user (simple but safe) userroutes
router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name required' });
    }

    const user = new User({ name, phone });
    await user.save();

    res.status(201).json({ message: 'User saved', user });
  } catch (err) {
    console.error('Error POST /users:', err.message);
    res.status(500).json({ error: 'Server error while saving user' });
  }
});

module.exports = router;
