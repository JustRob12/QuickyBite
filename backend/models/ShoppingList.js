const mongoose = require('mongoose');

const ShoppingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('ShoppingList', ShoppingListSchema); 