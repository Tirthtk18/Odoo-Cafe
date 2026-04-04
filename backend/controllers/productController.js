const Product = require('../models/Product');

// ─── GET /api/products ───────────────────────────────────────────────────────
// Public – all available products (for menu display)
exports.getProducts = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { available: true };
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (err) {
    console.error('GetProducts error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/products ──────────────────────────────────────────────────────
// Admin only – create a product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, emoji, category, description } = req.body;
    if (!name || price === undefined)
      return res.status(400).json({ message: 'Name and price are required' });

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      emoji: emoji || '🍽️',
      category: category || 'Other',
      description: description || '',
      createdBy: req.user._id,
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('CreateProduct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUT /api/products/:id ───────────────────────────────────────────────────
// Admin only – update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, emoji, category, description, available } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price: Number(price), emoji, category, description, available },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('UpdateProduct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── DELETE /api/products/:id ────────────────────────────────────────────────
// Admin only – delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('DeleteProduct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
