  // server/server.js

  require('dotenv').config();
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');

  const metroRoutes = require('./routes/metroRoutes');
  const routeRoutes = require('./routes/routeRoutes');
  const journeyRoutes = require('./routes/journeyRoutes');
  const userRoutes = require('./routes/userRoutes');

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/metro', metroRoutes);
  app.use('/api/route', routeRoutes);
  app.use('/api/journey', journeyRoutes);
  app.use('/api/users', userRoutes);

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
