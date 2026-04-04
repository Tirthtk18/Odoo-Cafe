const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// ─── POST /api/payment/create-order ─────────────────────────────────────────
// Creates a Razorpay order; returns order_id to frontend
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;   // amount in paise (₹ * 100)
    if (!amount || amount < 100)
      return res.status(400).json({ message: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount),
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    });

    res.json({
      order_id:  order.id,
      amount:    order.amount,
      currency:  order.currency,
      key_id:    process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ message: 'Payment initiation failed. Please try another method.' });
  }
};
