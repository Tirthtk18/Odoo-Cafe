const router = require('express').Router();
const ctrl   = require('../controllers/paymentController');

// Public – called from the QR ordering page (no login required)
router.post('/create-order', ctrl.createRazorpayOrder);

module.exports = router;
