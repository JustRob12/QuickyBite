const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// Get foods within a date range (This must come BEFORE /:date route)
router.get('/range', auth, async (req, res) => {
  try {
    const startDate = new Date(req.query.start);
    const endDate = new Date(req.query.end);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    res.json(foods);
  } catch (error) {
    console.error('Error in /range:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all foods for a specific date
router.get('/:date', auth, async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new food entry
router.post('/', auth, async (req, res) => {
  try {
    const { date, type, mealName, additionalDish, sideDish, additionalInfo } = req.body;

    const newFood = new Food({
      userId: req.user.id,
      date: new Date(date),
      type,
      mealName,
      additionalDish,
      sideDish,
      additionalInfo
    });

    const savedFood = await newFood.save();
    res.status(201).json(savedFood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a food entry
router.put('/:id', auth, async (req, res) => {
  try {
    const food = await Food.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!food) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    Object.assign(food, req.body);
    const updatedFood = await food.save();
    res.json(updatedFood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a food entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!food) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    res.json({ message: 'Food entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all foods for a specific week
router.get('/week/:startDate', auth, async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 