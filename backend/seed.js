require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  emoji:       { type: String },
  category:    { type: String },
  description: { type: String },
  available:   { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const ITEMS = [
  { name: 'Espresso',       price: 120, emoji: '☕', category: 'Coffee', description: 'Rich & bold single shot, full-bodied Italian style' },
  { name: 'Cappuccino',     price: 180, emoji: '☕', category: 'Coffee', description: 'Espresso with velvety steamed milk foam' },
  { name: 'Cold Coffee',    price: 220, emoji: '🧋', category: 'Coffee', description: 'Chilled espresso blended with cream & ice' },
  { name: 'Latte',          price: 200, emoji: '🥛', category: 'Coffee', description: 'Smooth espresso with silky steamed milk' },
  { name: 'Butter Croissant', price: 130, emoji: '🥐', category: 'Food', description: 'Flaky, golden, buttery French pastry' },
  { name: 'Veg Sandwich',   price: 180, emoji: '🥪', category: 'Food', description: 'Triple-layered with fresh veggies & cheese' },
  { name: 'Blueberry Muffin', price: 110, emoji: '🧁', category: 'Snacks', description: 'Soft muffin bursting with fresh blueberries' },
  { name: 'Chocolate Brownie', price: 140, emoji: '🍫', category: 'Snacks', description: 'Warm, fudgy chocolate brownie — a must try' },
  { name: 'Mango Smoothie', price: 180, emoji: '🥭', category: 'Drinks', description: 'Thick, fresh Alphonso mango blended with milk' },
  { name: 'Masala Chai',    price: 60,  emoji: '🍵', category: 'Drinks', description: 'Traditional Indian spiced milk tea' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pos-cafe');
    console.log('✅ Connected to MongoDB');

    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  ${existing} products already exist. Clearing and reseeding...`);
      await Product.deleteMany({});
    }

    const inserted = await Product.insertMany(ITEMS);
    console.log(`\n🎉 Seeded ${inserted.length} products:\n`);
    inserted.forEach(p => console.log(`  ${p.emoji} ${p.name} — ₹${p.price} [${p.category}]`));

    await mongoose.disconnect();
    console.log('\n✅ Done! Refresh your admin dashboard to see the products.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
