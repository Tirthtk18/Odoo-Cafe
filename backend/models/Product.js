const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    emoji:       { type: String, default: '🍽️' },
    category:    { type: String, enum: ['Coffee', 'Food', 'Snacks', 'Drinks', 'Other'], default: 'Other' },
    description: { type: String, default: '' },
    available:   { type: Boolean, default: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
