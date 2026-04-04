const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id:    { type: mongoose.Schema.Types.Mixed },   // accepts both Number (POS) and String (_id from Products)
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  qty:   { type: Number, required: true },
  emoji: { type: String },
  cat:   { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      _id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name:  { type: String, required: true },
      email: { type: String },
    },
    items:       { type: [orderItemSchema], required: true },
    tableNumber: { type: Number, default: 1 },
    subtotal:    { type: Number, required: true },
    gst:         { type: Number, required: true },
    total:       { type: Number, required: true },
    status:      {
      type: String,
      enum: ['new', 'preparing', 'ready', 'served'],
      default: 'new',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'pending', 'razorpay', 'fake_pay'],
      default: 'pending',
    },
    source: {
      type: String,
      enum: ['cashier', 'qr'],
      default: 'cashier',
    },
    guestName:   { type: String },
    orderNumber: { type: Number },
  },
  { timestamps: true }
);

// Auto-increment orderNumber
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastOrder = await mongoose.model('Order').findOne().sort({ orderNumber: -1 });
    this.orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
