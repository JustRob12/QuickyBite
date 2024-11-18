   // backend/server.js
   require('dotenv').config();
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const authRoutes = require('./routes/auth');
   const foodRoutes = require('./routes/foodauth');

   const app = express();

   // Updated CORS configuration
   app.use(cors({
     origin: ['https://quickybite-1.onrender.com'],
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true,
     preflightContinue: false,
     optionsSuccessStatus: 204
   }));

   // Handle OPTIONS preflight requests
   app.options('*', cors());

   // Add headers middleware
   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
     next();
   });

   app.use(express.json());

   // MongoDB Connection
   mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => {
     console.log('Successfully connected to MongoDB.');
   })
   .catch((error) => {
     console.error('MongoDB connection error:', error.message);
     process.exit(1);
   });

   // Basic route for testing
   app.get('/', (req, res) => {
     res.json({ message: 'Welcome to the Food Calendar API' });
   });

   // Routes
   app.use('/api/auth', authRoutes);
   app.use('/api/food', foodRoutes);

   // Error handling middleware
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ message: 'Something went wrong!' });
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });

   // Handle unhandled promise rejections
   process.on('unhandledRejection', (err) => {
     console.error('Unhandled Promise Rejection:', err);
     // Close server & exit process
     server.close(() => process.exit(1));
   });