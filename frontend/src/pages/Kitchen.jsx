import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MOCK_ORDERS = [
  { id: 'ORD-001', table: 'T-3', items: ['Espresso x2', 'Croissant x1'], status: 'new',        time: '2m ago',  total: 250 },
  { id: 'ORD-002', table: 'T-7', items: ['Cappuccino x1', 'Veg Burger x1'], status: 'preparing', time: '6m ago',  total: 300 },
  { id: 'ORD-003', table: 'T-1', items: ['Masala Chai x3'], status: 'ready',      time: '10m ago', total: 120 },
];

const STATUS = {
  new:       { label: 'New',       bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', action: 'Start Preparing', next: 'preparing' },
  preparing: { label: 'Preparing', bg: '#fffbeb', text: '#d97706', dot: '#f59e0b', action: 'Mark as Ready',   next: 'ready'     },
  ready:     { label: 'Ready',     bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e', action: 'Served ✓',        next: 'served'    },
  served:    { label: 'Served',    bg: '#f0f9ff', text: '#0369a1', dot: '#38bdf8', action: null,              next: null        },
};

export default function Kitchen() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const handleLogout = () => { logout(); navigate('/login'); };

  const advanceOrder = (id) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const nextStatus = STATUS[o.status]?.next;
      return nextStatus ? { ...o, status: nextStatus } : o;
    }));
  };

  const newCount      = orders.filter(o => o.status === 'new').length;
  const preparingCount= orders.filter(o => o.status === 'preparing').length;
  const readyCount    = orders.filter(o => o.status === 'ready').length;

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: 22 }}>🍳</span>
          <div>
            <div style={s.appName}>POS Café</div>
            <div style={s.appSub}>Kitchen Display System</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.clockArea}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
          <span style={s.badge}>🍳 Kitchen</span>
          <span style={s.staffName}>{user?.name}</span>
          <button onClick={handleLogout} style={s.logoutBtn}>Sign Out</button>
        </div>
      </header>

      <div style={s.body}>
        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { icon: '🔴', label: 'New Orders',   value: newCount,       color: '#dc2626', bg: '#fef2f2' },
            { icon: '🟡', label: 'Preparing',     value: preparingCount, color: '#d97706', bg: '#fffbeb' },
            { icon: '🟢', label: 'Ready to Serve',value: readyCount,     color: '#16a34a', bg: '#f0fdf4' },
            { icon: '📋', label: 'Total Orders',  value: orders.length,  color: '#ea580c', bg: '#fff7ed' },
          ].map(st => (
            <div key={st.label} style={{ ...s.statCard, background: st.bg }}>
              <div style={s.statValue}>{st.icon} <span style={{ color: st.color }}>{st.value}</span></div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Orders grid */}
        <div style={s.ordersGrid}>
          {orders.map(order => {
            const st = STATUS[order.status];
            return (
              <div key={order.id} style={{ ...s.orderCard, borderTop: `4px solid ${st.dot}` }}>
                <div style={s.orderHead}>
                  <div>
                    <div style={s.orderId}>{order.id}</div>
                    <div style={s.orderTable}>🪑 {order.table}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...s.statusPill, background: st.bg, color: st.text }}>
                      <span style={{ width: 6, height: 6, background: st.dot, borderRadius: '50%', display: 'inline-block', marginRight: 5 }} />
                      {st.label}
                    </span>
                    <div style={s.orderTime}>{order.time}</div>
                  </div>
                </div>

                <div style={s.itemsList}>
                  {order.items.map((item, i) => (
                    <div key={i} style={s.itemRow}>
                      <span style={s.itemDot}>•</span>
                      <span style={s.itemText}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={s.orderFooter}>
                  <span style={s.orderTotal}>₹{order.total}</span>
                  {st.action && (
                    <button
                      onClick={() => advanceOrder(order.id)}
                      style={{ ...s.actionBtn, background: st.dot }}
                    >
                      {st.action}
                    </button>
                  )}
                  {!st.action && (
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✅ Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div style={s.empty}>
            <div style={{ fontSize: 56 }}>🍽</div>
            <p style={{ color: '#a8a29e', fontSize: 16, marginTop: 14 }}>No active orders right now</p>
            <p style={{ color: '#d6d3d1', fontSize: 13, marginTop: 6 }}>Orders from the POS will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', background: '#0f0e0d', fontFamily: "'Inter', sans-serif" },

  header:     { background: '#0c0a09', color: '#fff', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  appName:    { fontSize: 15, fontWeight: 700, color: '#fafaf9', letterSpacing: '-0.02em' },
  appSub:     { fontSize: 11, color: '#57534e' },
  headerRight:{ display: 'flex', alignItems: 'center', gap: 14 },
  clockArea:  { fontSize: 20, fontWeight: 800, color: '#f59e0b', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' },
  badge:      { fontSize: 12, background: 'rgba(234,88,12,0.15)', color: '#f97316', padding: '4px 12px', borderRadius: 99, fontWeight: 600, border: '1px solid rgba(249,115,22,0.25)' },
  staffName:  { fontSize: 13, color: '#57534e' },
  logoutBtn:  { padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)', background: 'transparent', color: '#78716c', cursor: 'pointer', fontSize: 13, fontFamily: "'Inter', sans-serif" },

  body:       { padding: '24px 28px' },

  statsRow:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
  statCard:   { borderRadius: 12, padding: '16px 18px' },
  statValue:  { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  statLabel:  { fontSize: 12, color: '#78716c' },

  ordersGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },

  orderCard:  { background: '#1c1917', borderRadius: 16, padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: "'Inter', sans-serif" },
  orderHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  orderId:    { fontSize: 14, fontWeight: 700, color: '#fafaf9', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.02em' },
  orderTable: { fontSize: 12, color: '#78716c', marginTop: 3 },
  statusPill: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  orderTime:  { fontSize: 11, color: '#57534e', textAlign: 'right', marginTop: 5 },

  itemsList:  { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  itemRow:    { display: 'flex', gap: 8, alignItems: 'center' },
  itemDot:    { color: '#78716c', fontSize: 18, lineHeight: 1 },
  itemText:   { fontSize: 14, color: '#d6d3d1' },

  orderFooter:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  orderTotal: { fontSize: 16, fontWeight: 700, color: '#f59e0b' },
  actionBtn:  { padding: '9px 16px', borderRadius: 9, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' },

  empty:      { textAlign: 'center', padding: '80px 0', color: '#fff' },
};
