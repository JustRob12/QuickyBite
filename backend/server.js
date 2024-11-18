   // backend/server.js
   require('dotenv').config();
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const authRoutes = require('./routes/auth');

   const app = express();

   // Check if MongoDB URI is defined
   if (!process.env.MONGODB_URI) {
     console.error('MongoDB URI is not defined in .env file');
     process.exit(1);
   }

   // Middleware
   app.use(cors());
   app.use(express.json());

   // MongoDB Connection with better error handling
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

   // Monitor MongoDB connection
   mongoose.connection.on('error', err => {
     console.error('MongoDB connection error:', err);
   });

   mongoose.connection.on('disconnected', () => {
     console.log('MongoDB disconnected');
   });

   // Routes
   app.use('/api/auth', authRoutes);

   // Error handling middleware
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ message: 'Something went wrong!' });
   });

   const PORT = process.env.PORT || 5000;
   app.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
   });

   // Handle unhandled promise rejections
   process.on('unhandledRejection', (err) => {
     console.error('Unhandled Promise Rejection:', err);
     // Close server & exit process
     server.close(() => process.exit(1));
   });