   // backend/server.js
   require('dotenv').config();
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const authRoutes = require('./routes/auth');
   const foodRoutes = require('./routes/foodauth');

   const app = express();

   // Define allowed origins
   const allowedOrigins = [
     'https://quickybite-1.onrender.com',
     'https://quicky-bite-jnjc.vercel.app',
     'http://localhost:5173',
     'http://localhost:4173'
   ];

   // Updated CORS configuration
   app.use(cors({
     origin: function(origin, callback) {
       // Allow requests with no origin (like mobile apps or curl requests)
       if (!origin) return callback(null, true);
       
       if (allowedOrigins.indexOf(origin) !== -1) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
     credentials: true,
     preflightContinue: false,
     optionsSuccessStatus: 204
   }));

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
   const server = app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });

   // Handle unhandled promise rejections
   process.on('unhandledRejection', (err) => {
     console.error('Unhandled Promise Rejection:', err);
     server.close(() => process.exit(1));
   });