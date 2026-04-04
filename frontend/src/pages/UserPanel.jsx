import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MENU = [
  { id: 1,  name: 'Espresso',       price: 80,  cat: 'Coffee',  emoji: '☕', desc: 'Rich & bold single shot' },
  { id: 2,  name: 'Cappuccino',     price: 120, cat: 'Coffee',  emoji: '☕', desc: 'Espresso with frothy milk' },
  { id: 3,  name: 'Cold Brew',      price: 150, cat: 'Coffee',  emoji: '🧊', desc: 'Slow-steeped, smooth & strong' },
  { id: 4,  name: 'Latte',          price: 130, cat: 'Coffee',  emoji: '🥛', desc: 'Espresso with steamed milk' },
  { id: 5,  name: 'Croissant',      price: 90,  cat: 'Bakery',  emoji: '🥐', desc: 'Buttery & flaky pastry' },
  { id: 6,  name: 'Blueberry Muffin',price:100, cat: 'Bakery',  emoji: '🫐', desc: 'Fresh baked every morning' },
  { id: 7,  name: 'Club Sandwich',  price: 180, cat: 'Food',    emoji: '🥪', desc: 'Triple-layered with veggies' },
  { id: 8,  name: 'Veg Burger',     price: 160, cat: 'Food',    emoji: '🍔', desc: 'Crispy patty with sauce' },
  { id: 9,  name: 'Green Tea',      price: 60,  cat: 'Tea',     emoji: '🍵', desc: 'Light & refreshing' },
  { id: 10, name: 'Masala Chai',    price: 40,  cat: 'Tea',     emoji: '🫖', desc: 'Indian spiced milk tea' },
];

const CATS = ['All', 'Coffee', 'Tea', 'Bakery', 'Food'];

export default function UserPanel() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const [cat, setCat]       = useState('All');
  const [cart, setCart]     = useState([]);
  const [ordered, setOrdered] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const filtered = cat === 'All' ? MENU : MENU.filter(m => m.cat === cat);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === id);
      if (exists?.qty === 1) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  const placeOrder = () => {
    if (cart.length === 0) return;
    setOrdered(true);
    setCart([]);
    setTimeout(() => setOrdered(false), 5000);
  };

  const getQty = (id) => cart.find(c => c.id === id)?.qty || 0;

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: 24 }}>☕</span>
          <div>
            <div style={s.appName}>POS Café</div>
            <div style={s.appSub}>Customer Menu</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.userGreet}>
            <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.userRole}>☕ Customer</div>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Sign Out</button>
        </div>
      </header>

      {/* Order success toast */}
      {ordered && (
        <div style={s.toast}>
          🎉 Order placed! Your items are being prepared. Estimated time: 10–15 min.
        </div>
      )}

      <div style={s.layout}>
        {/* ── Left: Menu ── */}
        <div style={s.menuSide}>
          {/* Hero */}
          <div style={s.hero}>
            <div>
              <h1 style={s.heroTitle}>Good {getGreeting()}, {user?.name?.split(' ')[0]}! ☀️</h1>
              <p style={s.heroSub}>What would you like today?</p>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={s.catRow}>
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  ...s.catBtn,
                  background: cat === c ? '#7c3aed' : '#fff',
                  color:      cat === c ? '#fff'     : '#44403c',
                  borderColor:cat === c ? '#7c3aed'  : '#e7e5e4',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div style={s.menuGrid}>
            {filtered.map(item => {
              const qty = getQty(item.id);
              return (
                <div key={item.id} style={{ ...s.menuCard, boxShadow: qty > 0 ? '0 0 0 2px #7c3aed' : '0 2px 10px rgba(0,0,0,0.06)' }}>
                  <div style={s.menuCardTop}>
                    <span style={s.menuEmoji}>{item.emoji}</span>
                    <span style={s.menuCatTag}>{item.cat}</span>
                  </div>
                  <div style={s.menuCardName}>{item.name}</div>
                  <div style={s.menuCardDesc}>{item.desc}</div>
                  <div style={s.menuCardFooter}>
                    <span style={s.menuPrice}>₹{item.price}</span>
                    {qty === 0 ? (
                      <button onClick={() => addToCart(item)} style={s.addBtn}>+ Add</button>
                    ) : (
                      <div style={s.qtyControl}>
                        <button onClick={() => removeFromCart(item.id)} style={s.qtyBtn}>−</button>
                        <span style={s.qtyNum}>{qty}</span>
                        <button onClick={() => addToCart(item)} style={s.qtyBtn}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Cart ── */}
        <div style={s.cartSide}>
          <div style={s.cartCard}>
            <div style={s.cartHead}>
              <h2 style={s.cartTitle}>Your Order</h2>
              {cartCount > 0 && (
                <span style={s.cartCount}>{cartCount} item{cartCount > 1 ? 's' : ''}</span>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={s.cartEmpty}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🛒</div>
                <p style={{ color: '#78716c', fontSize: 14 }}>Your cart is empty</p>
                <p style={{ color: '#a8a29e', fontSize: 12, marginTop: 6 }}>Add items from the menu</p>
              </div>
            ) : (
              <>
                <div style={s.cartItems}>
                  {cart.map(c => (
                    <div key={c.id} style={s.cartItem}>
                      <span style={{ fontSize: 18 }}>{c.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={s.cartItemName}>{c.name}</div>
                        <div style={s.cartItemPrice}>₹{c.price} × {c.qty}</div>
                      </div>
                      <span style={s.cartItemTotal}>₹{c.price * c.qty}</span>
                    </div>
                  ))}
                </div>

                <div style={s.cartDivider} />

                <div style={s.cartSummary}>
                  <div style={s.summaryRow}>
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div style={s.summaryRow}>
                    <span>GST (5%)</span>
                    <span>₹{Math.round(cartTotal * 0.05)}</span>
                  </div>
                  <div style={{ ...s.summaryRow, ...s.summaryTotal }}>
                    <span>Total</span>
                    <span>₹{cartTotal + Math.round(cartTotal * 0.05)}</span>
                  </div>
                </div>

                <button onClick={placeOrder} style={s.orderBtn}>
                  Place Order →
                </button>
                <button onClick={() => setCart([])} style={s.clearBtn}>
                  Clear Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const s = {
  page:       { minHeight: '100vh', background: '#faf5ff' },

  header:     { background: '#fff', borderBottom: '1px solid #e9d5ff', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(124,58,237,0.06)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  appName:    { fontSize: 14, fontWeight: 700, color: '#1c1917' },
  appSub:     { fontSize: 11, color: '#a78bfa' },
  headerRight:{ display: 'flex', alignItems: 'center', gap: 16 },
  userGreet:  { display: 'flex', alignItems: 'center', gap: 10 },
  userAvatar: { width: 34, height: 34, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userName:   { fontSize: 13, fontWeight: 600, color: '#1c1917' },
  userRole:   { fontSize: 11, color: '#7c3aed' },
  logoutBtn:  { padding: '7px 14px', borderRadius: 8, border: '1px solid #e9d5ff', background: 'transparent', color: '#7c3aed', cursor: 'pointer', fontSize: 13, fontWeight: 500 },

  toast:      { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#7c3aed', color: '#fff', padding: '14px 28px', borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 8px 24px rgba(124,58,237,0.3)', whiteSpace: 'nowrap' },

  layout:     { display: 'flex', gap: 24, maxWidth: 1200, margin: '0 auto', padding: '24px 24px 40px' },

  menuSide:   { flex: 1, minWidth: 0 },

  hero:       { background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderRadius: 16, padding: '24px 28px', color: '#fff', marginBottom: 20 },
  heroTitle:  { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  heroSub:    { fontSize: 14, opacity: 0.85 },

  catRow:     { display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  catBtn:     { padding: '7px 16px', borderRadius: 20, border: '1.5px solid', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' },

  menuGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  menuCard:   { background: '#fff', borderRadius: 14, padding: '18px', transition: 'box-shadow .15s, transform .15s', cursor: 'default' },
  menuCardTop:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  menuEmoji:  { fontSize: 28 },
  menuCatTag: { fontSize: 10, background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
  menuCardName:{ fontSize: 14, fontWeight: 700, color: '#1c1917', marginBottom: 4 },
  menuCardDesc:{ fontSize: 12, color: '#78716c', marginBottom: 14, lineHeight: 1.5 },
  menuCardFooter:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  menuPrice:  { fontSize: 16, fontWeight: 700, color: '#7c3aed' },
  addBtn:     { padding: '6px 14px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 6, background: '#f3e8ff', borderRadius: 8, padding: '2px 4px' },
  qtyBtn:     { width: 26, height: 26, borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  qtyNum:     { fontSize: 14, fontWeight: 700, color: '#7c3aed', minWidth: 18, textAlign: 'center' },

  cartSide:   { width: 300, flexShrink: 0 },
  cartCard:   { background: '#fff', borderRadius: 16, padding: '22px', boxShadow: '0 4px 20px rgba(124,58,237,0.10)', position: 'sticky', top: 76 },
  cartHead:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  cartTitle:  { fontSize: 17, fontWeight: 700, color: '#1c1917' },
  cartCount:  { fontSize: 12, background: '#7c3aed', color: '#fff', padding: '3px 10px', borderRadius: 20, fontWeight: 500 },
  cartEmpty:  { textAlign: 'center', padding: '32px 0' },

  cartItems:  { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 },
  cartItem:   { display: 'flex', alignItems: 'center', gap: 10 },
  cartItemName:{ fontSize: 13, fontWeight: 500, color: '#1c1917' },
  cartItemPrice:{ fontSize: 12, color: '#78716c', marginTop: 2 },
  cartItemTotal:{ fontSize: 14, fontWeight: 700, color: '#7c3aed' },

  cartDivider:{ height: 1, background: '#f3e8ff', marginBottom: 14 },
  cartSummary:{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#78716c' },
  summaryTotal:{ fontSize: 16, fontWeight: 700, color: '#1c1917', marginTop: 4 },

  orderBtn:   { width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 8 },
  clearBtn:   { width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #e9d5ff', background: 'transparent', color: '#7c3aed', fontSize: 13, cursor: 'pointer' },
};
