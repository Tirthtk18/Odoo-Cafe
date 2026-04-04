import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ORDER_BASE = 'http://localhost:5000/api/orders';
const PRODUCT_API = 'http://localhost:5000/api/products';

const TABLES = [1,2,3,4,5,6,7,8];

export default function POS() {
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const [menu, setMenu]         = useState([]);
  const [loadingMenu, setLM]    = useState(true);
  const [cart, setCart]         = useState([]);
  const [table, setTable]       = useState(1);
  const [cat, setCat]           = useState('All');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PRODUCT_API);
        const data = await res.json();
        if (Array.isArray(data)) setMenu(data);
      } catch(e) { console.error(e); } finally { setLM(false); }
    })();
  }, []);

  const CATS = ['All', ...['Coffee','Food','Snacks','Drinks','Other'].filter(c => menu.some(m => m.category === c))];
  const [payModal, setPayModal] = useState(false);
  const [payDone, setPayDone]   = useState(false);
  const [payMethod, setMethod]  = useState('cash');
  const [cashIn, setCashIn]     = useState('');

  // Order status
  const [sending, setSending]   = useState(false);
  const [sentOrderId, setSentOrderId] = useState(null); // tracks the current DB order id
  const [toast, setToast]       = useState({ msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  const filtered = menu.filter(
    m => (cat === 'All' || m.category === cat) &&
         m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (item) => {
    if (sentOrderId) return;
    setCart(prev => {
      const ex = prev.find(c => c._id === item._id);
      return ex
        ? prev.map(c => c._id === item._id ? { ...c, qty: c.qty + 1 } : c)
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => {
    if (sentOrderId) return;
    setCart(prev =>
      prev.map(c => c._id === id ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0)
    );
  };

  const clearCart = () => {
    if (sentOrderId) return;
    setCart([]);
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + tax;
  const change   = Number(cashIn) - total;

  // ── Send order to kitchen (saves to DB) ──────────────────────────────────
  const sendToKitchen = async () => {
    if (cart.length === 0 || sending || sentOrderId) return;
    setSending(true);
    try {
      const res = await fetch(ORDER_BASE, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          items:       cart.map(c=>({ id: c._id, name: c.name, qty: c.qty, price: c.price, emoji: c.emoji||'🍽️', cat: c.category })),
          tableNumber: table,
          subtotal,
          gst: tax,
          total,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSentOrderId(data._id);
        showToast(`✅ Order sent to Kitchen — Table ${table}`, 'success');
      } else {
        showToast(`❌ ${data.message || 'Failed to send order'}`, 'error');
      }
    } catch (err) {
      console.error('Send to kitchen error:', err);
      showToast('❌ Network error. Check if backend is running.', 'error');
    } finally {
      setSending(false);
    }
  };

  // ── Confirm payment (saves order if not already sent) ────────────────────
  const handlePayment = async () => {
    // If order wasn't yet sent to kitchen, send it now as part of payment
    if (!sentOrderId) {
      setSending(true);
      try {
        const res = await fetch(ORDER_BASE, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            items:       cart.map(c=>({ id: c._id, name: c.name, qty: c.qty, price: c.price, emoji: c.emoji||'🍽️', cat: c.category })),
            tableNumber: table,
            subtotal,
            gst: tax,
            total,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          showToast(`❌ ${data.message || 'Failed to place order'}`, 'error');
          setSending(false);
          return;
        }
      } catch (err) {
        console.error('Payment order error:', err);
        showToast('❌ Network error. Check if backend is running.', 'error');
        setSending(false);
        return;
      } finally {
        setSending(false);
      }
    }

    // Show success UI then reset
    setPayDone(true);
    setTimeout(() => {
      setPayModal(false);
      setPayDone(false);
      setCart([]);
      setCashIn('');
      setSentOrderId(null);
    }, 2200);
  };

  // ── Reset after a new order session ─────────────────────────────────────
  const startNewOrder = () => {
    setCart([]);
    setSentOrderId(null);
    setPayModal(false);
    setPayDone(false);
    setCashIn('');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const orderLocked = !!sentOrderId; // cart is locked once sent to kitchen

  return (
    <div style={s.page}>

      {/* Toast */}
      {toast.msg && (
        <div style={{
          ...s.toast,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color:      toast.type === 'error' ? '#dc2626' : '#16a34a',
          border:     toast.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ─ Top Bar ─ */}
      <header style={s.topbar}>
        <div style={s.topLeft}>
          <div style={s.logo}>☕</div>
          <div>
            <div style={s.appName}>POS Café</div>
            <div style={s.appSub}>Cashier Terminal</div>
          </div>
        </div>

        <div style={s.tableSelector}>
          <span style={s.tableLabel}>Table</span>
          <div style={s.tableRow}>
            {TABLES.map(t => (
              <button
                key={t}
                onClick={() => !orderLocked && setTable(t)}
                title={orderLocked ? 'Cannot change table after sending to kitchen' : ''}
                style={{
                  ...s.tableBtn,
                  background: table === t ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                  color:      table === t ? '#000'    : '#d6d3d1',
                  fontWeight: table === t ? 700       : 400,
                  boxShadow:  table === t ? '0 0 12px rgba(245,158,11,0.4)' : 'none',
                  opacity:    orderLocked && table !== t ? 0.4 : 1,
                  cursor:     orderLocked ? 'not-allowed' : 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={s.topRight}>
          <div style={s.cashierBadge}>
            <div style={s.cashierAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fafaf9' }}>{user?.name}</div>
              <div style={{ fontSize: 10.5, color: '#78716c' }}>🧾 Cashier</div>
            </div>
          </div>
          <Link to="/table-qr" style={s.qrNavBtn} title="View Table QR Codes">🔲 QR Codes</Link>
          <button onClick={handleLogout} style={s.logoutBtn}>Sign Out</button>
        </div>
      </header>

      <div style={s.body}>
        {/* ─ Left: Menu ─ */}
        <div style={s.menuCol}>
          {/* Search + Filters */}
          <div style={s.menuTop}>
            {orderLocked && (
              <div style={s.lockedBanner}>
                🍳 Order sent to Kitchen — Table {table}. &nbsp;
                <button onClick={startNewOrder} style={s.newOrderBtn}>Start New Order</button>
              </div>
            )}
            <div style={s.searchWrap}>
              <span style={s.searchIcon}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search menu..."
                style={{ ...s.searchInput, opacity: orderLocked ? 0.5 : 1 }}
                disabled={orderLocked}
              />
              {search && (
                <button onClick={() => setSearch('')} style={s.clearSearch}>✕</button>
              )}
            </div>
            <div style={s.catRow}>
              {CATS.map(c => (
                <button
                  key={c}
                  onClick={() => !orderLocked && setCat(c)}
                  style={{
                    ...s.catBtn,
                    background: cat === c ? '#1c1917' : '#fff',
                    color:      cat === c ? '#fff'    : '#44403c',
                    border:     cat === c ? '1.5px solid #1c1917' : '1.5px solid #e7e5e4',
                    fontWeight: cat === c ? 600 : 400,
                    opacity:    orderLocked ? 0.5 : 1,
                    cursor:     orderLocked ? 'not-allowed' : 'pointer',
                  }}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div style={s.menuGrid}>
            {loadingMenu ? (
              <div style={s.emptyMenu}><p style={{ color:'#57534e' }}>Loading menu…</p></div>
            ) : filtered.length === 0 ? (
              <div style={s.emptyMenu}>
                <div style={{ fontSize: 40 }}>🔍</div>
                <p>{menu.length === 0 ? 'No products added yet. Add via Admin → Products.' : 'No items found'}</p>
              </div>
            ) : filtered.map(item => {
              const inCart = cart.find(c => c._id === item._id);
              return (
                <button
                  key={item._id}
                  onClick={() => addItem(item)}
                  disabled={orderLocked}
                  style={{
                    ...s.menuCard,
                    border: inCart ? '2px solid #f59e0b' : '2px solid #e7e5e4',
                    boxShadow: inCart ? '0 0 0 3px rgba(245,158,11,0.15)' : 'none',
                    opacity: orderLocked ? 0.5 : 1,
                    cursor:  orderLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div style={s.menuEmoji}>{item.emoji||'🍽️'}</div>
                  <div style={s.menuName}>{item.name}</div>
                  <div style={s.menuCat}>{item.category}</div>
                  <div style={s.menuPrice}>₹{item.price}</div>
                  {inCart && (
                    <div style={s.qtyBadge}>{inCart.qty}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─ Right: Order/Cart ─ */}
        <div style={s.cartCol}>
          <div style={s.cartHeader}>
            <div>
              <h2 style={s.cartTitle}>Order — Table {table}</h2>
              <p style={s.cartSub}>{cart.length === 0 ? 'No items yet' : `${cart.reduce((s,c) => s+c.qty,0)} items`}</p>
            </div>
            {cart.length > 0 && !orderLocked && (
              <button onClick={clearCart} style={s.clearBtn}>Clear</button>
            )}
            {orderLocked && (
              <span style={s.sentPill}>🍳 Sent</span>
            )}
          </div>

          {/* Cart items */}
          <div style={s.cartItems}>
            {cart.length === 0 ? (
              <div style={s.emptyCart}>
                <div style={{ fontSize: 48 }}>🧾</div>
                <p style={{ color: '#a8a29e', fontSize: 14, marginTop: 12 }}>
                  Add items from the menu
                </p>
              </div>
            ) : cart.map(item => (
              <div key={item._id} style={s.cartItem}>
                <span style={s.cartEmoji}>{item.emoji||'🍽️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={s.cartItemName}>{item.name}</div>
                  <div style={s.cartItemPrice}>₹{item.price} × {item.qty}</div>
                </div>
                {!orderLocked && (
                  <div style={s.qtyControl}>
                    <button style={s.qtyBtn} onClick={() => removeItem(item._id)}>−</button>
                    <span style={s.qtyNum}>{item.qty}</span>
                    <button style={s.qtyBtn} onClick={() => addItem(item)}>+</button>
                  </div>
                )}
                {orderLocked && (
                  <span style={s.qtyNum}>{item.qty}×</span>
                )}
                <div style={s.cartItemTotal}>₹{item.price * item.qty}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {cart.length > 0 && (
            <div style={s.summary}>
              <div style={s.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div style={s.summaryRow}>
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div style={s.totalRow}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button onClick={() => setPayModal(true)} style={s.payBtn}>
                💳 Proceed to Payment
              </button>

              <button
                onClick={sendToKitchen}
                disabled={sending || orderLocked}
                style={{
                  ...s.kitchenBtn,
                  opacity: sending || orderLocked ? 0.6 : 1,
                  cursor:  sending || orderLocked ? 'not-allowed' : 'pointer',
                  background: orderLocked ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)',
                  borderColor: orderLocked ? 'rgba(34,197,94,0.3)' : 'rgba(249,115,22,0.3)',
                  color: orderLocked ? '#22c55e' : '#f97316',
                }}
              >
                {sending ? '⏳ Sending...' : orderLocked ? '✅ Sent to Kitchen' : '🍳 Send to Kitchen'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─ Payment Modal ─ */}
      {payModal && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && !payDone && setPayModal(false)}>
          <div style={s.modal} className="anim-popIn">
            {payDone ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={s.successCircle}>✓</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#16a34a', marginTop: 16, marginBottom: 8 }}>Payment Successful!</h3>
                <p style={{ color: '#78716c', fontSize: 14 }}>Order for Table {table} is confirmed.</p>
                <p style={{ color: '#a8a29e', fontSize: 12, marginTop: 6 }}>Order sent to Kitchen &amp; Admin Dashboard.</p>
              </div>
            ) : (
              <>
                <div style={s.modalHead}>
                  <h3 style={s.modalTitle}>Payment — Table {table}</h3>
                  <button onClick={() => setPayModal(false)} style={s.closeBtn}>✕</button>
                </div>

                {sentOrderId && (
                  <div style={s.kitchenConfirmed}>
                    🍳 Kitchen notified — Order #{sentOrderId.slice(-6).toUpperCase()}
                  </div>
                )}

                <div style={s.totalBanner}>
                  <span style={{ color: '#78716c', fontSize: 13 }}>Amount Due</span>
                  <span style={{ fontSize: 34, fontWeight: 800, color: '#1c1917', letterSpacing: '-0.04em' }}>₹{total}</span>
                </div>

                {/* Payment Methods */}
                <div style={s.methodRow}>
                  {[
                    { key: 'cash',  icon: '💵', label: 'Cash' },
                    { key: 'card',  icon: '💳', label: 'Card' },
                    { key: 'upi',   icon: '📱', label: 'UPI QR' },
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMethod(m.key)}
                      style={{
                        ...s.methodBtn,
                        background:  payMethod === m.key ? '#1c1917' : '#f7f4f0',
                        color:       payMethod === m.key ? '#fff'    : '#44403c',
                        borderColor: payMethod === m.key ? '#1c1917' : '#e7e5e4',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{m.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Cash input */}
                {payMethod === 'cash' && (
                  <div style={s.cashSection} className="anim-slideDown">
                    <label style={s.cashLabel}>Amount Received</label>
                    <input
                      type="number"
                      value={cashIn}
                      onChange={e => setCashIn(e.target.value)}
                      placeholder={`₹${total}`}
                      style={s.cashInput}
                    />
                    {cashIn && Number(cashIn) >= total && (
                      <div style={s.changeBox}>
                        Change: <strong style={{ color: '#16a34a' }}>₹{change}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* UPI QR placeholder */}
                {payMethod === 'upi' && (
                  <div style={s.qrBox} className="anim-slideDown">
                    <div style={s.qrPlaceholder}>
                      <div style={{ fontSize: 48 }}>📱</div>
                      <p style={{ fontSize: 13, color: '#78716c', marginTop: 8 }}>Scan QR to pay ₹{total}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={
                    sending ||
                    (payMethod === 'cash' && (!cashIn || Number(cashIn) < total))
                  }
                  style={{
                    ...s.confirmBtn,
                    opacity: (sending || (payMethod === 'cash' && (!cashIn || Number(cashIn) < total))) ? 0.5 : 1,
                    cursor:  (sending || (payMethod === 'cash' && (!cashIn || Number(cashIn) < total))) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? '⏳ Processing...' : '✅ Confirm Payment'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#0f0e0d', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" },

  toast: {
    position: 'fixed', top: 20, right: 24, zIndex: 999,
    padding: '12px 20px', borderRadius: 12,
    fontSize: 13.5, fontWeight: 600,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    animation: 'slideDown 0.25s ease',
  },

  topbar: {
    height: 64, background: '#1a1614',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 24px',
    position: 'sticky', top: 0, zIndex: 100,
    flexShrink: 0,
  },
  topLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  logo:     { fontSize: 26 },
  appName:  { fontSize: 14, fontWeight: 700, color: '#fafaf9', letterSpacing: '-0.02em' },
  appSub:   { fontSize: 10.5, color: '#57534e' },

  tableSelector: { display: 'flex', alignItems: 'center', gap: 10 },
  tableLabel:    { fontSize: 12, color: '#57534e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' },
  tableRow:      { display: 'flex', gap: 6 },
  tableBtn: {
    width: 32, height: 32, borderRadius: 8,
    border: 'none', fontSize: 13, fontWeight: 500,
    transition: 'all 0.15s ease',
  },

  topRight:     { display: 'flex', alignItems: 'center', gap: 12 },
  cashierBadge: { display: 'flex', alignItems: 'center', gap: 10 },
  cashierAvatar:{
    width: 34, height: 34, borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: '#fff', fontSize: 14, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoutBtn: {
    padding: '6px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'transparent', color: '#a8a29e',
    fontSize: 12, cursor: 'pointer', fontWeight: 500,
  },
  qrNavBtn: {
    padding: '6px 14px', borderRadius: 8,
    border: '1px solid rgba(167,139,250,0.3)',
    background: 'rgba(167,139,250,0.08)', color: '#a78bfa',
    fontSize: 12, fontWeight: 600, textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: 4,
  },

  body: { display: 'flex', flex: 1, overflow: 'hidden' },

  /* Menu column */
  menuCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  menuTop: {
    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: '#1a1614',
  },

  lockedBanner: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
    color: '#22c55e', borderRadius: 10, padding: '8px 14px',
    fontSize: 13, fontWeight: 600, marginBottom: 12,
  },
  newOrderBtn: {
    padding: '4px 12px', borderRadius: 8, background: '#22c55e',
    color: '#000', border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 700,
  },

  searchWrap: { position: 'relative', marginBottom: 12 },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 },
  searchInput:{
    width: '100%', padding: '10px 36px',
    borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.05)', color: '#fafaf9',
    fontSize: 13, fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  },
  clearSearch:{
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: '#78716c', cursor: 'pointer', fontSize: 13,
  },
  catRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  catBtn: {
    padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500,
    transition: 'all 0.15s ease',
  },

  menuGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: 12, padding: 20, overflowY: 'auto', flex: 1,
    alignContent: 'start',
  },
  menuCard: {
    background: '#1c1917', borderRadius: 14, padding: '16px 14px',
    textAlign: 'center', position: 'relative',
    transition: 'all 0.15s ease',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  menuEmoji: { fontSize: 32, marginBottom: 6 },
  menuName:  { fontSize: 12.5, fontWeight: 600, color: '#fafaf9', lineHeight: 1.3 },
  menuCat:   { fontSize: 10.5, color: '#57534e' },
  menuPrice: { fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 },
  qtyBadge:  {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: '50%',
    background: '#f59e0b', color: '#000',
    fontSize: 11, fontWeight: 800,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  emptyMenu: { gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#57534e', fontSize: 14 },

  /* Cart column */
  cartCol: {
    width: 360, background: '#141210',
    display: 'flex', flexDirection: 'column',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
  },
  cartHeader: {
    padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    background: '#1a1614',
  },
  cartTitle: { fontSize: 15, fontWeight: 700, color: '#fafaf9', marginBottom: 3 },
  cartSub:   { fontSize: 12, color: '#57534e' },
  clearBtn:  {
    padding: '5px 12px', borderRadius: 8,
    border: '1px solid rgba(239,68,68,0.3)',
    background: 'rgba(239,68,68,0.08)', color: '#ef4444',
    fontSize: 11, fontWeight: 600, cursor: 'pointer',
  },
  sentPill: {
    padding: '4px 12px', borderRadius: 99,
    background: 'rgba(34,197,94,0.12)', color: '#22c55e',
    fontSize: 11, fontWeight: 700,
    border: '1px solid rgba(34,197,94,0.25)',
  },

  cartItems: { flex: 1, overflowY: 'auto', padding: '12px 0' },
  emptyCart: { textAlign: 'center', padding: '60px 20px' },
  cartItem:  {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)',
    transition: 'background 0.1s',
  },
  cartEmoji:    { fontSize: 20, flexShrink: 0 },
  cartItemName: { fontSize: 13, fontWeight: 600, color: '#fafaf9', marginBottom: 3 },
  cartItemPrice:{ fontSize: 11, color: '#57534e' },
  cartItemTotal:{ fontSize: 14, fontWeight: 700, color: '#f59e0b', flexShrink: 0, minWidth: 52, textAlign: 'right' },
  qtyControl:   { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  qtyBtn: {
    width: 24, height: 24, borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)', color: '#fafaf9',
    cursor: 'pointer', fontSize: 14, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyNum: { fontSize: 14, fontWeight: 700, color: '#fafaf9', minWidth: 20, textAlign: 'center' },

  summary: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 13, color: '#78716c', marginBottom: 8,
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 18, fontWeight: 800, color: '#fafaf9',
    paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)',
    marginTop: 4, marginBottom: 16,
  },
  payBtn: {
    width: '100%', padding: '13px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
    color: '#000', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', marginBottom: 8,
    boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
  },
  kitchenBtn:{
    width: '100%', padding: '11px', borderRadius: 12,
    border: '1px solid', fontSize: 13, fontWeight: 600,
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
  },

  /* Payment Modal */
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: 24,
  },
  modal: {
    background: '#fff', borderRadius: 24, padding: '32px',
    width: '100%', maxWidth: 440,
    boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
  },
  modalHead: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
  },
  modalTitle:  { fontSize: 18, fontWeight: 800, color: '#1c1917', letterSpacing: '-0.02em' },
  closeBtn: {
    width: 32, height: 32, borderRadius: '50%', border: 'none',
    background: '#f5f5f4', cursor: 'pointer', fontSize: 14, color: '#44403c',
  },

  kitchenConfirmed: {
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 10, padding: '8px 14px',
    fontSize: 12.5, fontWeight: 600, color: '#16a34a',
    marginBottom: 16,
  },

  totalBanner: {
    background: '#fafaf9', borderRadius: 14, padding: '16px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    marginBottom: 20, border: '1px solid #f0eeed',
  },
  methodRow: { display: 'flex', gap: 10, marginBottom: 20 },
  methodBtn: {
    flex: 1, padding: '12px 8px', borderRadius: 12,
    border: '1.5px solid', cursor: 'pointer',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 5,
    transition: 'all 0.15s ease',
    fontFamily: 'Inter, sans-serif',
  },
  cashSection:  { marginBottom: 20 },
  cashLabel:    { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#44403c', marginBottom: 8 },
  cashInput:    {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid #e7e5e4', fontSize: 20, fontWeight: 700,
    color: '#1c1917', background: '#fafaf9', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  },
  changeBox: {
    marginTop: 10, padding: '10px 16px', borderRadius: 10,
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    fontSize: 14, color: '#16a34a',
  },
  qrBox:         { marginBottom: 20 },
  qrPlaceholder: {
    background: '#fafaf9', border: '2px dashed #e7e5e4',
    borderRadius: 14, padding: '24px', textAlign: 'center',
  },
  confirmBtn: {
    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #1c1917, #292524)',
    color: '#fff', fontSize: 15, fontWeight: 700,
    boxShadow: '0 4px 16px rgba(28,25,23,0.25)',
    fontFamily: 'Inter, sans-serif',
  },
  successCircle: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff', fontSize: 36, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto', boxShadow: '0 8px 32px rgba(34,197,94,0.35)',
  },
};
