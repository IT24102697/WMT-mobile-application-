const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/all', protect, adminOnly, getAllUsers);
router.put('/toggle/:id', protect, adminOnly, toggleUserStatus);

module.exports = router;