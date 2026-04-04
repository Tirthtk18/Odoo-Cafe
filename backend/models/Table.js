const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    name:        { type: String, default: '' },      // e.g. "Window Table"
    capacity:    { type: Number, default: 4 },
    isActive:    { type: Boolean, default: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
