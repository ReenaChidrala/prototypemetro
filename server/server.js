  // server/server.js

  require('dotenv').config();
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');

  const metroRoutes = require('./routes/metroRoutes');
  const routeRoutes = require('./routes/routeRoutes');
  const journeyRoutes = require('./routes/journeyRoutes');
  const userRoutes = require('./routes/userRoutes');
  const paymentRoutes = require('./routes/payment');

  const app = express();

  // Middleware
 // Replace app.use(cors()); with this:
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://prototypemetro-bi54.vercel.app" // Your specific Vercel live link
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
  app.use(express.json());

  // Routes
  app.use('/api/metro', metroRoutes);
  app.use('/api/route', routeRoutes);
  app.use('/api/journey', journeyRoutes);
  app.use('/api/auth', userRoutes);
  app.use('/api/payment', paymentRoutes);

  // Root test
  app.get('/', (req, res) => {
    res.send('Metro Backend Running 🚇');
  });

  // MongoDB
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
      console.error('MongoDB error:', err.message);
      process.exit(1);
    });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
