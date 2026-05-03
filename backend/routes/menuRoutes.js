const express = require('express');
const router = express.Router();
const {
  getAllMenuItems, getAvailableMenuItems, getByCategory,
  createMenuItem, updateMenuItem, deleteMenuItem,
  toggleAvailability, getPopularItems, getMenuAnalytics
} = require('../controllers/menuController');
const { protect, adminOnly, staffOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/available', getAvailableMenuItems);
router.get('/popular', getPopularItems);
router.get('/analytics', protect, staffOnly, getMenuAnalytics);
router.get('/category/:category', getByCategory);

// Admin only routes
router.get('/', protect, adminOnly, getAllMenuItems);
router.post('/', protect, adminOnly, createMenuItem);
router.put('/toggle/:id', protect, adminOnly, toggleAvailability);
router.put('/:id', protect, adminOnly, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;