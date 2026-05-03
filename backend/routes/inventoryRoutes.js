const express = require('express');
const router = express.Router();
const {
  getAllIngredients, getLowStockItems, addIngredient,
  updateIngredient, restockIngredient, deleteIngredient,
  getInventorySummary
} = require('../controllers/inventoryController');
const { protect, staffOnly, adminOnly } = require('../middleware/authMiddleware');

router.get('/',            protect, staffOnly, getAllIngredients);
router.get('/low-stock',   protect, staffOnly, getLowStockItems);
router.get('/summary',     protect, staffOnly, getInventorySummary);
router.post('/',           protect, adminOnly, addIngredient);
router.put('/:id',         protect, adminOnly, updateIngredient);
router.put('/:id/restock', protect, staffOnly, restockIngredient);
router.delete('/:id',      protect, adminOnly, deleteIngredient);

module.exports = router;