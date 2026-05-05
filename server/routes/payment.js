const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

// This uses the keys you just put in your .env file
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/checkout', async (req, res) => {
  try {
    const options = {
      // Math.round prevents errors if the fare has decimals (like 20.50)
      amount: Math.round(Number(req.body.amount * 100)), 
      currency: "INR",
    };
    
    const order = await instance.orders.create(options);
    
    res.status(200).json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: "Could not create order" });
  }
});

module.exports = router;