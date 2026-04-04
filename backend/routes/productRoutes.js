const router = require('express').Router();
const ctrl   = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public – anyone can fetch the menu
router.get('/', ctrl.getProducts);

// Admin only – manage menu items
router.post  ('/',    protect, adminOnly, ctrl.createProduct);
router.put   ('/:id', protect, adminOnly, ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct);

module.exports = router;
