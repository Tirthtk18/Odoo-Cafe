const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Customer places order
router.post('/',         protect, ctrl.createOrder);

// Admin & Kitchen view all orders
router.get('/',          protect, ctrl.getOrders);

// Kitchen/Admin advances order status
router.patch('/:id/status', protect, ctrl.updateOrderStatus);

// Admin deletes an order
router.delete('/:id',    protect, adminOnly, ctrl.deleteOrder);

module.exports = router;
