const express = require('express');
const router = express.Router();
const {
  getMyTrustScore, updateTrustScore, getAllTrustScores,
  createDiscount, getAllDiscounts, validateDiscount,
  toggleDiscount, updateDiscount, deleteDiscount
} = require('../controllers/trustController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/my',                      protect, getMyTrustScore);
router.get('/all',                     protect, adminOnly, getAllTrustScores);
router.put('/update/:customerId',      protect, adminOnly, updateTrustScore);
router.post('/discount',               protect, adminOnly, createDiscount);
router.get('/discounts',               protect, getAllDiscounts);
router.post('/discount/validate',      protect, validateDiscount);
router.put('/discount/toggle/:id',     protect, adminOnly, toggleDiscount);
router.put('/discount/:id',            protect, adminOnly, updateDiscount);
router.delete('/discount/:id',         protect, adminOnly, deleteDiscount);

module.exports = router;