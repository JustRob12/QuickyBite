const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  },
  mealName: {
    type: String,
    required: true
  },
  additionalDish: {
    type: String
  },
  sideDish: {
    type: String
  },
  additionalInfo: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
FoodSchema.index({ userId: 1, date: 1, type: 1 });

module.exports = mongoose.model('Food', FoodSchema); 