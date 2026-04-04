import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStaffApi, createStaffApi, deleteStaffApi } from '../api/authApi';
import { QRCodeCanvas } from 'qrcode.react';

const API = 'http://localhost:5000/api';
const POLL_MS = 5_000;

const ROLE_COLORS = {
  cashier: { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6', icon: '🧾' },
  kitchen: { bg: '#fff7ed', text: '#c2410c', dot: '#f97316', icon: '🍳' },
};

const NAV_ITEMS = [
  { key: 'overview',  icon: '📊', label: 'Overview'  },
  { key: 'orders',    icon: '📋', label: 'Orders'    },
  { key: 'products',  icon: '🍽️', label: 'Products'  },
  { key: 'tables',    icon: '🪑', label: 'Tables'    },
  { key: 'staff',     icon: '👥', label: 'Staff'     },
  { key: 'settings',  icon: '⚙️',  label: 'Settings'  },
];

const ORDER_STATUS = {
  new:       { label: 'New',       bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
  preparing: { label: 'Preparing', bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  ready:     { label: 'Ready',     bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' },
  served:    { label: 'Served',    bg: '#f0f9ff', text: '#0369a1', dot: '#38bdf8' },
};

const CATS = ['Coffee', 'Food', 'Snacks', 'Drinks', 'Other'];
const EMOJI_MAP = { Coffee: '☕', Food: '🥪', Snacks: '🍰', Drinks: '🍓', Other: '🍽️' };

const FRONTEND_URL = 'http://localhost:5173';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = user?.token;

  const [nav, setNav] = useState('overview');
  const showToastMsg = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3500); };

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  // ── Staff ─────────────────────────────────────────────────────────────────
  const [staff, setStaff]          = useState([]);
  const [loadingStaff, setLS]      = useState(true);
  const [showModal, setModal]      = useState(false);
  const [form, setForm]            = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [formErr, setFormErr]      = useState('');
  const [creating, setCrtg]        = useState(false);
  const [deletingId, setDelId]     = useState(null);
  const [showPwd, setShowPwd]      = useState(false);

  // ── Orders ────────────────────────────────────────────────────────────────
  const [orders, setOrders]           = useState([]);
  const [loadingOrders, setLO]        = useState(true);
  const [orderFilter, setOFilter]     = useState('all');
  const [deletingOrderId, setDelOrd]  = useState(null);
  const orderPollRef                  = useRef(null);

  // ── Products ──────────────────────────────────────────────────────────────
  const [products, setProducts]         = useState([]);
  const [loadingProducts, setLP]        = useState(true);
  const [showProductModal, setShowPM]   = useState(false);
  const [editingProduct, setEditProd]   = useState(null);
  const [productForm, setPF]            = useState({ name: '', price: '', emoji: '☕', category: 'Coffee', description: '', available: true });
  const [productFormErr, setPFErr]      = useState('');
  const [savingProduct, setSavingP]     = useState(false);
  const [deletingProductId, setDelProd] = useState(null);

  // ── Tables ────────────────────────────────────────────────────────────────
  const [tables, setTables]           = useState([]);
  const [loadingTables, setLT]        = useState(true);
  const [showTableModal, setShowTM]   = useState(false);
  const [tableForm, setTF]            = useState({ tableNumber: '', name: '', capacity: 4 });
  const [tableFormErr, setTFErr]      = useState('');
  const [savingTable, setSavingT]     = useState(false);
  const [deletingTableId, setDelT]    = useState(null);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchStaff = async () => {
    setLS(true);
    const res = await getStaffApi(token);
    setStaff(Array.isArray(res) ? res : []);
    setLS(false);
  };

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch(e){ console.error(e); } finally { setLO(false); }
  };

  const fetchProducts = async () => {
    setLP(true);
    try {
      const res  = await fetch(`${API}/products?all=true`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch(e){ console.error(e); } finally { setLP(false); }
  };

  const fetchTables = async () => {
    setLT(true);
    try {
      const res  = await fetch(`${API}/tables`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setTables(data);
    } catch(e){ console.error(e); } finally { setLT(false); }
  };

  useEffect(() => {
    fetchStaff();
    fetchOrders();
    fetchProducts();
    fetchTables();
    orderPollRef.current = setInterval(fetchOrders, POLL_MS);
    return () => clearInterval(orderPollRef.current);
  }, []);

  // ── Order actions ─────────────────────────────────────────────────────────
  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Remove this order?')) return;
    setDelOrd(id);
    await fetch(`${API}/orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setOrders(prev => prev.filter(o => o._id !== id));
    showToastMsg('🗑 Order removed', 'error');
    setDelOrd(null);
  };

  const timeAgo = (dateStr) => {
    const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);

  // ── Staff actions ─────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleCreate = async (e) => {
    e.preventDefault(); setFormErr('');
    if (form.password.length < 6) return setFormErr('Password must be at least 6 characters');
    setCrtg(true);
    const res = await createStaffApi(form, token);
    setCrtg(false);
    if (res._id) { setModal(false); setForm({ name: '', email: '', password: '', role: 'cashier' }); showToastMsg(`✅ ${res.name} added`); fetchStaff(); }
    else setFormErr(res.message || 'Failed to create staff');
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    setDelId(id);
    await deleteStaffApi(id, token);
    setDelId(null); showToastMsg(`🗑 ${name} removed`, 'error'); fetchStaff();
  };

  // ── Product actions ───────────────────────────────────────────────────────
  const openAddProduct = () => {
    setEditProd(null);
    setPF({ name: '', price: '', emoji: '☕', category: 'Coffee', description: '', available: true });
    setPFErr(''); setShowPM(true);
  };
  const openEditProduct = (p) => {
    setEditProd(p);
    setPF({ name: p.name, price: p.price, emoji: p.emoji, category: p.category, description: p.description, available: p.available });
    setPFErr(''); setShowPM(true);
  };
  const handleSaveProduct = async (e) => {
    e.preventDefault(); setPFErr('');
    if (!productForm.name.trim() || !productForm.price) return setPFErr('Name and price are required');
    setSavingP(true);
    const method = editingProduct ? 'PUT' : 'POST';
    const url    = editingProduct ? `${API}/products/${editingProduct._id}` : `${API}/products`;
    try {
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(productForm) });
      const data = await res.json();
      if (res.ok) { setShowPM(false); showToastMsg(`✅ Product ${editingProduct ? 'updated' : 'added'}`); fetchProducts(); }
      else setPFErr(data.message || 'Failed');
    } catch { setPFErr('Network error'); } finally { setSavingP(false); }
  };
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setDelProd(id);
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setDelProd(null); showToastMsg('🗑 Product deleted', 'error'); fetchProducts();
  };
  const handleToggleAvailable = async (p) => {
    await fetch(`${API}/products/${p._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...p, available: !p.available }) });
    fetchProducts();
  };

  // ── Table actions ─────────────────────────────────────────────────────────
  const handleSaveTable = async (e) => {
    e.preventDefault(); setTFErr('');
    if (!tableForm.tableNumber) return setTFErr('Table number is required');
    setSavingT(true);
    try {
      const res  = await fetch(`${API}/tables`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(tableForm) });
      const data = await res.json();
      if (res.ok) { setShowTM(false); setTF({ tableNumber: '', name: '', capacity: 4 }); showToastMsg(`✅ Table ${tableForm.tableNumber} added`); fetchTables(); }
      else setTFErr(data.message || 'Failed');
    } catch { setTFErr('Network error'); } finally { setSavingT(false); }
  };
  const handleDeleteTable = async (id, num) => {
    if (!window.confirm(`Remove Table ${num}?`)) return;
    setDelT(id);
    await fetch(`${API}/tables/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setDelT(null); showToastMsg(`🗑 Table ${num} removed`, 'error'); fetchTables();
  };
  const downloadQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-canvas-${tableNumber}`);
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a'); a.href = url; a.download = `table-${tableNumber}-qr.png`; a.click();
  };

  const cashierCount = staff.filter(s => s.role === 'cashier').length;
  const kitchenCount = staff.filter(s => s.role === 'kitchen').length;

  return (
    <div style={s.page}>
      {/* ─── Sidebar ─── */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.brand}>
            <div style={s.brandIcon}>☕</div>
            <div>
              <div style={s.brandName}>POS Café</div>
              <div style={s.brandSub}>Admin Console</div>
            </div>
          </div>
          <nav style={s.nav}>
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setNav(item.key)} style={{ ...s.navItem, background: nav === item.key ? 'rgba(245,158,11,0.12)' : 'transparent', color: nav === item.key ? '#f59e0b' : '#78716c', borderColor: nav === item.key ? 'rgba(245,158,11,0.25)' : 'transparent' }}>
                <span style={{ fontSize: 17 }}>{item.icon}</span>
                <span>{item.label}</span>
                {nav === item.key && <div style={s.navActive} />}
              </button>
            ))}
          </nav>
        </div>
        <div style={s.sideBottom}>
          <div style={s.userCard}>
            <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.userRole}>👑 Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Sign Out →</button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={s.main}>
        {toast.msg && (
          <div style={{ ...s.toast, background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4', color: toast.type === 'error' ? '#dc2626' : '#16a34a', border: toast.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0' }} className="anim-slideDown">
            {toast.msg}
          </div>
        )}

        {/* ── Overview ── */}
        {nav === 'overview' && (
          <div className="anim-fadeUp">
            <div style={s.pageHead}>
              <div>
                <h1 style={s.pageTitle}>Good morning, {user?.name?.split(' ')[0]} 👋</h1>
                <p style={s.pageSub}>Here's what's happening with your café today.</p>
              </div>
            </div>
            <div style={s.statsGrid}>
              {[
                { icon: '📋', label: 'Total Orders',  value: orders.length,   color: '#7c3aed', desc: 'All time' },
                { icon: '🔴', label: 'New Orders',    value: orders.filter(o=>o.status==='new').length, color: '#dc2626', desc: 'Awaiting kitchen' },
                { icon: '🍽️', label: 'Menu Items',    value: products.length, color: '#f59e0b', desc: 'Active products' },
                { icon: '🪑', label: 'Tables',        value: tables.length,   color: '#22c55e', desc: 'QR-enabled' },
              ].map(stat => (
                <div key={stat.label} style={s.statCard}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                    <div style={{ ...s.statIconBox, background:`${stat.color}12`, color:stat.color }}>{stat.icon}</div>
                    <span style={{ ...s.statTrend, color:stat.color }}>↑</span>
                  </div>
                  <div style={{ ...s.statValue, color:stat.color }}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                  <div style={s.statDesc}>{stat.desc}</div>
                </div>
              ))}
            </div>
            <div style={s.quickSection}>
              <h2 style={s.sectionTitle}>Quick Actions</h2>
              <div style={s.quickGrid}>
                {[
                  { icon:'➕', label:'Add Staff Member',    desc:'Create cashier or kitchen',  action:()=>{setNav('staff');setModal(true);},    color:'#f59e0b' },
                  { icon:'🍽️', label:'Add Menu Product',   desc:'Add item to the live menu',   action:()=>{setNav('products');openAddProduct();},color:'#7c3aed' },
                  { icon:'🪑', label:'Add Table & QR',     desc:'Create table + download QR',  action:()=>{setNav('tables');setShowTM(true);},  color:'#22c55e' },
                  { icon:'📋', label:'View Orders',        desc:'See all live orders',          action:()=>setNav('orders'),                     color:'#3b82f6' },
                ].map(q=>(
                  <button key={q.label} onClick={q.action} style={s.quickCard}>
                    <div style={{ ...s.quickIcon, background:`${q.color}12`, color:q.color }}>{q.icon}</div>
                    <div><div style={s.quickLabel}>{q.label}</div><div style={s.quickDesc}>{q.desc}</div></div>
                    <span style={{ color:'#c0bbb7', marginLeft:'auto' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {nav === 'orders' && (
          <div className="anim-fadeUp">
            <div style={s.pageHead}>
              <div><h1 style={s.pageTitle}>Live Orders</h1><p style={s.pageSub}>Auto-refreshes every 5 seconds.</p></div>
              <button onClick={fetchOrders} style={{ ...s.addBtn, background:'#7c3aed' }}>↻ Refresh</button>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
              {['all','new','preparing','ready','served'].map(f=>(
                <button key={f} onClick={()=>setOFilter(f)} style={{ ...s.filterBtn, background:orderFilter===f?'#1c1917':'#fff', color:orderFilter===f?'#fff':'#44403c', borderColor:orderFilter===f?'#1c1917':'#e7e5e4' }}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                  {f!=='all'&&<span style={{ marginLeft:6,fontSize:11,opacity:0.7 }}>({orders.filter(o=>o.status===f).length})</span>}
                </button>
              ))}
            </div>
            {loadingOrders ? <div style={s.emptyState}><p style={{ color:'#78716c' }}>Loading orders…</p></div>
              : filteredOrders.length === 0 ? <div style={s.emptyState}><div style={{ fontSize:52 }}>📭</div><p style={{ color:'#78716c',marginTop:12 }}>No orders</p></div>
              : (
                <div style={s.ordersGrid}>
                  {filteredOrders.map(order=>{
                    const st = ORDER_STATUS[order.status]||ORDER_STATUS.new;
                    return (
                      <div key={order._id} style={{ ...s.orderCard, borderTop:`3px solid ${st.dot}` }}>
                        <div style={s.orderCardHead}>
                          <div>
                            <div style={s.orderIdText}>#{order._id.slice(-6).toUpperCase()}</div>
                            <div style={s.orderCustomer}>👤 {order.customer?.name}</div>
                            {order.tableNumber&&<div style={{ fontSize:11,color:'#f59e0b',fontWeight:700,marginTop:2 }}>🪑 Table {order.tableNumber}</div>}
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <span style={{ ...s.statusPill, background:st.bg, color:st.text }}><span style={{ width:6,height:6,borderRadius:'50%',background:st.dot,display:'inline-block',marginRight:4 }}/>{st.label}</span>
                            <div style={s.orderTime}>{timeAgo(order.createdAt)}</div>
                          </div>
                        </div>
                        <div style={s.orderItems}>
                          {order.items.map((item,i)=>(
                            <div key={i} style={s.orderItemRow}><span style={{ color:'#a8a29e' }}>•</span><span>{item.name} × {item.qty}</span><span style={{ marginLeft:'auto',color:'#7c3aed',fontWeight:600 }}>₹{item.price*item.qty}</span></div>
                          ))}
                        </div>
                        <div style={s.orderCardFooter}>
                          <div><div style={{ fontSize:11,color:'#a8a29e' }}>Total</div><div style={{ fontSize:16,fontWeight:800,color:'#1c1917' }}>₹{order.total}</div></div>
                          <button onClick={()=>handleDeleteOrder(order._id)} disabled={deletingOrderId===order._id} style={s.deleteOrderBtn}>{deletingOrderId===order._id?'…':'🗑 Remove'}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* ── Products Tab ── */}
        {nav === 'products' && (
          <div className="anim-fadeUp">
            <div style={s.pageHead}>
              <div><h1 style={s.pageTitle}>Menu Products</h1><p style={s.pageSub}>Add, edit, or remove items from the live menu.</p></div>
              <button onClick={openAddProduct} style={s.addBtn}>+ Add Product</button>
            </div>
            <div style={s.tableCard}>
              {loadingProducts ? <div style={s.emptyState}><p style={{ color:'#78716c' }}>Loading…</p></div>
                : products.length === 0 ? (
                  <div style={s.emptyState}>
                    <div style={{ fontSize:52 }}>🍽️</div>
                    <p style={{ color:'#78716c',fontSize:15,marginTop:12,marginBottom:16 }}>No menu items yet</p>
                    <button onClick={openAddProduct} style={s.addBtn}>Add First Product</button>
                  </div>
                ) : (
                  <>
                    <div style={{ ...s.tableHead, gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr' }}>
                      <span>Name</span><span>Category</span><span>Price</span><span>Status</span><span>Updated</span><span></span>
                    </div>
                    {products.map(p=>(
                      <div key={p._id} style={{ ...s.tableRow, gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 1fr' }}>
                        <div style={s.staffNameCell}>
                          <div style={{ fontSize:22 }}>{p.emoji}</div>
                          <div>
                            <div style={{ fontSize:14,fontWeight:600,color:'#1c1917' }}>{p.name}</div>
                            {p.description&&<div style={{ fontSize:11,color:'#78716c' }}>{p.description}</div>}
                          </div>
                        </div>
                        <span><span style={{ ...s.rolePill, background:`${EMOJI_MAP[p.category]?'#f3e8ff':'#f5f5f4'}`, color:'#7c3aed',fontSize:11 }}>{p.category}</span></span>
                        <span style={{ fontSize:15,fontWeight:700,color:'#7c3aed' }}>₹{p.price}</span>
                        <span>
                          <button onClick={()=>handleToggleAvailable(p)} style={{ padding:'4px 12px',borderRadius:20,border:'none',fontSize:11,fontWeight:600,cursor:'pointer', background:p.available?'#f0fdf4':'#fef2f2', color:p.available?'#16a34a':'#dc2626' }}>
                            {p.available?'● Available':'○ Hidden'}
                          </button>
                        </span>
                        <span style={{ fontSize:12,color:'#a8a29e' }}>{new Date(p.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
                        <span style={{ display:'flex',gap:6,justifyContent:'flex-end' }}>
                          <button onClick={()=>openEditProduct(p)} style={{ ...s.editBtn }}>Edit</button>
                          <button onClick={()=>handleDeleteProduct(p._id)} disabled={deletingProductId===p._id} style={s.deleteBtn}>{deletingProductId===p._id?'…':'Del'}</button>
                        </span>
                      </div>
                    ))}
                  </>
                )}
            </div>
          </div>
        )}

        {/* ── Tables Tab ── */}
        {nav === 'tables' && (
          <div className="anim-fadeUp">
            <div style={s.pageHead}>
              <div><h1 style={s.pageTitle}>Table Management</h1><p style={s.pageSub}>Manage tables and download QR codes for each table.</p></div>
              <button onClick={()=>setShowTM(true)} style={s.addBtn}>+ Add Table</button>
            </div>
            {loadingTables ? <div style={s.emptyState}><p style={{ color:'#78716c' }}>Loading…</p></div>
              : tables.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={{ fontSize:52 }}>🪑</div>
                  <p style={{ color:'#78716c',fontSize:15,marginTop:12,marginBottom:16 }}>No tables yet</p>
                  <button onClick={()=>setShowTM(true)} style={s.addBtn}>Add First Table</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                  {tables.map(t=>(
                    <div key={t._id} style={{ background:'#fff',borderRadius:20,padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.07)',border:'1px solid #ece9e6',textAlign:'center' }}>
                      <div style={{ fontSize:13,fontWeight:700,color:'#78716c',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.07em' }}>Table</div>
                      <div style={{ fontSize:36,fontWeight:900,color:'#1c1917',marginBottom:4 }}>{t.tableNumber}</div>
                      {t.name&&t.name!==`Table ${t.tableNumber}`&&<div style={{ fontSize:13,color:'#78716c',marginBottom:12 }}>{t.name}</div>}
                      <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'#f0fdf4',color:'#16a34a',borderRadius:20,padding:'4px 12px',fontSize:12,fontWeight:600,marginBottom:16 }}>
                        <span style={{ width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block' }}/>
                        {t.capacity} seats
                      </div>
                      {/* Hidden QR for download */}
                      <div style={{ display:'flex',justifyContent:'center',marginBottom:16 }}>
                        <div style={{ padding:12,background:'#fff',borderRadius:14,boxShadow:'0 4px 16px rgba(0,0,0,0.08)',border:'1px solid #ece9e6' }}>
                          <QRCodeCanvas
                            id={`qr-canvas-${t.tableNumber}`}
                            value={`${FRONTEND_URL}/table/${t.tableNumber}`}
                            size={140}
                            bgColor="#ffffff"
                            fgColor="#1c1917"
                            level="M"
                            includeMargin
                          />
                        </div>
                      </div>
                      <div style={{ fontSize:11,color:'#a8a29e',marginBottom:16,padding:'6px 12px',background:'#f7f4f0',borderRadius:8,wordBreak:'break-all' }}>
                        {FRONTEND_URL}/table/{t.tableNumber}
                      </div>
                      <div style={{ display:'flex',gap:8 }}>
                        <button onClick={()=>downloadQR(t.tableNumber)} style={{ flex:1,padding:'9px',borderRadius:10,border:'none',background:'#1c1917',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer' }}>
                          ⬇ Download QR
                        </button>
                        <button onClick={()=>handleDeleteTable(t._id,t.tableNumber)} disabled={deletingTableId===t._id} style={{ padding:'9px 14px',borderRadius:10,border:'1px solid #fecaca',background:'#fef2f2',color:'#dc2626',fontSize:12,cursor:'pointer' }}>
                          {deletingTableId===t._id?'…':'🗑'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* ── Staff Tab ── */}
        {nav === 'staff' && (
          <div className="anim-fadeUp">
            <div style={s.pageHead}>
              <div><h1 style={s.pageTitle}>Staff Management</h1><p style={s.pageSub}>Manage your cashier and kitchen team.</p></div>
              <button onClick={()=>setModal(true)} style={s.addBtn}>+ Add Staff</button>
            </div>
            <div style={{ display:'flex',gap:10,marginBottom:24 }}>
              {[{label:'All',count:staff.length,color:'#1c1917'},{label:'Cashier',count:cashierCount,color:'#3b82f6'},{label:'Kitchen',count:kitchenCount,color:'#f97316'}].map(b=>(
                <div key={b.label} style={{ ...s.countBadge,background:`${b.color}10`,color:b.color,border:`1px solid ${b.color}25` }}><strong>{b.count}</strong> {b.label}</div>
              ))}
            </div>
            <div style={s.tableCard}>
              {loadingStaff ? <div style={s.emptyState}><p style={{ color:'#78716c' }}>Loading…</p></div>
                : staff.length === 0 ? (
                  <div style={s.emptyState}><div style={{ fontSize:56 }}>👥</div><p style={{ color:'#78716c',fontSize:15,marginTop:12,marginBottom:16 }}>No staff yet</p><button onClick={()=>setModal(true)} style={s.addBtn}>Add First Staff</button></div>
                ) : (
                  <>
                    <div style={s.tableHead}><span>Name</span><span>Email</span><span>Role</span><span>Added</span><span></span></div>
                    {staff.map(member=>{
                      const rc = ROLE_COLORS[member.role]||{bg:'#f5f5f4',text:'#44403c',dot:'#a8a29e',icon:'👤'};
                      return (
                        <div key={member._id} style={s.tableRow}>
                          <div style={s.staffNameCell}>
                            <div style={{ ...s.staffAvatarSm,background:`${rc.dot}20`,color:rc.dot }}>{member.name[0].toUpperCase()}</div>
                            <span style={{ fontSize:14,fontWeight:500,color:'#1c1917' }}>{member.name}</span>
                          </div>
                          <span style={{ fontSize:13,color:'#78716c' }}>{member.email}</span>
                          <span><span style={{ ...s.rolePill,background:rc.bg,color:rc.text }}><span style={{ width:6,height:6,borderRadius:'50%',background:rc.dot,display:'inline-block',marginRight:5 }}/>{rc.icon} {member.role}</span></span>
                          <span style={{ fontSize:12,color:'#a8a29e' }}>{new Date(member.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</span>
                          <span style={{ textAlign:'right' }}><button onClick={()=>handleDelete(member._id,member.name)} disabled={deletingId===member._id} style={s.deleteBtn}>{deletingId===member._id?'...':'Remove'}</button></span>
                        </div>
                      );
                    })}
                  </>
                )}
            </div>
          </div>
        )}

        {/* ── Settings Tab ── */}
        {nav === 'settings' && (
          <div className="anim-fadeUp">
            <div style={s.pageHead}><h1 style={s.pageTitle}>Settings</h1><p style={s.pageSub}>Configure your POS Café system.</p></div>
            <div style={s.settingsCard}>
              {[{label:'Café Name',val:'POS Café',edit:true},{label:'Admin Email',val:user?.email},{label:'GST Rate',val:'5%',edit:true},{label:'Currency',val:'INR (₹)'},{label:'POS Session',val:'● Active',editLabel:'Close',danger:true}].map((row,i,arr)=>(
                <div key={row.label}>
                  <div style={s.settingRow}>
                    <div><div style={s.settingLabel}>{row.label}</div><div style={s.settingVal}>{row.val}</div></div>
                    {row.edit&&<button style={{ ...s.editBtn,color:row.danger?'#dc2626':undefined,borderColor:row.danger?'#fecaca':undefined }}>{row.editLabel||'Edit'}</button>}
                  </div>
                  {i<arr.length-1&&<div style={s.settingDivider}/>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── Add Staff Modal ─── */}
      {showModal && (
        <div style={m.overlay} onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div style={m.modal} className="anim-popIn">
            <div style={m.modalHead}>
              <div><h3 style={m.modalTitle}>Add Staff Member</h3><p style={m.modalSub}>Create a cashier or kitchen account</p></div>
              <button onClick={()=>setModal(false)} style={m.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              {[{name:'name',label:'Full Name',type:'text',ph:'Jane Smith',icon:'👤'},{name:'email',label:'Email',type:'email',ph:'jane@cafe.com',icon:'📧'}].map(f=>(
                <div key={f.name} style={m.field}>
                  <label style={m.label}>{f.label}</label>
                  <div style={m.inputWrap}><span style={m.icon}>{f.icon}</span><input name={f.name} type={f.type} placeholder={f.ph} value={form[f.name]} onChange={e=>setForm(p=>({...p,[e.target.name]:e.target.value}))} required style={m.input}/></div>
                </div>
              ))}
              <div style={m.field}>
                <label style={m.label}>Password</label>
                <div style={m.inputWrap}>
                  <span style={m.icon}>🔒</span>
                  <input name="password" type={showPwd?'text':'password'} placeholder="Min 6 chars" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required style={{ ...m.input,paddingRight:44 }}/>
                  <button type="button" onClick={()=>setShowPwd(p=>!p)} style={m.eyeBtn}>{showPwd?'🙈':'👁'}</button>
                </div>
              </div>
              <div style={m.field}>
                <label style={m.label}>Assign Role</label>
                <div style={m.roleToggle}>
                  {[{key:'cashier',icon:'🧾',label:'Cashier',color:'#3b82f6',desc:'POS terminal'},{key:'kitchen',icon:'🍳',label:'Kitchen',color:'#f97316',desc:'Order queue'}].map(r=>(
                    <button key={r.key} type="button" onClick={()=>setForm(p=>({...p,role:r.key}))} style={{ ...m.roleBtn,background:form.role===r.key?`${r.color}12`:'#fafaf9',borderColor:form.role===r.key?r.color:'#e7e5e4',boxShadow:form.role===r.key?`0 0 0 3px ${r.color}20`:'none' }}>
                      <div style={{ fontSize:22 }}>{r.icon}</div>
                      <div><div style={{ fontSize:13,fontWeight:700,color:form.role===r.key?r.color:'#1c1917' }}>{r.label}</div><div style={{ fontSize:11,color:'#78716c' }}>{r.desc}</div></div>
                      {form.role===r.key&&<div style={{ ...m.check,background:r.color }}>✓</div>}
                    </button>
                  ))}
                </div>
              </div>
              {formErr&&<div style={m.errBox} className="anim-slideDown">⚠ {formErr}</div>}
              <div style={m.btnRow}>
                <button type="button" onClick={()=>setModal(false)} style={m.cancelBtn}>Cancel</button>
                <button type="submit" disabled={creating} style={{ ...m.submitBtn,opacity:creating?0.7:1 }}>{creating?'Creating...':'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add/Edit Product Modal ─── */}
      {showProductModal && (
        <div style={m.overlay} onClick={e=>e.target===e.currentTarget&&setShowPM(false)}>
          <div style={{ ...m.modal,maxWidth:500 }} className="anim-popIn">
            <div style={m.modalHead}>
              <div><h3 style={m.modalTitle}>{editingProduct?'Edit Product':'Add Product'}</h3><p style={m.modalSub}>Menu item details</p></div>
              <button onClick={()=>setShowPM(false)} style={m.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
                <div style={{ ...m.field,gridColumn:'1/-1' }}>
                  <label style={m.label}>Product Name</label>
                  <div style={m.inputWrap}><span style={m.icon}>🏷️</span><input placeholder="e.g. Cappuccino" value={productForm.name} onChange={e=>setPF(p=>({...p,name:e.target.value}))} required style={m.input}/></div>
                </div>
                <div style={m.field}>
                  <label style={m.label}>Price (₹)</label>
                  <div style={m.inputWrap}><span style={m.icon}>💰</span><input type="number" placeholder="150" value={productForm.price} onChange={e=>setPF(p=>({...p,price:e.target.value}))} required min="0" style={m.input}/></div>
                </div>
                <div style={m.field}>
                  <label style={m.label}>Emoji</label>
                  <div style={m.inputWrap}><span style={m.icon}>✨</span><input placeholder="☕" value={productForm.emoji} onChange={e=>setPF(p=>({...p,emoji:e.target.value}))} style={m.input}/></div>
                </div>
                <div style={{ ...m.field,gridColumn:'1/-1' }}>
                  <label style={m.label}>Category</label>
                  <select value={productForm.category} onChange={e=>setPF(p=>({...p,category:e.target.value}))} style={{ ...m.input,paddingLeft:14,cursor:'pointer' }}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...m.field,gridColumn:'1/-1' }}>
                  <label style={m.label}>Description (optional)</label>
                  <div style={m.inputWrap}><span style={m.icon}>📝</span><input placeholder="Short description" value={productForm.description} onChange={e=>setPF(p=>({...p,description:e.target.value}))} style={m.input}/></div>
                </div>
                <div style={{ ...m.field,gridColumn:'1/-1',display:'flex',alignItems:'center',gap:10 }}>
                  <input type="checkbox" id="avail" checked={productForm.available} onChange={e=>setPF(p=>({...p,available:e.target.checked}))} style={{ accentColor:'#7c3aed',width:16,height:16 }}/>
                  <label htmlFor="avail" style={{ fontSize:13,fontWeight:600,color:'#44403c',cursor:'pointer' }}>Available on menu</label>
                </div>
              </div>
              {productFormErr&&<div style={m.errBox}>⚠ {productFormErr}</div>}
              <div style={m.btnRow}>
                <button type="button" onClick={()=>setShowPM(false)} style={m.cancelBtn}>Cancel</button>
                <button type="submit" disabled={savingProduct} style={{ ...m.submitBtn,opacity:savingProduct?0.7:1,background:'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>{savingProduct?'Saving...':editingProduct?'Update Product':'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Table Modal ─── */}
      {showTableModal && (
        <div style={m.overlay} onClick={e=>e.target===e.currentTarget&&setShowTM(false)}>
          <div style={{ ...m.modal,maxWidth:420 }} className="anim-popIn">
            <div style={m.modalHead}>
              <div><h3 style={m.modalTitle}>Add Table</h3><p style={m.modalSub}>A QR code will be generated automatically</p></div>
              <button onClick={()=>setShowTM(false)} style={m.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSaveTable}>
              <div style={m.field}>
                <label style={m.label}>Table Number</label>
                <div style={m.inputWrap}><span style={m.icon}>🔢</span><input type="number" placeholder="e.g. 5" min="1" value={tableForm.tableNumber} onChange={e=>setTF(p=>({...p,tableNumber:e.target.value}))} required style={m.input}/></div>
              </div>
              <div style={m.field}>
                <label style={m.label}>Label (optional)</label>
                <div style={m.inputWrap}><span style={m.icon}>🏷️</span><input placeholder="e.g. Window Table" value={tableForm.name} onChange={e=>setTF(p=>({...p,name:e.target.value}))} style={m.input}/></div>
              </div>
              <div style={m.field}>
                <label style={m.label}>Seating Capacity</label>
                <div style={m.inputWrap}><span style={m.icon}>👥</span><input type="number" min="1" max="20" value={tableForm.capacity} onChange={e=>setTF(p=>({...p,capacity:e.target.value}))} style={m.input}/></div>
              </div>
              {tableFormErr&&<div style={m.errBox}>⚠ {tableFormErr}</div>}
              <div style={m.btnRow}>
                <button type="button" onClick={()=>setShowTM(false)} style={m.cancelBtn}>Cancel</button>
                <button type="submit" disabled={savingTable} style={{ ...m.submitBtn,opacity:savingTable?0.7:1,background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>{savingTable?'Creating...':'Create Table'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { display:'flex', minHeight:'100vh', background:'#f7f4f0', fontFamily:"'Inter', sans-serif" },
  sidebar: { width:240, background:'#1c1917', flexShrink:0, display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', borderRight:'1px solid rgba(255,255,255,0.06)' },
  sideTop: { flex:1, padding:'28px 16px 20px' },
  sideBottom: { padding:'16px' },
  brand: { display:'flex', alignItems:'center', gap:12, marginBottom:36, paddingLeft:4 },
  brandIcon: { fontSize:24 },
  brandName: { fontSize:15, fontWeight:700, color:'#fafaf9', letterSpacing:'-0.02em' },
  brandSub: { fontSize:10, color:'#57534e' },
  nav: { display:'flex', flexDirection:'column', gap:2 },
  navItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'1px solid transparent', fontSize:13.5, fontWeight:500, cursor:'pointer', transition:'all 0.15s ease', fontFamily:'Inter, sans-serif', position:'relative' },
  navActive: { position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:3, height:16, borderRadius:2, background:'#f59e0b' },
  userCard: { display:'flex', alignItems:'center', gap:10, marginBottom:12 },
  userAvatar: { width:34, height:34, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'#000', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' },
  userName: { fontSize:13, fontWeight:600, color:'#fafaf9' },
  userRole: { fontSize:10.5, color:'#57534e' },
  logoutBtn: { width:'100%', padding:'10px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#78716c', fontSize:13, cursor:'pointer', fontWeight:500, fontFamily:'Inter, sans-serif', transition:'all 0.15s', textAlign:'left' },
  main: { flex:1, padding:'40px 48px', maxWidth:1200, overflowY:'auto' },
  toast: { position:'fixed', top:24, right:24, padding:'12px 20px', borderRadius:12, fontSize:13.5, fontWeight:600, zIndex:999, boxShadow:'0 8px 24px rgba(0,0,0,0.12)' },
  pageHead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 },
  pageTitle: { fontSize:24, fontWeight:800, color:'#1c1917', letterSpacing:'-0.03em', marginBottom:5 },
  pageSub: { fontSize:13.5, color:'#78716c' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 },
  statCard: { background:'#fff', borderRadius:16, padding:'22px', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', border:'1px solid #ece9e6' },
  statIconBox: { width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 },
  statTrend: { fontSize:13, fontWeight:700 },
  statValue: { fontSize:28, fontWeight:800, letterSpacing:'-0.04em', marginBottom:3 },
  statLabel: { fontSize:12.5, fontWeight:600, color:'#44403c', marginBottom:2 },
  statDesc: { fontSize:11, color:'#a8a29e' },
  quickSection: { marginBottom:32 },
  quickGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:14 },
  quickCard: { display:'flex', alignItems:'center', gap:14, background:'#fff', borderRadius:14, padding:'16px 18px', border:'1px solid #ece9e6', cursor:'pointer', transition:'all 0.15s ease', textAlign:'left', fontFamily:'Inter, sans-serif' },
  quickIcon: { width:42, height:42, borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 },
  quickLabel: { fontSize:13.5, fontWeight:600, color:'#1c1917', marginBottom:3 },
  quickDesc: { fontSize:11.5, color:'#78716c' },
  sectionTitle: { fontSize:16, fontWeight:700, color:'#1c1917', marginBottom:14 },
  filterBtn: { padding:'7px 16px', borderRadius:20, border:'1.5px solid', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .15s', fontFamily:'Inter, sans-serif' },
  ordersGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 },
  orderCard: { background:'#fff', borderRadius:14, padding:'18px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid #ece9e6' },
  orderCardHead: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  orderIdText: { fontSize:14, fontWeight:700, color:'#1c1917' },
  orderCustomer: { fontSize:12, color:'#78716c', marginTop:3 },
  statusPill: { display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  orderTime: { fontSize:11, color:'#a8a29e', marginTop:4 },
  orderItems: { background:'#fafaf9', borderRadius:8, padding:'10px 12px', display:'flex', flexDirection:'column', gap:6, marginBottom:12, fontSize:13, color:'#44403c' },
  orderItemRow: { display:'flex', alignItems:'center', gap:8 },
  orderCardFooter: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  deleteOrderBtn: { padding:'7px 14px', borderRadius:8, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', fontSize:12, cursor:'pointer', fontWeight:500, fontFamily:'Inter, sans-serif' },
  addBtn: { padding:'10px 20px', borderRadius:10, border:'none', background:'#1c1917', color:'#fff', fontSize:13.5, fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif', boxShadow:'0 2px 8px rgba(28,25,23,0.2)' },
  tableCard: { background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', border:'1px solid #ece9e6' },
  tableHead: { display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr', gap:16, padding:'12px 20px', fontSize:11, fontWeight:700, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.07em', background:'#fafaf9', borderBottom:'1px solid #f0eeed' },
  tableRow: { display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr 1fr', gap:16, padding:'15px 20px', alignItems:'center', borderBottom:'1px solid #fafaf9', transition:'background 0.1s' },
  staffNameCell: { display:'flex', alignItems:'center', gap:10 },
  staffAvatarSm: { width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 },
  rolePill: { display:'inline-flex', alignItems:'center', padding:'4px 12px', borderRadius:99, fontSize:12, fontWeight:600, textTransform:'capitalize', whiteSpace:'nowrap' },
  countBadge: { padding:'6px 14px', borderRadius:99, fontSize:12.5, fontWeight:600 },
  deleteBtn: { padding:'5px 12px', borderRadius:8, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', fontSize:12, cursor:'pointer', fontWeight:500, fontFamily:'Inter, sans-serif' },
  editBtn: { padding:'5px 12px', borderRadius:8, border:'1px solid #e7e5e4', background:'#fafaf9', color:'#44403c', fontSize:12, cursor:'pointer', fontWeight:500, fontFamily:'Inter, sans-serif' },
  emptyState: { textAlign:'center', padding:'56px 0' },
  settingsCard: { background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.05)', border:'1px solid #ece9e6' },
  settingRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px' },
  settingLabel: { fontSize:12, fontWeight:600, color:'#a8a29e', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 },
  settingVal: { fontSize:14.5, fontWeight:500, color:'#1c1917' },
  settingDivider: { height:1, background:'#f7f4f0' },
};

const m = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:24 },
  modal: { background:'#fff', borderRadius:24, padding:'36px', width:'100%', maxWidth:460, boxShadow:'0 24px 80px rgba(0,0,0,0.25)', maxHeight:'90vh', overflowY:'auto' },
  modalHead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28 },
  modalTitle: { fontSize:20, fontWeight:800, color:'#1c1917', letterSpacing:'-0.02em', marginBottom:4 },
  modalSub: { fontSize:13, color:'#78716c' },
  closeBtn: { background:'#f5f5f4', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  field: { marginBottom:18 },
  label: { display:'block', fontSize:12.5, fontWeight:600, color:'#44403c', marginBottom:7 },
  inputWrap: { position:'relative', display:'flex', alignItems:'center' },
  icon: { position:'absolute', left:13, fontSize:15, pointerEvents:'none', color:'#a8a29e' },
  input: { width:'100%', padding:'11px 14px 11px 38px', borderRadius:10, border:'1.5px solid #e7e5e4', fontSize:14, color:'#1c1917', background:'#fafaf9', fontFamily:'Inter, sans-serif', boxSizing:'border-box' },
  eyeBtn: { position:'absolute', right:12, background:'none', border:'none', cursor:'pointer', fontSize:16, padding:'4px', borderRadius:6, color:'#a8a29e' },
  roleToggle: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  roleBtn: { padding:'14px', borderRadius:12, border:'2px solid', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all .15s', position:'relative', fontFamily:'Inter, sans-serif' },
  check: { position:'absolute', top:-8, right:-8, width:20, height:20, borderRadius:'50%', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' },
  errBox: { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#dc2626', marginBottom:16 },
  btnRow: { display:'flex', gap:12, justifyContent:'flex-end', marginTop:8 },
  cancelBtn: { padding:'11px 22px', borderRadius:10, border:'1.5px solid #e7e5e4', background:'#fafaf9', color:'#44403c', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'Inter, sans-serif' },
  submitBtn: { padding:'11px 28px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#1c1917,#292524)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Inter, sans-serif' },
};
