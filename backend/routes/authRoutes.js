const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup',     ctrl.signup);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/resend-otp', ctrl.resendOTP);
router.post('/login',      ctrl.login);

// Protected routes
router.get('/me', protect, ctrl.getMe);

// Admin only routes
router.post  ('/create-staff',  protect, adminOnly, ctrl.createStaff);
router.get   ('/staff',         protect, adminOnly, ctrl.getStaff);
router.delete('/staff/:id',     protect, adminOnly, ctrl.deleteStaff);

module.exports = router;
