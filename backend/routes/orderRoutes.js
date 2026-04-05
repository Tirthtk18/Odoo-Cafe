const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes (no auth)
router.post('/public',      ctrl.createPublicOrder);
router.get('/by-ids',       ctrl.getOrdersByIds);   // guest session polling

// Authenticated routes
router.post('/',            protect, ctrl.createOrder);
router.get('/my',           protect, ctrl.getMyOrders);
router.get('/report',       protect, adminOnly, ctrl.getReport);
router.get('/',             protect, ctrl.getOrders);
router.patch('/:id/status', protect, ctrl.updateOrderStatus);
router.delete('/:id',       protect, adminOnly, ctrl.deleteOrder);

module.exports = router;
