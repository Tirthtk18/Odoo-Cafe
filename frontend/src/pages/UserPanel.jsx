import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

const STATUS_CONFIG = {
  new:       { label: 'Order Received',  icon: '🟡', color: '#f59e0b', bg: '#fffbeb', desc: 'Your order is queued', pct: 15 },
  preparing: { label: 'Being Prepared',  icon: '🟠', color: '#f97316', bg: '#fff7ed', desc: 'Kitchen is working on it', pct: 50 },
  ready:     { label: 'Ready!',           icon: '🟢', color: '#22c55e', bg: '#f0fdf4', desc: 'Your order is ready!', pct: 90 },
  served:    { label: 'Served',           icon: '✅', color: '#6366f1', bg: '#eef2ff', desc: 'Enjoy your meal!', pct: 100 },
};

/* ─── UPI QR Modal step ─── */
function UPIStep({ amount, onPaid, onBack }) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 14, padding: '14px 0 8px', marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Amount to Pay</div>
        <div style={{ color: '#fff', fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em' }}>₹{amount}</div>
      </div>
      <div style={{ background: '#fff', border: '2px solid #e9d5ff', borderRadius: 16, padding: 14, display: 'inline-block', marginBottom: 12 }}>
        <img src="/upi_qr.png" alt="UPI QR Code" style={{ width: 200, height: 200, display: 'block' }} />
      </div>
      <div style={{ fontSize: 13, color: '#44403c', marginBottom: 4, fontWeight: 600 }}>Scan with any UPI app</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
        {['GPay','PhonePe','Paytm','BHIM'].map(a => (
          <span key={a} style={{ fontSize: 11, background: '#f3e8ff', color: '#7c3aed', padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>{a}</span>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#78716c', marginBottom: 18 }}>
        UPI ID: <strong style={{ color: '#7c3aed' }}>poscafe@upi</strong>
      </div>
      {!confirmed ? (
        <button onClick={() => setConfirmed(true)} style={pm.confirmBtn}>
          ✅ I've Completed the Payment
        </button>
      ) : (
        <div>
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'12px', marginBottom:12, fontSize:13, color:'#16a34a', fontWeight:600 }}>
            🎉 Payment confirmed! Placing your order…
          </div>
          <button onClick={() => onPaid('upi')} style={pm.confirmBtn}>Place Order →</button>
        </div>
      )}
      <button onClick={onBack} style={{ ...pm.backBtn, marginTop: 10 }}>← Change Method</button>
    </div>
  );
}

/* ─── Cash Step ─── */
function CashStep({ amount, onConfirm, onBack }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 12 }}>💵</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', marginBottom: 6 }}>Pay at Counter</div>
      <div style={{ fontSize: 13, color: '#78716c', marginBottom: 20, lineHeight: 1.6 }}>
        Please pay <strong style={{ color: '#7c3aed' }}>₹{amount}</strong> in cash at the counter after placing your order.
        Our staff will collect the payment.
      </div>
      <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: 'left' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>📋 Instructions</div>
        {['Show this order confirmation to the cashier','Keep your order receipt handy','Pay the exact amount if possible'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#78350f', marginBottom: 4 }}>
            <span style={{ width: 18, height: 18, background: '#fbbf24', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      <button onClick={() => onConfirm('cash')} style={pm.confirmBtn}>✅ Confirm Cash Order</button>
      <button onClick={onBack} style={{ ...pm.backBtn, marginTop: 10 }}>← Change Method</button>
    </div>
  );
}

/* ─── Card Step ─── */
function CardStep({ amount, onPaid, onBack }) {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [step, setStep] = useState('form'); // form | processing | done
  const [err, setErr] = useState('');
  const fmt = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();

  const handlePay = (e) => {
    e.preventDefault();
    if (card.number.replace(/\s/g,'').length < 16) return setErr('Enter a valid 16-digit card number');
    if (!card.name.trim()) return setErr('Enter cardholder name');
    if (!card.expiry) return setErr('Enter expiry date');
    if (card.cvv.length < 3) return setErr('Enter valid CVV');
    setErr(''); setStep('processing');
    setTimeout(() => { setStep('done'); setTimeout(() => onPaid('card'), 1500); }, 2200);
  };

  if (step === 'processing') return (
    <div style={{ textAlign:'center', padding:'40px 0' }}>
      <div style={{ width:52,height:52,border:'4px solid #f0eeed',borderTopColor:'#7c3aed',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite',marginBottom:20 }}/>
      <div style={{ fontSize:18,fontWeight:700,color:'#1c1917',marginBottom:6 }}>Processing Payment…</div>
      <div style={{ fontSize:13,color:'#78716c' }}>Please don't close this window</div>
    </div>
  );
  if (step === 'done') return (
    <div style={{ textAlign:'center', padding:'32px 0' }}>
      <div style={{ width:70,height:70,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 16px',boxShadow:'0 8px 24px rgba(34,197,94,0.3)' }}>✓</div>
      <div style={{ fontSize:20,fontWeight:800,color:'#1c1917',marginBottom:4 }}>Payment Successful!</div>
      <div style={{ fontSize:13,color:'#78716c' }}>Placing your order now…</div>
    </div>
  );

  return (
    <div>
      {/* Card Preview */}
      <div style={{ background:'linear-gradient(135deg,#1c1917,#44403c)',borderRadius:14,padding:'20px 22px',marginBottom:20,color:'#fff',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.05)' }}/>
        <div style={{ fontSize:10,opacity:0.5,marginBottom:12,letterSpacing:'0.1em',textTransform:'uppercase' }}>Card Number</div>
        <div style={{ fontSize:17,fontWeight:700,letterSpacing:'0.15em',marginBottom:16,fontFamily:'monospace' }}>
          {card.number || '•••• •••• •••• ••••'}
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,opacity:0.7 }}>
          <div><div style={{ fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2 }}>Cardholder</div><div style={{ fontWeight:700,fontSize:13 }}>{card.name||'YOUR NAME'}</div></div>
          <div><div style={{ fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2 }}>Expires</div><div style={{ fontWeight:700,fontSize:13 }}>{card.expiry||'MM/YY'}</div></div>
          <div style={{ textAlign:'right' }}><div style={{ fontSize:9,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2 }}>Amount</div><div style={{ fontWeight:700,fontSize:13 }}>₹{amount}</div></div>
        </div>
      </div>
      <form onSubmit={handlePay}>
        <div style={pm.field}><label style={pm.label}>Card Number</label>
          <input placeholder="1234 5678 9012 3456" value={card.number} onChange={e=>setCard(p=>({...p,number:fmt(e.target.value)}))} maxLength={19} style={pm.input}/>
        </div>
        <div style={pm.field}><label style={pm.label}>Cardholder Name</label>
          <input placeholder="John Doe" value={card.name} onChange={e=>setCard(p=>({...p,name:e.target.value}))} style={pm.input}/>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
          <div style={pm.field}><label style={pm.label}>Expiry</label>
            <input type="month" value={card.expiry} onChange={e=>setCard(p=>({...p,expiry:e.target.value}))} style={pm.input}/>
          </div>
          <div style={pm.field}><label style={pm.label}>CVV</label>
            <input type="password" placeholder="•••" maxLength={4} value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/g,'')}))} style={pm.input}/>
          </div>
        </div>
        {err && <div style={pm.errBox}>⚠ {err}</div>}
        <button type="submit" style={pm.confirmBtn}>🔒 Pay ₹{amount}</button>
        <p style={{ textAlign:'center',fontSize:11,color:'#a8a29e',marginTop:8 }}>256-bit SSL Encrypted · Demo Mode</p>
      </form>
      <button onClick={onBack} style={pm.backBtn}>← Change Method</button>
    </div>
  );
}

/* ─── Payment Modal ─── */
function PaymentModal({ amount, onSuccess, onClose }) {
  const [method, setMethod] = useState(null);

  const METHODS = [
    { key:'cash', icon:'💵', label:'Cash', sub:'Pay at counter', color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
    { key:'upi',  icon:'📱', label:'UPI / QR', sub:'Scan QR to pay', color:'#4f46e5', bg:'#eef2ff', border:'#c7d2fe' },
    { key:'card', icon:'💳', label:'Debit / Credit Card', sub:'Secure card checkout', color:'#7c3aed', bg:'#f5f3ff', border:'#e9d5ff' },
  ];

  return (
    <div style={pm.overlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={pm.box} className="anim-popIn">
        <div style={pm.head}>
          <div>
            <div style={pm.subLabel}>Amount Due</div>
            <div style={pm.amount}>₹{amount}</div>
          </div>
          <button onClick={onClose} style={pm.closeX}>✕</button>
        </div>

        {!method && (
          <>
            <div style={{ fontSize:13,fontWeight:700,color:'#44403c',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.06em' }}>Choose Payment Method</div>
            <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:4 }}>
              {METHODS.map(m => (
                <button key={m.key} onClick={() => setMethod(m.key)}
                  style={{ display:'flex',alignItems:'center',gap:16,padding:'16px 18px',borderRadius:14,border:`2px solid ${m.border}`,background:m.bg,cursor:'pointer',textAlign:'left',transition:'all .15s',fontFamily:'Inter,sans-serif' }}>
                  <span style={{ fontSize:28 }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:m.color }}>{m.label}</div>
                    <div style={{ fontSize:11,color:'#78716c',marginTop:2 }}>{m.sub}</div>
                  </div>
                  <span style={{ fontSize:18,color:m.color }}>→</span>
                </button>
              ))}
            </div>
          </>
        )}

        {method === 'cash' && <CashStep amount={amount} onConfirm={m => onSuccess(m)} onBack={() => setMethod(null)} />}
        {method === 'upi'  && <UPIStep  amount={amount} onPaid={m => onSuccess(m)} onBack={() => setMethod(null)} />}
        {method === 'card' && <CardStep amount={amount} onPaid={m => onSuccess(m)} onBack={() => setMethod(null)} />}
      </div>
    </div>
  );
}

/* ─── Order History Card ─── */
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const st  = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
  const pct = st.pct;

  const STEPS = ['new','preparing','ready','served'];
  const STEP_LABELS = ['Received','Preparing','Ready','Served'];

  const payIcon = { cash:'💵', upi:'📱', card:'💳', fake_pay:'💳', pending:'⏳' };
  const payLabel = { cash:'Cash', upi:'UPI Paid', card:'Card Paid', fake_pay:'Card Paid', pending:'Pending' };

  return (
    <div style={o.card}>
      <div style={o.cardHead} onClick={() => setExpanded(x => !x)}>
        <div>
          <div style={o.orderId}>Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}</div>
          <div style={o.orderDate}>{new Date(order.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <span style={{ ...o.statusPill, background:st.bg, color:st.color }}>{st.icon} {st.label}</span>
          <span style={{ fontSize:12,color:'#a8a29e',transition:'transform .2s',display:'inline-block',transform:expanded?'rotate(180deg)':'rotate(0)' }}>▼</span>
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ marginBottom: 14 }}>
        <div style={o.progressTrack}>
          <div style={{ ...o.progressBar, width:`${pct}%`, background:`linear-gradient(90deg,#7c3aed,${st.color})` }}/>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',marginTop:6 }}>
          {STEPS.map((step, i) => {
            const done = STEPS.indexOf(order.status) >= i;
            return (
              <div key={step} style={{ textAlign:'center', flex:1 }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:done?st.color:'#e9d5ff',margin:'0 auto 3px',transition:'background .3s' }}/>
                <div style={{ fontSize:9,color:done?st.color:'#c4b5fd',fontWeight:done?700:400,textTransform:'uppercase',letterSpacing:'0.04em' }}>{STEP_LABELS[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick summary row */}
      <div style={o.footer}>
        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          <span style={{ fontSize:11,background:'#f3e8ff',color:'#7c3aed',padding:'3px 9px',borderRadius:99,fontWeight:600 }}>
            {payIcon[order.paymentMethod]||'💳'} {payLabel[order.paymentMethod]||'—'}
          </span>
          {order.tableNumber && <span style={{ fontSize:11,background:'#fffbeb',color:'#b45309',padding:'3px 9px',borderRadius:99,fontWeight:600 }}>🪑 Table {order.tableNumber}</span>}
          <span style={{ fontSize:11,color:'#a8a29e' }}>{order.items.length} item{order.items.length>1?'s':''}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11,color:'#a8a29e' }}>Total</div>
          <div style={{ fontSize:17,fontWeight:800,color:'#1c1917' }}>₹{order.total}</div>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div style={{ marginTop:14,borderTop:'1px solid #f3e8ff',paddingTop:14 }}>
          <div style={{ fontSize:12,fontWeight:700,color:'#78716c',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em' }}>Order Items</div>
          <div style={o.items}>
            {order.items.map((item,i) => (
              <div key={i} style={o.itemRow}>
                <span style={{ fontSize:18 }}>{item.emoji||'🍽️'}</span>
                <span style={{ flex:1,fontSize:13,color:'#44403c' }}>{item.name} × {item.qty}</span>
                <span style={{ fontSize:13,fontWeight:700,color:'#7c3aed' }}>₹{item.price*item.qty}</span>
              </div>
            ))}
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#78716c',marginBottom:4,paddingTop:8 }}>
            <span>Subtotal</span><span>₹{order.subtotal}</span>
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#78716c',marginBottom:4 }}>
            <span>GST (5%)</span><span>₹{order.gst}</span>
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:800,color:'#1c1917',borderTop:'1px solid #f3e8ff',paddingTop:8,marginTop:4 }}>
            <span>Total Paid</span><span>₹{order.total}</span>
          </div>
          <div style={{ fontSize:11,color:'#a8a29e',marginTop:8 }}>{st.desc}</div>
        </div>
      )}
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function UserPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu');
  const [menu, setMenu]     = useState([]);
  const [loadingMenu, setLM]= useState(true);
  const [cat, setCat]       = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart]     = useState([]);
  const [showPay, setSP]    = useState(false);
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLast]  = useState(null);
  const [toast, setToast]     = useState({ msg:'', type:'success' });
  const [orders, setOrders]   = useState([]);
  const [loadingOrders, setLO]= useState(false);
  const [filterStatus, setFS] = useState('all');
  const pollRef = useRef(null);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast({msg:'',type:'success'}),3500); };

  useEffect(() => {
    (async()=>{ try{ const r=await fetch(`${API}/products`); const d=await r.json(); if(Array.isArray(d))setMenu(d); }catch(e){console.error(e);}finally{setLM(false);} })();
  },[]);

  const fetchOrders = async () => {
    setLO(true);
    try {
      const r = await fetch(`${API}/orders/my`,{headers:{Authorization:`Bearer ${user?.token}`}});
      const d = await r.json(); if(Array.isArray(d)) setOrders(d);
    }catch(e){console.error(e);}finally{setLO(false);}
  };

  useEffect(() => {
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, 8000);
    return () => clearInterval(pollRef.current);
  },[]);

  const CATS = ['All',...['Coffee','Food','Snacks','Drinks','Other'].filter(c=>menu.some(m=>m.category===c))];
  const filtered = menu.filter(m=>(cat==='All'||m.category===cat)&&m.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = item => setCart(prev=>{ const ex=prev.find(c=>c._id===item._id); return ex?prev.map(c=>c._id===item._id?{...c,qty:c.qty+1}:c):[...prev,{...item,qty:1}]; });
  const removeFromCart = id => setCart(prev=>prev.map(c=>c._id===id?{...c,qty:c.qty-1}:c).filter(c=>c.qty>0));
  const getQty = id => cart.find(c=>c._id===id)?.qty||0;

  const subtotal = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const gst      = Math.round(subtotal*0.05);
  const total    = subtotal+gst;
  const cartCount= cart.reduce((s,c)=>s+c.qty,0);

  const placeOrder = async (method) => {
    if(!cart.length||placing) return;
    setPlacing(true);
    try {
      const r = await fetch(`${API}/orders`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${user?.token}`},
        body:JSON.stringify({ items:cart.map(c=>({id:c._id,name:c.name,qty:c.qty,price:c.price,emoji:c.emoji||'🍽️',cat:c.category})), subtotal,gst,total,paymentMethod:method }),
      });
      const data = await r.json();
      if(r.ok){ setCart([]); setSP(false); setLast(data); setActiveTab('orders'); fetchOrders(); showToast(`🎉 Order #${data.orderNumber||''} placed!`); }
      else showToast(data.message||'Failed to place order','error');
    }catch{ showToast('Network error','error'); }
    finally{ setPlacing(false); }
  };

  const h = new Date().getHours();
  const greeting = h<12?'morning':h<17?'afternoon':'evening';

  const activeOrders = orders.filter(o=>o.status!=='served');
  const pastOrders   = orders.filter(o=>o.status==='served');
  const displayOrders = filterStatus==='active' ? activeOrders : filterStatus==='past' ? pastOrders : orders;

  return (
    <div style={s.page}>
      {/* Toast */}
      {toast.msg && <div style={{ ...s.toast, background:toast.type==='error'?'#dc2626':'#7c3aed' }}>{toast.msg}</div>}

      {/* Payment Modal */}
      {showPay && <PaymentModal amount={total} onSuccess={method=>{ setSP(false); placeOrder(method); }} onClose={()=>setSP(false)}/>}

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize:26 }}>☕</span>
          <div>
            <div style={s.appName}>POS Café</div>
            <div style={s.appSub}>Customer Panel</div>
          </div>
        </div>
        <div style={s.tabs}>
          {[{key:'menu',icon:'🍽️',label:'Menu'},{key:'orders',icon:'📋',label:`My Orders${orders.length?` (${orders.length})`:''}` }].map(t=>(
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              style={{...s.tabBtn,background:activeTab===t.key?'#7c3aed':'transparent',color:activeTab===t.key?'#fff':'#78716c',position:'relative'}}>
              {t.icon} {t.label}
              {t.key==='orders'&&activeOrders.length>0&&<span style={{ position:'absolute',top:-4,right:-4,width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 1.5s infinite' }}/>}
            </button>
          ))}
        </div>
        <div style={s.headerRight}>
          <div style={s.userGreet}>
            <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.userRole}>☕ Customer</div>
            </div>
          </div>
          <button onClick={()=>{logout();navigate('/login');}} style={s.logoutBtn}>Sign Out</button>
        </div>
      </header>

      {/* ══ MENU TAB ══ */}
      {activeTab==='menu' && (
        <div style={s.layout}>
          <div style={s.menuSide}>
            <div style={s.hero}>
              <h1 style={s.heroTitle}>Good {greeting}, {user?.name?.split(' ')[0]}! ✨</h1>
              <p style={s.heroSub}>What would you like today?</p>
            </div>
            <div style={s.searchRow}>
              <div style={s.searchWrap}>
                <span style={s.searchIcon}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search menu…" style={s.searchInput}/>
                {search && <button onClick={()=>setSearch('')} style={s.clearSearch}>✕</button>}
              </div>
            </div>
            <div style={s.catRow}>
              {CATS.map(c=>(
                <button key={c} onClick={()=>setCat(c)} style={{...s.catBtn,background:cat===c?'#7c3aed':'#fff',color:cat===c?'#fff':'#44403c',borderColor:cat===c?'#7c3aed':'#e7e5e4'}}>{c}</button>
              ))}
            </div>
            {loadingMenu ? (
              <div style={s.emptyState}><p style={{color:'#78716c'}}>Loading menu…</p></div>
            ) : filtered.length===0 ? (
              <div style={s.emptyState}><div style={{fontSize:48}}>🔍</div><p style={{color:'#78716c',marginTop:12}}>{menu.length===0?'No items yet':'Nothing found'}</p></div>
            ) : (
              <div style={s.menuGrid}>
                {filtered.map(item=>{
                  const qty=getQty(item._id);
                  return (
                    <div key={item._id} style={{...s.menuCard,boxShadow:qty>0?'0 0 0 2.5px #7c3aed,0 4px 16px rgba(124,58,237,0.12)':'0 2px 10px rgba(0,0,0,0.06)'}}>
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
          <div style={s.cartSide}>
            <div style={s.cartCard}>
              <div style={s.cartHead}>
                <h2 style={s.cartTitle}>Your Order</h2>
                {cartCount>0&&<span style={s.cartCountBadge}>{cartCount} item{cartCount>1?'s':''}</span>}
              </div>
              {cart.length===0 ? (
                <div style={s.cartEmpty}>
                  <div style={{fontSize:48,marginBottom:12}}>🛒</div>
                  <p style={{color:'#78716c',fontSize:14}}>Your cart is empty</p>
                  <p style={{color:'#a8a29e',fontSize:12,marginTop:6}}>Add items from the menu</p>
                </div>
              ) : (
                <>
                  <div style={s.cartItems}>
                    {cart.map(c=>(
                      <div key={c._id} style={s.cartItem}>
                        <span style={{fontSize:20}}>{c.emoji||'🍽️'}</span>
                        <div style={{flex:1}}>
                          <div style={s.cartItemName}>{c.name}</div>
                          <div style={s.cartItemPrice}>₹{c.price} × {c.qty}</div>
                        </div>
                        <div style={s.qtyControl}>
                          <button onClick={()=>removeFromCart(c._id)} style={s.qtyBtn}>−</button>
                          <span style={s.qtyNum}>{c.qty}</span>
                          <button onClick={()=>addToCart(c)} style={s.qtyBtn}>+</button>
                        </div>
                        <span style={s.cartItemTotal}>₹{c.price*c.qty}</span>
                      </div>
                    ))}
                  </div>
                  <div style={s.cartDivider}/>
                  <div style={s.summaryRows}>
                    <div style={s.summaryRow}><span>Subtotal</span><span>₹{subtotal}</span></div>
                    <div style={s.summaryRow}><span>GST (5%)</span><span>₹{gst}</span></div>
                    <div style={{...s.summaryRow,...s.totalRow}}><span>Total</span><span>₹{total}</span></div>
                  </div>
                  {/* Payment method hints */}
                  <div style={{ display:'flex',gap:6,marginBottom:12 }}>
                    {['💵 Cash','📱 UPI','💳 Card'].map(m=>(
                      <span key={m} style={{ flex:1,textAlign:'center',fontSize:10,fontWeight:600,color:'#7c3aed',background:'#f3e8ff',borderRadius:8,padding:'4px 0' }}>{m}</span>
                    ))}
                  </div>
                  <button onClick={()=>setSP(true)} style={s.checkoutBtn} disabled={placing}>
                    {placing?'⏳ Placing…':'💳 Proceed to Payment'}
                  </button>
                  <button onClick={()=>setCart([])} style={s.clearBtn}>Clear Cart</button>
                </>
              )}
            </div>
            {lastOrder && (
              <div style={s.lastOrderWidget}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <span style={{fontSize:18}}>🍽️</span>
                  <span style={{fontSize:13,fontWeight:700,color:'#1c1917'}}>Order #{lastOrder.orderNumber||lastOrder._id.slice(-6).toUpperCase()}</span>
                  <span style={{fontSize:11,background:'#f0fdf4',color:'#16a34a',padding:'2px 8px',borderRadius:99,fontWeight:600}}>● Live</span>
                </div>
                <p style={{fontSize:12,color:'#78716c',margin:0}}>Your order is in the kitchen. <button onClick={()=>setActiveTab('orders')} style={{color:'#7c3aed',background:'none',border:'none',cursor:'pointer',fontSize:12,fontWeight:600,padding:0}}>Track it →</button></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ORDERS TAB ══ */}
      {activeTab==='orders' && (
        <div style={s.ordersPage}>
          <div style={s.ordersHead}>
            <div>
              <h1 style={s.pageTitle}>My Orders</h1>
              <p style={s.pageSub}>Tap an order to see full details & items</p>
            </div>
            <button onClick={fetchOrders} style={s.refreshBtn}>↻ Refresh</button>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
            {[
              { label:'Total Orders', val:orders.length, icon:'📋', color:'#7c3aed' },
              { label:'Active', val:activeOrders.length, icon:'🟡', color:'#f59e0b' },
              { label:'Completed', val:pastOrders.length, icon:'✅', color:'#22c55e' },
            ].map(st=>(
              <div key={st.label} style={{ background:'#fff',borderRadius:14,padding:'16px',textAlign:'center',border:'1px solid #f3e8ff',boxShadow:'0 2px 8px rgba(124,58,237,0.06)' }}>
                <div style={{fontSize:24,marginBottom:4}}>{st.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:st.color}}>{st.val}</div>
                <div style={{fontSize:11,color:'#78716c',fontWeight:600}}>{st.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display:'flex',gap:8,marginBottom:20,background:'#f3e8ff',borderRadius:12,padding:4 }}>
            {[{key:'all',label:'All Orders'},{key:'active',label:`Active (${activeOrders.length})`},{key:'past',label:`Completed (${pastOrders.length})`}].map(f=>(
              <button key={f.key} onClick={()=>setFS(f.key)}
                style={{flex:1,padding:'8px 12px',borderRadius:9,border:'none',background:filterStatus===f.key?'#7c3aed':'transparent',color:filterStatus===f.key?'#fff':'#78716c',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'Inter,sans-serif',transition:'all .15s'}}>
                {f.label}
              </button>
            ))}
          </div>

          {loadingOrders&&orders.length===0 ? (
            <div style={s.emptyState}><p style={{color:'#78716c'}}>Loading…</p></div>
          ) : displayOrders.length===0 ? (
            <div style={s.emptyState}>
              <div style={{fontSize:60}}>📋</div>
              <p style={{color:'#78716c',fontSize:15,marginTop:16,marginBottom:20}}>{orders.length===0?'No orders yet':'No orders in this category'}</p>
              {orders.length===0&&<button onClick={()=>setActiveTab('menu')} style={s.checkoutBtn}>Browse Menu →</button>}
            </div>
          ) : (
            <div>{displayOrders.map(order=><OrderCard key={order._id} order={order}/>)}</div>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.85);} }
        .anim-popIn { animation: popIn 0.25s cubic-bezier(.34,1.56,.64,1); }
        @keyframes popIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

/* ── Styles ── */
const s = {
  page:       { minHeight:'100vh', background:'#faf5ff', fontFamily:"'Inter',sans-serif" },
  toast:      { position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', color:'#fff', padding:'13px 28px', borderRadius:12, fontSize:14, fontWeight:600, zIndex:999, boxShadow:'0 8px 24px rgba(0,0,0,0.2)', whiteSpace:'nowrap' },
  header:     { background:'#fff', borderBottom:'1px solid #e9d5ff', padding:'0 28px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(124,58,237,0.07)', gap:16 },
  headerLeft: { display:'flex', alignItems:'center', gap:12, flexShrink:0 },
  appName:    { fontSize:15, fontWeight:800, color:'#1c1917', letterSpacing:'-0.02em' },
  appSub:     { fontSize:10.5, color:'#a78bfa' },
  tabs:       { display:'flex', gap:6, background:'#f5f3ff', borderRadius:12, padding:4 },
  tabBtn:     { padding:'7px 16px', borderRadius:9, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s', fontFamily:'Inter,sans-serif' },
  headerRight:{ display:'flex', alignItems:'center', gap:14, flexShrink:0 },
  userGreet:  { display:'flex', alignItems:'center', gap:10 },
  userAvatar: { width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  userName:   { fontSize:13, fontWeight:600, color:'#1c1917' },
  userRole:   { fontSize:11, color:'#7c3aed' },
  logoutBtn:  { padding:'7px 14px', borderRadius:8, border:'1px solid #e9d5ff', background:'transparent', color:'#7c3aed', cursor:'pointer', fontSize:13, fontWeight:500 },
  layout:     { display:'flex', gap:24, maxWidth:1280, margin:'0 auto', padding:'28px 24px 48px' },
  menuSide:   { flex:1, minWidth:0 },
  hero:       { background:'linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%)', borderRadius:18, padding:'28px 32px', color:'#fff', marginBottom:20 },
  heroTitle:  { fontSize:24, fontWeight:800, marginBottom:6, letterSpacing:'-0.02em' },
  heroSub:    { fontSize:14, opacity:0.85 },
  searchRow:  { marginBottom:14 },
  searchWrap: { position:'relative', display:'flex', alignItems:'center' },
  searchIcon: { position:'absolute', left:13, fontSize:15, pointerEvents:'none', color:'#a8a29e' },
  searchInput:{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:10, border:'1.5px solid #e9d5ff', fontSize:14, fontFamily:'Inter,sans-serif', background:'#fff', outline:'none', boxSizing:'border-box' },
  clearSearch:{ position:'absolute', right:12, background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#a8a29e' },
  catRow:     { display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' },
  catBtn:     { padding:'7px 18px', borderRadius:99, border:'1.5px solid', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .15s' },
  menuGrid:   { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 },
  menuCard:   { background:'#fff', borderRadius:16, padding:'18px', transition:'all .15s' },
  menuCardTop:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  menuEmoji:  { fontSize:28 },
  menuCatTag: { fontSize:10, background:'#f3e8ff', color:'#7c3aed', padding:'2px 8px', borderRadius:20, fontWeight:600 },
  menuCardName:{ fontSize:14, fontWeight:700, color:'#1c1917', marginBottom:4 },
  menuCardDesc:{ fontSize:12, color:'#78716c', lineHeight:1.5, marginBottom:12 },
  menuCardFooter:{ display:'flex', alignItems:'center', justifyContent:'space-between' },
  menuPrice:  { fontSize:16, fontWeight:800, color:'#7c3aed' },
  addBtn:     { padding:'6px 14px', borderRadius:9, border:'none', background:'#7c3aed', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' },
  qtyControl: { display:'flex', alignItems:'center', gap:6, background:'#f3e8ff', borderRadius:8, padding:'3px 5px' },
  qtyBtn:     { width:26, height:26, borderRadius:6, border:'none', background:'#7c3aed', color:'#fff', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 },
  qtyNum:     { fontSize:14, fontWeight:700, color:'#7c3aed', minWidth:18, textAlign:'center' },
  emptyState: { textAlign:'center', padding:'60px 0' },
  cartSide:   { width:320, flexShrink:0 },
  cartCard:   { background:'#fff', borderRadius:20, padding:'24px', boxShadow:'0 8px 32px rgba(124,58,237,0.10)', position:'sticky', top:80, marginBottom:16 },
  cartHead:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  cartTitle:  { fontSize:17, fontWeight:800, color:'#1c1917' },
  cartCountBadge:{ background:'#7c3aed', color:'#fff', fontSize:12, padding:'3px 10px', borderRadius:20, fontWeight:600 },
  cartEmpty:  { textAlign:'center', padding:'32px 0' },
  cartItems:  { display:'flex', flexDirection:'column', gap:12, marginBottom:14 },
  cartItem:   { display:'flex', alignItems:'center', gap:10 },
  cartItemName:{ fontSize:13, fontWeight:600, color:'#1c1917' },
  cartItemPrice:{ fontSize:11, color:'#78716c', marginTop:2 },
  cartItemTotal:{ fontSize:14, fontWeight:700, color:'#7c3aed', flexShrink:0 },
  cartDivider:{ height:1, background:'#f3e8ff', marginBottom:14 },
  summaryRows:{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 },
  summaryRow: { display:'flex', justifyContent:'space-between', fontSize:13, color:'#78716c' },
  totalRow:   { fontSize:16, fontWeight:800, color:'#1c1917', paddingTop:8, borderTop:'1px solid #f3e8ff', marginTop:4 },
  checkoutBtn:{ width:'100%', padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8, boxShadow:'0 4px 16px rgba(124,58,237,0.28)', fontFamily:'Inter,sans-serif' },
  clearBtn:   { width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid #e9d5ff', background:'transparent', color:'#7c3aed', fontSize:13, cursor:'pointer' },
  lastOrderWidget:{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius:14, padding:'16px 18px', border:'1.5px solid #e9d5ff' },
  ordersPage: { maxWidth:760, margin:'0 auto', padding:'32px 24px 60px' },
  ordersHead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 },
  pageTitle:  { fontSize:24, fontWeight:800, color:'#1c1917', letterSpacing:'-0.03em', marginBottom:4 },
  pageSub:    { fontSize:13, color:'#78716c' },
  refreshBtn: { padding:'9px 18px', borderRadius:10, border:'1.5px solid #e9d5ff', background:'#fff', color:'#7c3aed', fontSize:13, fontWeight:600, cursor:'pointer' },
};

const o = {
  card:        { background:'#fff', borderRadius:16, padding:'20px', marginBottom:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #f3e8ff', cursor:'pointer' },
  cardHead:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 },
  orderId:     { fontSize:14, fontWeight:700, color:'#1c1917', marginBottom:3 },
  orderDate:   { fontSize:12, color:'#a8a29e' },
  statusPill:  { display:'inline-flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:99, fontSize:12, fontWeight:700 },
  progressTrack:{ height:6, background:'#f3e8ff', borderRadius:99, overflow:'hidden', marginBottom:4 },
  progressBar: { height:'100%', borderRadius:99, transition:'width 0.6s ease' },
  footer:      { display:'flex', justifyContent:'space-between', alignItems:'center' },
  items:       { background:'#faf5ff', borderRadius:10, padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 },
  itemRow:     { display:'flex', alignItems:'center', gap:10 },
};

const pm = {
  overlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 },
  box:       { background:'#fff', borderRadius:24, padding:'32px', width:'100%', maxWidth:440, boxShadow:'0 24px 80px rgba(0,0,0,0.25)', maxHeight:'90vh', overflowY:'auto', fontFamily:'Inter,sans-serif' },
  head:      { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 },
  subLabel:  { fontSize:10, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 },
  amount:    { fontSize:34, fontWeight:900, color:'#1c1917', letterSpacing:'-0.04em' },
  closeX:    { width:32, height:32, borderRadius:8, border:'1.5px solid #e7e5e4', background:'#fafaf9', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  field:     { marginBottom:14 },
  label:     { display:'block', fontSize:12, fontWeight:600, color:'#44403c', marginBottom:6 },
  input:     { width:'100%', padding:'11px 14px', borderRadius:10, border:'1.5px solid #e7e5e4', fontSize:14, color:'#1c1917', background:'#fafaf9', fontFamily:'Inter,sans-serif', boxSizing:'border-box', outline:'none' },
  errBox:    { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#dc2626', marginBottom:14 },
  confirmBtn:{ width:'100%', padding:'13px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#7c3aed,#6d28d9)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif', boxShadow:'0 4px 16px rgba(124,58,237,0.3)' },
  backBtn:   { width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid #e9d5ff', background:'transparent', color:'#7c3aed', fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' },
};
