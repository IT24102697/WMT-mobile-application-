const express = require('express');
const router = express.Router();
const {
  registerCustomer, registerStaff, verifyEmail,
  login, forgotPassword, resetPasswordPage,
  resetPassword, getPendingStaff, approveStaff,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login',                  login);
router.post('/register/customer',      registerCustomer);
router.post('/register/staff',         registerStaff);
router.get('/verify-email',            verifyEmail);
router.post('/forgot-password',        forgotPassword);
router.get('/reset-password-page',     resetPasswordPage);
router.post('/reset-password',         resetPassword);
router.get('/pending-staff',           protect, adminOnly, getPendingStaff);
router.put('/approve-staff/:id',       protect, adminOnly, approveStaff);

module.exports = router;