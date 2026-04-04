const Order = require('../models/Order');

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Customer places an order (requires auth token)
exports.createOrder = async (req, res) => {
  try {
    const { items, tableNumber, subtotal, gst, total } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'Order must have at least one item' });

    const order = await Order.create({
      customer: {
        _id:   req.user._id,
        name:  req.user.name,
        email: req.user.email,
      },
      items,
      tableNumber: tableNumber || 1,
      subtotal,
      gst,
      total,
      status: 'new',
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('CreateOrder error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────
// Admin / Kitchen sees all orders (latest first)
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('GetOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PATCH /api/orders/:id/status ────────────────────────────────────────────
// Kitchen staff advances an order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'preparing', 'ready', 'served'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    console.error('UpdateOrderStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE /api/orders/:id ───────────────────────────────────────────────────
// Admin deletes/removes a served order
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
