const Table = require('../models/Table');

// ─── GET /api/tables ─────────────────────────────────────────────────────────
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/tables ────────────────────────────────────────────────────────
// Admin only – create table
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, name, capacity } = req.body;
    if (!tableNumber)
      return res.status(400).json({ message: 'tableNumber is required' });

    const exists = await Table.findOne({ tableNumber: Number(tableNumber) });
    if (exists)
      return res.status(400).json({ message: `Table ${tableNumber} already exists` });

    const table = await Table.create({
      tableNumber: Number(tableNumber),
      name:        name || `Table ${tableNumber}`,
      capacity:    Number(capacity) || 4,
      createdBy:   req.user._id,
    });
    res.status(201).json(table);
  } catch (err) {
    console.error('CreateTable error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUT /api/tables/:id ─────────────────────────────────────────────────────
// Admin only – update table
exports.updateTable = async (req, res) => {
  try {
    const { name, capacity, isActive } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { name, capacity, isActive },
      { new: true }
    );
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json(table);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE /api/tables/:id ──────────────────────────────────────────────────
// Admin only – delete table
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    res.json({ message: 'Table removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
