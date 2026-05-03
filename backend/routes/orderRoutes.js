const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getAllOrders,
  getOrderById, updateOrderStatus, cancelOrder
} = require('../controllers/orderController');
const { protect, staffOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, staffOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, staffOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;