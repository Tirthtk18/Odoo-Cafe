const router = require('express').Router();
const ctrl   = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protected – admin & cashier can view tables
router.get('/', protect, ctrl.getTables);

// Admin only – manage tables
router.post  ('/',    protect, adminOnly, ctrl.createTable);
router.put   ('/:id', protect, adminOnly, ctrl.updateTable);
router.delete('/:id', protect, adminOnly, ctrl.deleteTable);

module.exports = router;
