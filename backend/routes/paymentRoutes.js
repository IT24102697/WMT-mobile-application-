const express = require('express');
const router = express.Router();
const {
  processPayment, getInvoice,
  requestRefund, processRefund,
  getAllRefunds, getMyRefunds,
  getAllPayments, getMyPayments,
} = require('../controllers/paymentController');
const { protect, adminOnly, staffOnly } = require('../middleware/authMiddleware');

router.post('/process',                protect, processPayment);
router.get('/invoice/:orderId',        protect, getInvoice);
router.post('/refund/request',         protect, requestRefund);
router.put('/refund/process/:refundId',protect, staffOnly, processRefund);
router.get('/refunds/all',             protect, staffOnly, getAllRefunds);
router.get('/refunds/my',              protect, getMyRefunds);
router.get('/all',                     protect, staffOnly, getAllPayments);
router.get('/my',                      protect, getMyPayments);

module.exports = router;