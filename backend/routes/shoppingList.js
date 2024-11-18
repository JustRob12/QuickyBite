const express = require('express');
const router = express.Router();
const ShoppingList = require('../models/ShoppingList');
const auth = require('../middleware/auth');

// Get user's shopping list
router.get('/', auth, async (req, res) => {
  try {
    let shoppingList = await ShoppingList.findOne({ userId: req.user.id });
    
    if (!shoppingList) {
      shoppingList = new ShoppingList({ userId: req.user.id, items: [] });
      await shoppingList.save();
    }
    
    res.json(shoppingList.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to shopping list
router.post('/item', auth, async (req, res) => {
  try {
    const { itemName, quantity } = req.body;

    let shoppingList = await ShoppingList.findOne({ userId: req.user.id });
    
    if (!shoppingList) {
      shoppingList = new ShoppingList({ userId: req.user.id, items: [] });
    }
    
    shoppingList.items.push({ itemName, quantity });
    await shoppingList.save();
    
    res.status(201).json(shoppingList.items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update item completion status
router.put('/item/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { isCompleted } = req.body;

    const shoppingList = await ShoppingList.findOne({ userId: req.user.id });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    const item = shoppingList.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.isCompleted = isCompleted;
    await shoppingList.save();
    
    res.json(shoppingList.items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete item from shopping list
router.delete('/item/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    const shoppingList = await ShoppingList.findOne({ userId: req.user.id });
    
    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    shoppingList.items = shoppingList.items.filter(item => item._id.toString() !== itemId);
    await shoppingList.save();
    
    res.json(shoppingList.items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 