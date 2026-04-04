const Order      = require('../models/Order');
const nodemailer = require('nodemailer');

/* ─── Email transporter ─── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/* ─── Send order receipt email ─── */
async function sendReceiptEmail(toEmail, order) {
  if (!toEmail) return;
  const itemsHtml = order.items.map(i =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3e8ff;">${i.emoji||'🍽️'} ${i.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3e8ff;text-align:center;">×${i.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3e8ff;text-align:right;font-weight:700;color:#7c3aed;">₹${i.price * i.qty}</td>
    </tr>`
  ).join('');

  const payLabel = { cash:'💵 Cash at Counter', upi:'📱 UPI', card:'💳 Card', fake_pay:'💳 Card (Online)', pending:'Pending' };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Order Receipt – POS Café</title></head>
<body style="margin:0;padding:0;background:#f8f5ff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(124,58,237,0.10);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 36px;text-align:center;color:#fff;">
      <div style="font-size:40px;margin-bottom:8px;">☕</div>
      <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-0.02em;">POS Café</h1>
      <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">Order Confirmation & Receipt</p>
    </div>

    <!-- Order details -->
    <div style="padding:28px 36px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <div style="font-size:12px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Order Number</div>
          <div style="font-size:28px;font-weight:900;color:#7c3aed;letter-spacing:-0.03em;">#${order.orderNumber}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Table</div>
          <div style="font-size:20px;font-weight:800;color:#1c1917;">🪑 Table ${order.tableNumber}</div>
        </div>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:24px;font-size:14px;color:#166534;font-weight:600;text-align:center;">
        ✅ Your order is confirmed and being prepared!
      </div>

      <!-- Items table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#f5f3ff;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;border-radius:8px 0 0 0;">Item</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#7c3aed;text-transform:uppercase;letter-spacing:0.06em;border-radius:0 8px 0 0;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <!-- Totals -->
      <div style="border-top:2px solid #f3e8ff;padding-top:16px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#78716c;margin-bottom:6px;">
          <span>Subtotal</span><span>₹${order.subtotal}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#78716c;margin-bottom:12px;">
          <span>GST (5%)</span><span>₹${order.gst}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:900;color:#1c1917;">
          <span>Total</span><span>₹${order.total}</span>
        </div>
      </div>

      <!-- Payment & time -->
      <div style="margin-top:20px;display:flex;gap:12px;">
        <div style="flex:1;background:#f5f3ff;border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:10px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Payment</div>
          <div style="font-size:13px;font-weight:700;color:#7c3aed;">${payLabel[order.paymentMethod]||order.paymentMethod}</div>
        </div>
        <div style="flex:1;background:#fffbeb;border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:10px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Estimated Time</div>
          <div style="font-size:13px;font-weight:700;color:#b45309;">⏱ 10–15 min</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f5ff;padding:20px 36px;text-align:center;border-top:1px solid #f3e8ff;">
      <p style="margin:0;font-size:13px;color:#78716c;">Thank you for ordering at <strong style="color:#7c3aed;">POS Café</strong>! 🎉</p>
      <p style="margin:6px 0 0;font-size:11px;color:#a8a29e;">This is an automated receipt. Please don't reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"POS Café ☕" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `Order #${order.orderNumber} Confirmed – POS Café 🎉`,
      html,
    });
    console.log(`Receipt sent to ${toEmail}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { items, tableNumber, subtotal, gst, total, paymentMethod } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'Order must have at least one item' });

    const order = await Order.create({
      customer: { _id: req.user._id, name: req.user.name, email: req.user.email },
      items, tableNumber: tableNumber || 1, subtotal, gst, total, status: 'new',
      paymentMethod: paymentMethod || 'cash',
    });

    // Send receipt to logged-in user's email
    sendReceiptEmail(req.user.email, order);

    res.status(201).json(order);
  } catch (err) {
    console.error('CreateOrder error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/orders/public ─────────────────────────────────────────────────
// QR guest order — no auth token required
exports.createPublicOrder = async (req, res) => {
  try {
    const { items, tableNumber, subtotal, gst, total, guestName, paymentMethod, guestEmail } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'Order must have at least one item' });

    const order = await Order.create({
      customer: {
        name:  guestName || `Table ${tableNumber} Guest`,
        email: guestEmail || '',
      },
      items,
      tableNumber: tableNumber || 1,
      subtotal, gst, total,
      paymentMethod: paymentMethod || 'cash',
      source: 'qr',
      guestName: guestName || `Table ${tableNumber} Guest`,
      status: 'new',
    });

    // Send receipt if email provided
    if (guestEmail) sendReceiptEmail(guestEmail, order);

    res.status(201).json(order);
  } catch (err) {
    console.error('CreatePublicOrder error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── GET /api/orders/my ──────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'customer._id': req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('GetMyOrders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/orders/by-ids ──────────────────────────────────────────────────
// Public — used by guest session to poll their orders by ID
exports.getOrdersByIds = async (req, res) => {
  try {
    const { ids } = req.query; // comma-separated order IDs
    if (!ids) return res.json([]);
    const idArray = ids.split(',').filter(Boolean).slice(0, 20); // max 20
    const orders = await Order.find({ _id: { $in: idArray } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('GetOrdersByIds error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────
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
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'preparing', 'ready', 'served'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('UpdateOrderStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE /api/orders/:id ───────────────────────────────────────────────────
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
