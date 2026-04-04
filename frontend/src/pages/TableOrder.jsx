import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API = 'http://localhost:5000/api';
const CATS = ['All', 'Coffee', 'Food', 'Snacks', 'Drinks', 'Other'];

/* ── Fake Payment Modal ── */
function FakePaymentModal({ amount, onSuccess, onClose }) {
  const [step, setStep]     = useState('form'); // form | processing | success
  const [card, setCard]     = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [err, setErr]       = useState('');

  const handlePay = (e) => {
    e.preventDefault();
    if (card.number.replace(/\s/g,'').length < 16) return setErr('Enter a valid 16-digit card number');
    if (!card.name.trim()) return setErr('Enter cardholder name');
    if (!card.expiry) return setErr('Enter expiry date');
    if (card.cvv.length < 3) return setErr('Enter valid CVV');
    setErr(''); setStep('processing');
    setTimeout(() => { setStep('success'); setTimeout(onSuccess, 1500); }, 2000);
  };

  const fmt = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:20 }}>
      <div style={{ background:'#fff',borderRadius:24,padding:'36px',width:'100%',maxWidth:420,boxShadow:'0 32px 80px rgba(0,0,0,0.3)',fontFamily:"'Inter',sans-serif" }}>

        {step === 'form' && (
          <>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
              <div>
                <div style={{ fontSize:11,fontWeight:700,color:'#a8a29e',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4 }}>Secure Payment</div>
                <div style={{ fontSize:22,fontWeight:800,color:'#1c1917',letterSpacing:'-0.02em' }}>₹{amount}</div>
              </div>
              <div style={{ fontSize:28 }}>💳</div>
            </div>

            {/* Card preview */}
            <div style={{ background:'linear-gradient(135deg,#1c1917 0%,#44403c 100%)',borderRadius:16,padding:'22px 24px',marginBottom:24,color:'#fff',position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',top:-20,right:-20,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,0.05)' }}/>
              <div style={{ position:'absolute',bottom:-30,right:40,width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,0.04)' }}/>
              <div style={{ fontSize:12,opacity:0.5,marginBottom:16,letterSpacing:'0.1em' }}>CARD NUMBER</div>
              <div style={{ fontSize:18,fontWeight:700,letterSpacing:'0.15em',marginBottom:20,fontFamily:'monospace' }}>
                {card.number || '•••• •••• •••• ••••'}
              </div>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,opacity:0.6 }}>
                <div><div style={{ marginBottom:2,textTransform:'uppercase',letterSpacing:'0.1em',fontSize:9 }}>Cardholder</div><div style={{ fontWeight:600,fontSize:13 }}>{card.name||'YOUR NAME'}</div></div>
                <div><div style={{ marginBottom:2,textTransform:'uppercase',letterSpacing:'0.1em',fontSize:9 }}>Expires</div><div style={{ fontWeight:600,fontSize:13 }}>{card.expiry||'MM/YY'}</div></div>
              </div>
            </div>

            <form onSubmit={handlePay}>
              {[
                { label:'Card Number', key:'number', ph:'1234 5678 9012 3456', type:'text', transform:(v)=>fmt(v) },
                { label:'Cardholder Name', key:'name', ph:'John Doe', type:'text' },
              ].map(f=>(
                <div key={f.key} style={{ marginBottom:14 }}>
                  <label style={{ display:'block',fontSize:12,fontWeight:600,color:'#44403c',marginBottom:6 }}>{f.label}</label>
                  <input
                    type={f.type} placeholder={f.ph} value={card[f.key]}
                    onChange={e=>setCard(p=>({...p,[f.key]:f.transform?f.transform(e.target.value):e.target.value}))}
                    maxLength={f.key==='number'?19:undefined}
                    style={{ width:'100%',padding:'11px 14px',borderRadius:10,border:'1.5px solid #e7e5e4',fontSize:14,color:'#1c1917',background:'#fafaf9',fontFamily:'Inter,sans-serif',boxSizing:'border-box' }}
                  />
                </div>
              ))}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16 }}>
                <div>
                  <label style={{ display:'block',fontSize:12,fontWeight:600,color:'#44403c',marginBottom:6 }}>Expiry (MM/YY)</label>
                  <input type="month" value={card.expiry} onChange={e=>setCard(p=>({...p,expiry:e.target.value}))} style={{ width:'100%',padding:'11px 14px',borderRadius:10,border:'1.5px solid #e7e5e4',fontSize:14,background:'#fafaf9',boxSizing:'border-box' }}/>
                </div>
                <div>
                  <label style={{ display:'block',fontSize:12,fontWeight:600,color:'#44403c',marginBottom:6 }}>CVV</label>
                  <input type="password" placeholder="•••" maxLength={4} value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,'')}))} style={{ width:'100%',padding:'11px 14px',borderRadius:10,border:'1.5px solid #e7e5e4',fontSize:14,background:'#fafaf9',boxSizing:'border-box' }}/>
                </div>
              </div>
              {err&&<div style={{ background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#dc2626',marginBottom:14 }}>⚠ {err}</div>}
              <button type="submit" style={{ width:'100%',padding:'14px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#1c1917,#292524)',color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:10 }}>
                🔒 Pay ₹{amount}
              </button>
              <button type="button" onClick={onClose} style={{ width:'100%',padding:'11px',borderRadius:10,border:'1.5px solid #e7e5e4',background:'transparent',color:'#78716c',fontSize:13,cursor:'pointer' }}>
                Cancel
              </button>
              <p style={{ textAlign:'center',fontSize:11,color:'#a8a29e',marginTop:12 }}>🔐 256-bit SSL · Demo Mode</p>
            </form>
          </>
        )}

        {step === 'processing' && (
          <div style={{ textAlign:'center',padding:'32px 0' }}>
            <div style={{ width:60,height:60,borderRadius:'50%',border:'4px solid #f0eeed',borderTopColor:'#1c1917',display:'inline-block',animation:'spin 0.8s linear infinite',marginBottom:24 }}/>
            <div style={{ fontSize:18,fontWeight:700,color:'#1c1917',marginBottom:8 }}>Processing Payment…</div>
            <div style={{ fontSize:13,color:'#78716c' }}>Please wait, do not refresh</div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign:'center',padding:'32px 0' }}>
            <div style={{ width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 20px',boxShadow:'0 8px 24px rgba(34,197,94,0.35)' }}>✓</div>
            <div style={{ fontSize:20,fontWeight:800,color:'#1c1917',marginBottom:6 }}>Payment Successful!</div>
            <div style={{ fontSize:13,color:'#78716c' }}>Placing your order now...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TableOrder() {
  const { tableId } = useParams();
  const table = parseInt(tableId, 10) || 1;

  const [menu, setMenu]         = useState([]);
  const [loadingMenu, setLM]    = useState(true);
  const [step, setStep]         = useState('menu');
  const [cat, setCat]           = useState('All');
  const [cart, setCart]         = useState([]);
  const [guestName, setName]    = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [placing, setPlacing]   = useState(false);
  const [orderId, setOrderId]   = useState(null);
  const [orderNo, setOrderNo]   = useState(null);
  const [error, setError]       = useState('');
  const [showFakePayment, setShowFP] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API}/products`);
        const data = await res.json();
        if (Array.isArray(data)) setMenu(data);
      } catch(e) { console.error(e); } finally { setLM(false); }
    })();
  }, []);

  const availCats = ['All', ...CATS.filter(c => c !== 'All' && menu.some(m => m.category === c))];
  const filtered  = cat === 'All' ? menu : menu.filter(m => m.category === cat);

  const addToCart    = (item) => setCart(prev => { const ex = prev.find(c=>c._id===item._id); return ex ? prev.map(c=>c._id===item._id?{...c,qty:c.qty+1}:c) : [...prev,{...item,qty:1}]; });
  const removeFromCart = (id) => setCart(prev => prev.map(c=>c._id===id?{...c,qty:c.qty-1}:c).filter(c=>c.qty>0));
  const getQty       = (id) => cart.find(c=>c._id===id)?.qty||0;

  const subtotal  = cart.reduce((s,c)=>s+c.price*c.qty, 0);
  const gst       = Math.round(subtotal * 0.05);
  const total     = subtotal + gst;
  const cartCount = cart.reduce((s,c)=>s+c.qty, 0);

  const placeOrder = async (method = payMethod) => {
    if (cart.length === 0 || placing) return;
    setPlacing(true); setError('');
    try {
      const res = await fetch(`${API}/orders/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(c=>({ id: c._id, name: c.name, qty: c.qty, price: c.price, emoji: c.emoji||'🍽️', cat: c.category })),
          tableNumber: table, subtotal, gst, total,
          guestName: guestName.trim() || `Table ${table} Guest`,
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (res.ok) { setOrderId(data._id); setOrderNo(data.orderNumber); setStep('confirm'); }
      else setError(data.message || 'Failed to place order.');
    } catch { setError('Network error. Is the server running?'); }
    finally { setPlacing(false); }
  };

  return (
    <div style={s.page}>
      {showFakePayment && (
        <FakePaymentModal
          amount={total}
          onSuccess={() => { setShowFP(false); placeOrder('card'); }}
          onClose={() => setShowFP(false)}
        />
      )}

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLogo}>
          <span style={{ fontSize:26 }}>☕</span>
          <div><div style={s.logoName}>POS Café</div><div style={s.logoSub}>Table {table}</div></div>
        </div>
        <span style={s.tableBadge}>🪑 Table {table}</span>
      </header>

      {/* ══ MENU STEP ══ */}
      {step === 'menu' && (
        <div style={s.body}>
          <div style={s.menuCol}>
            <div style={s.hero}>
              <h1 style={s.heroTitle}>Welcome to POS Café! ☕</h1>
              <p style={s.heroSub}>Browse our menu and add items to your order.</p>
            </div>
            <div style={s.catRow}>
              {availCats.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{ ...s.catBtn, background: cat===c?'#7c3aed':'#fff', color:cat===c?'#fff':'#44403c', borderColor:cat===c?'#7c3aed':'#e7e5e4' }}>{c}</button>
              ))}
            </div>
            {loadingMenu ? (
              <div style={{ textAlign:'center',padding:'60px 0',color:'#78716c' }}>Loading menu…</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center',padding:'60px 0' }}><div style={{ fontSize:48 }}>🍽️</div><p style={{ color:'#78716c',marginTop:12 }}>No items in this category</p></div>
            ) : (
              <div style={s.menuGrid}>
                {filtered.map(item => {
                  const qty = getQty(item._id);
                  return (
                    <div key={item._id} style={{ ...s.menuCard, boxShadow: qty>0?'0 0 0 2.5px #7c3aed,0 4px 16px rgba(124,58,237,0.12)':'0 2px 12px rgba(0,0,0,0.07)' }}>
                      <div style={s.menuCardTop}>
                        <span style={s.menuEmoji}>{item.emoji||'🍽️'}</span>
                        <span style={s.menuCatTag}>{item.category}</span>
                      </div>
                      <div style={s.menuCardName}>{item.name}</div>
                      {item.description&&<div style={s.menuCardDesc}>{item.description}</div>}
                      <div style={s.menuCardFooter}>
                        <span style={s.menuPrice}>₹{item.price}</span>
                        {qty===0 ? (
                          <button onClick={()=>addToCart(item)} style={s.addBtn}>+ Add</button>
                        ) : (
                          <div style={s.qtyControl}>
                            <button onClick={()=>removeFromCart(item._id)} style={s.qtyBtn}>−</button>
                            <span style={s.qtyNum}>{qty}</span>
                            <button onClick={()=>addToCart(item)} style={s.qtyBtn}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart */}
          <div style={s.cartCol}>
            <div style={s.cartCard}>
              <div style={s.cartHead}>
                <h2 style={s.cartTitle}>Your Order</h2>
                {cartCount>0&&<span style={s.cartCountBadge}>{cartCount} item{cartCount>1?'s':''}</span>}
              </div>
              <div style={s.nameWrap}>
                <label style={s.nameLabel}>Your Name (optional)</label>
                <input value={guestName} onChange={e=>setName(e.target.value)} placeholder="e.g. Rahul" style={s.nameInput} maxLength={40}/>
              </div>
              {cart.length===0 ? (
                <div style={s.cartEmpty}><div style={{ fontSize:44,marginBottom:12 }}>🛒</div><p style={{ color:'#78716c',fontSize:14 }}>Your cart is empty</p></div>
              ) : (
                <>
                  <div style={s.cartItems}>
                    {cart.map(c=>(
                      <div key={c._id} style={s.cartItem}>
                        <span style={{ fontSize:18 }}>{c.emoji||'🍽️'}</span>
                        <div style={{ flex:1 }}><div style={s.cartItemName}>{c.name}</div><div style={s.cartItemSub}>₹{c.price} × {c.qty}</div></div>
                        <span style={s.cartItemTotal}>₹{c.price*c.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div style={s.divider}/>
                  <div style={s.summaryRows}>
                    <div style={s.summaryRow}><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div style={s.summaryRow}><span>GST (5%)</span><span>₹{gst}</span></div>
                    <div style={{ ...s.summaryRow,...s.totalRow }}><span>Total</span><span>₹{total}</span></div>
                  </div>
                  <button onClick={()=>setStep('payment')} style={s.checkoutBtn}>Continue to Payment →</button>
                  <button onClick={()=>setCart([])} style={s.clearBtn}>Clear Cart</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ PAYMENT STEP ══ */}
      {step === 'payment' && (
        <div style={s.centerPage}>
          <div style={s.payCard}>
            <button onClick={()=>setStep('menu')} style={s.backBtn}>← Back to Menu</button>
            <h2 style={s.payTitle}>Choose Payment</h2>
            <p style={s.paySub}>Table {table} — {guestName||'Guest'}</p>
            <div style={s.amountBanner}>
              <span style={{ fontSize:13,color:'#78716c' }}>Amount to Pay</span>
              <span style={s.amountFig}>₹{total}</span>
            </div>
            <div style={s.orderMini}>
              {cart.map(c=>(
                <div key={c._id} style={s.orderMiniRow}><span>{c.emoji||'🍽️'} {c.name} × {c.qty}</span><span style={{ color:'#7c3aed',fontWeight:600 }}>₹{c.price*c.qty}</span></div>
              ))}
            </div>

            {/* Payment methods */}
            <div style={s.methodGrid}>
              {[
                { key:'cash',    icon:'💵', label:'Cash',        sub:'Pay at counter' },
                { key:'card',    icon:'💳', label:'Card',        sub:'Pay at counter' },
                { key:'fake_pay',icon:'🏦', label:'Pay Now',     sub:'Card checkout'  },
                { key:'upi',     icon:'📱', label:'UPI',         sub:'Pay at counter' },
              ].map(m=>(
                <button key={m.key} onClick={()=>setPayMethod(m.key)} style={{ ...s.methodBtn, borderColor:payMethod===m.key?'#7c3aed':'#e7e5e4', background:payMethod===m.key?'#f5f3ff':'#fff', boxShadow:payMethod===m.key?'0 0 0 3px rgba(124,58,237,0.12)':'none' }}>
                  <span style={{ fontSize:26 }}>{m.icon}</span>
                  <span style={{ fontSize:13,fontWeight:700,color:'#1c1917' }}>{m.label}</span>
                  <span style={{ fontSize:11,color:'#78716c' }}>{m.sub}</span>
                </button>
              ))}
            </div>

            {(payMethod==='cash'||payMethod==='card'||payMethod==='upi')&&(
              <div style={s.counterBox}>
                <div style={{ fontSize:32,marginBottom:8 }}>{payMethod==='cash'?'💵':payMethod==='card'?'💳':'📱'}</div>
                <div style={{ fontWeight:700,fontSize:15,color:'#1c1917',marginBottom:4 }}>
                  {payMethod==='cash'?'Pay Cash at Counter':payMethod==='card'?'Swipe Card at Counter':'Show UPI at Counter'}
                </div>
                <div style={{ fontSize:13,color:'#78716c' }}>Your order will be sent to the kitchen. Pay ₹{total} at the counter.</div>
              </div>
            )}

            {payMethod==='fake_pay'&&(
              <div style={{ background:'#f5f3ff',border:'1.5px solid #e9d5ff',borderRadius:14,padding:'20px',textAlign:'center',marginBottom:22 }}>
                <div style={{ fontSize:32,marginBottom:8 }}>🏦</div>
                <div style={{ fontWeight:700,fontSize:15,color:'#1c1917',marginBottom:4 }}>Online Card Payment</div>
                <div style={{ fontSize:13,color:'#78716c' }}>Click below to open secure card checkout</div>
              </div>
            )}

            {error&&<div style={s.errorBox}>⚠ {error}</div>}

            <button
              onClick={()=>{ if(payMethod==='fake_pay'){setShowFP(true);}else{placeOrder(payMethod);} }}
              disabled={placing}
              style={{ ...s.placeBtn,opacity:placing?0.55:1,cursor:placing?'not-allowed':'pointer' }}
            >
              {placing?'⏳ Placing Order...':(payMethod==='fake_pay'?'💳 Open Card Checkout':'🍳 Place Order →')}
            </button>
          </div>
        </div>
      )}

      {/* ══ CONFIRM STEP ══ */}
      {step === 'confirm' && (
        <div style={s.centerPage}>
          <div style={s.confirmCard}>
            <div style={s.successRing}>✓</div>
            <h2 style={s.confirmTitle}>Order Placed! 🎉</h2>
            <p style={s.confirmSub}>Your order is being prepared.</p>
            <div style={s.confirmDetails}>
              {orderNo&&<div style={s.confirmRow}><span style={{ color:'#78716c' }}>Order #</span><span style={{ fontWeight:700,color:'#7c3aed',fontSize:18 }}>{orderNo}</span></div>}
              <div style={s.confirmRow}><span style={{ color:'#78716c' }}>Table</span><span style={{ fontWeight:700,color:'#1c1917' }}>Table {table}</span></div>
              <div style={s.confirmRow}><span style={{ color:'#78716c' }}>Payment</span><span style={{ fontWeight:600,color:'#16a34a',textTransform:'capitalize' }}>{payMethod==='fake_pay'?'💳 Card Paid':payMethod==='cash'?'💵 Cash at Counter':payMethod==='upi'?'📱 UPI at Counter':'💳 Card at Counter'}</span></div>
              <div style={s.confirmRow}><span style={{ color:'#78716c' }}>Total</span><span style={{ fontWeight:800,fontSize:20,color:'#1c1917' }}>₹{total}</span></div>
            </div>
            <div style={s.waitBox}><span style={{ fontSize:20 }}>⏱</span><span style={{ fontSize:13,color:'#78716c' }}>Estimated: <strong style={{ color:'#1c1917' }}>10–15 min</strong></span></div>
            <button onClick={()=>{setCart([]);setStep('menu');setOrderId(null);setOrderNo(null);}} style={s.newOrderBtn}>+ Order More Items</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'linear-gradient(145deg,#faf5ff 0%,#f0f9ff 100%)', fontFamily:"'Inter',sans-serif" },
  header: { background:'#fff', borderBottom:'1px solid #e9d5ff', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 16px rgba(124,58,237,0.07)' },
  headerLogo: { display:'flex', alignItems:'center', gap:12 },
  logoName: { fontSize:15, fontWeight:800, color:'#1c1917', letterSpacing:'-0.02em' },
  logoSub:  { fontSize:11, color:'#7c3aed', fontWeight:600 },
  tableBadge: { background:'#f5f3ff', color:'#7c3aed', border:'1.5px solid #e9d5ff', borderRadius:99, padding:'6px 16px', fontSize:13, fontWeight:700 },
  body: { display:'flex', gap:24, maxWidth:1200, margin:'0 auto', padding:'28px 24px 48px' },
  menuCol: { flex:1, minWidth:0 },
  hero: { background:'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)', borderRadius:18, padding:'28px 32px', marginBottom:22, color:'#fff' },
  heroTitle: { fontSize:24, fontWeight:800, marginBottom:6, letterSpacing:'-0.02em' },
  heroSub:   { fontSize:14, opacity:0.85 },
  catRow: { display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' },
  catBtn: { padding:'7px 18px', borderRadius:99, border:'1.5px solid', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .15s' },
  menuGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 },
  menuCard: { background:'#fff', borderRadius:16, padding:'18px', transition:'all .15s' },
  menuCardTop: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  menuEmoji: { fontSize:30 },
  menuCatTag: { fontSize:10, background:'#f3e8ff', color:'#7c3aed', padding:'2px 8px', borderRadius:20, fontWeight:600 },
  menuCardName: { fontSize:14, fontWeight:700, color:'#1c1917', marginBottom:4 },
  menuCardDesc: { fontSize:12, color:'#78716c', lineHeight:1.5, marginBottom:14 },
  menuCardFooter: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  menuPrice: { fontSize:16, fontWeight:800, color:'#7c3aed' },
  addBtn: { padding:'6px 14px', borderRadius:9, border:'none', background:'#7c3aed', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' },
  qtyControl: { display:'flex', alignItems:'center', gap:6, background:'#f3e8ff', borderRadius:8, padding:'3px 5px' },
  qtyBtn: { width:26, height:26, borderRadius:6, border:'none', background:'#7c3aed', color:'#fff', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 },
  qtyNum: { fontSize:14, fontWeight:700, color:'#7c3aed', minWidth:18, textAlign:'center' },
  cartCol: { width:320, flexShrink:0 },
  cartCard: { background:'#fff', borderRadius:20, padding:'24px', boxShadow:'0 8px 32px rgba(124,58,237,0.10)', position:'sticky', top:80 },
  cartHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  cartTitle: { fontSize:17, fontWeight:800, color:'#1c1917' },
  cartCountBadge: { background:'#7c3aed', color:'#fff', fontSize:12, padding:'3px 10px', borderRadius:20, fontWeight:600 },
  nameWrap:  { marginBottom:14 },
  nameLabel: { display:'block', fontSize:12, fontWeight:600, color:'#44403c', marginBottom:6 },
  nameInput: { width:'100%', padding:'9px 13px', borderRadius:10, border:'1.5px solid #e9d5ff', fontSize:13, color:'#1c1917', fontFamily:'Inter,sans-serif', outline:'none', boxSizing:'border-box' },
  cartEmpty: { textAlign:'center', padding:'32px 0' },
  cartItems: { display:'flex', flexDirection:'column', gap:10, marginBottom:14 },
  cartItem:  { display:'flex', alignItems:'center', gap:10 },
  cartItemName: { fontSize:13, fontWeight:600, color:'#1c1917' },
  cartItemSub:  { fontSize:11, color:'#78716c', marginTop:2 },
  cartItemTotal:{ fontSize:14, fontWeight:700, color:'#7c3aed', flexShrink:0 },
  divider: { height:1, background:'#f3e8ff', margin:'14px 0' },
  summaryRows: { display:'flex', flexDirection:'column', gap:8, marginBottom:18 },
  summaryRow:  { display:'flex', justifyContent:'space-between', fontSize:13, color:'#78716c' },
  totalRow:    { fontSize:16, fontWeight:800, color:'#1c1917', paddingTop:8, borderTop:'1px solid #f3e8ff', marginTop:4 },
  checkoutBtn: { width:'100%', padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8, boxShadow:'0 4px 16px rgba(124,58,237,0.28)' },
  clearBtn:    { width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid #e9d5ff', background:'transparent', color:'#7c3aed', fontSize:13, cursor:'pointer' },
  centerPage: { display:'flex', justifyContent:'center', padding:'40px 24px 60px' },
  payCard: { background:'#fff', borderRadius:24, padding:'36px', width:'100%', maxWidth:520, boxShadow:'0 16px 64px rgba(124,58,237,0.12)' },
  backBtn: { background:'none', border:'none', color:'#7c3aed', fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:24 },
  payTitle: { fontSize:24, fontWeight:800, color:'#1c1917', letterSpacing:'-0.02em', marginBottom:4 },
  paySub:   { fontSize:14, color:'#78716c', marginBottom:24 },
  amountBanner: { background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius:16, padding:'20px 24px', display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20, border:'1.5px solid #e9d5ff' },
  amountFig: { fontSize:40, fontWeight:900, color:'#7c3aed', letterSpacing:'-0.04em' },
  orderMini: { background:'#fafaf9', borderRadius:12, padding:'14px 16px', marginBottom:22, display:'flex', flexDirection:'column', gap:8 },
  orderMiniRow: { display:'flex', justifyContent:'space-between', fontSize:13, color:'#44403c' },
  methodGrid: { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:22 },
  methodBtn:  { padding:'16px 8px', borderRadius:14, border:'2px solid', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:'all .15s', fontFamily:'Inter,sans-serif' },
  counterBox: { background:'#f0fdf4', border:'1.5px solid #bbf7d0', borderRadius:14, padding:'20px', textAlign:'center', marginBottom:22 },
  errorBox: { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#dc2626', marginBottom:16 },
  placeBtn: { width:'100%', padding:'15px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:16, fontWeight:800, boxShadow:'0 6px 20px rgba(124,58,237,0.32)', fontFamily:'Inter,sans-serif', letterSpacing:'-0.01em' },
  confirmCard: { background:'#fff', borderRadius:24, padding:'48px 36px', width:'100%', maxWidth:440, textAlign:'center', boxShadow:'0 16px 64px rgba(124,58,237,0.12)' },
  successRing: { width:90, height:90, borderRadius:'50%', margin:'0 auto 20px', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:40, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 32px rgba(124,58,237,0.36)' },
  confirmTitle: { fontSize:26, fontWeight:900, color:'#1c1917', letterSpacing:'-0.03em', marginBottom:6 },
  confirmSub:   { fontSize:15, color:'#78716c', marginBottom:28 },
  confirmDetails: { background:'#fafaf9', borderRadius:14, padding:'18px 20px', textAlign:'left', marginBottom:20, border:'1px solid #f0eeed' },
  confirmRow: { display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:14, padding:'8px 0', borderBottom:'1px solid #f0eeed' },
  waitBox: { display:'flex', alignItems:'center', gap:10, justifyContent:'center', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, padding:'12px', marginBottom:24 },
  newOrderBtn: { width:'100%', padding:'13px', borderRadius:12, border:'2px solid #7c3aed', background:'transparent', color:'#7c3aed', fontSize:14, fontWeight:700, cursor:'pointer' },
};
