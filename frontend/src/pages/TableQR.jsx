import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABLES = [1, 2, 3, 4, 5, 6, 7, 8];
const BASE_URL = window.location.origin; // e.g. http://localhost:5173

export default function TableQR() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const [selected, setSelected] = useState(null); // which table is in "big view"
  const canvasRefs          = useRef({});

  const handleLogout = () => { logout(); navigate('/login'); };

  /* Download QR as PNG */
  const downloadQR = (tableNo) => {
    const canvas = canvasRefs.current[tableNo];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `table-${tableNo}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  /* Print a single table QR in a new window */
  const printQR = (tableNo) => {
    const canvas = canvasRefs.current[tableNo];
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Table ${tableNo} QR</title>
      <style>
        body { display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Inter,sans-serif;margin:0;background:#fff; }
        img  { width:240px;height:240px;border:3px solid #e9d5ff;border-radius:16px;padding:10px; }
        h2   { font-size:30px;font-weight:900;color:#1c1917;margin:16px 0 4px; }
        p    { font-size:14px;color:#78716c; }
      </style>
      </head><body>
        <img src="${dataUrl}" />
        <h2>Table ${tableNo}</h2>
        <p>Scan to order from POS Café</p>
        <script>window.onload=()=>window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  const tableUrl = (n) => `${BASE_URL}/table/${n}`;

  return (
    <div style={s.page}>
      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <button onClick={() => navigate(user?.role === 'admin' ? '/dashboard' : '/pos')} style={s.backBtn}>
            ← Back
          </button>
          <span style={{ fontSize: 24 }}>☕</span>
          <div>
            <div style={s.appName}>POS Café</div>
            <div style={s.appSub}>Table QR Codes</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.userBadge}>
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.userRole}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Sign Out</button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroIcon}>🔲</div>
        <div>
          <h1 style={s.heroTitle}>Table QR Codes</h1>
          <p style={s.heroSub}>
            Print or download a QR code for each table. Customers scan it to open the ordering page directly — no login needed.
          </p>
        </div>
      </div>

      {/* ── Grid ── */}
      <div style={s.grid}>
        {TABLES.map(n => (
          <div key={n} style={s.card}>
            {/* Header strip */}
            <div style={s.cardHead}>
              <span style={s.tableLabel}>Table {n}</span>
              <span style={s.qrIcon}>📱</span>
            </div>

            {/* QR */}
            <div style={s.qrWrap}>
              <QRCodeCanvas
                ref={el => { if (el) canvasRefs.current[n] = el; }}
                value={tableUrl(n)}
                size={160}
                bgColor="#ffffff"
                fgColor="#1c1917"
                level="M"
                includeMargin
              />
            </div>

            {/* URL */}
            <div style={s.urlText}>{tableUrl(n)}</div>

            {/* Actions */}
            <div style={s.cardActions}>
              <button onClick={() => downloadQR(n)} style={s.dlBtn}>⬇ Download</button>
              <button onClick={() => printQR(n)} style={s.printBtn}>🖨 Print</button>
              <button onClick={() => setSelected(n)} style={s.previewBtn}>🔍</button>
            </div>

            {/* Test link */}
            <a href={tableUrl(n)} target="_blank" rel="noreferrer" style={s.testLink}>
              ↗ Open ordering page
            </a>
          </div>
        ))}
      </div>

      {/* ── Full-screen preview modal ── */}
      {selected && (
        <div style={s.overlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} style={s.closeBtn}>✕</button>
            <h3 style={s.modalTitle}>Table {selected}</h3>
            <div style={s.modalQr}>
              <QRCodeCanvas
                value={tableUrl(selected)}
                size={260}
                bgColor="#ffffff"
                fgColor="#1c1917"
                level="M"
                includeMargin
              />
            </div>
            <p style={s.modalUrl}>{tableUrl(selected)}</p>
            <div style={s.modalActions}>
              <button onClick={() => downloadQR(selected)} style={s.dlBtnLg}>⬇ Download PNG</button>
              <button onClick={() => printQR(selected)} style={s.printBtnLg}>🖨 Print</button>
            </div>
            <a href={tableUrl(selected)} target="_blank" rel="noreferrer" style={s.modalLink}>
              ↗ Open Ordering Page
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8f5ff', fontFamily: "'Inter',sans-serif" },

  header: {
    background: '#fff', borderBottom: '1px solid #e9d5ff',
    padding: '0 28px', height: 64, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 16px rgba(124,58,237,0.06)',
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 14 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 14 },
  backBtn:     { background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 },
  appName:     { fontSize: 14, fontWeight: 800, color: '#1c1917' },
  appSub:      { fontSize: 11, color: '#7c3aed', fontWeight: 600 },
  userBadge:   { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:      { width: 34, height: 34, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userName:    { fontSize: 13, fontWeight: 600, color: '#1c1917' },
  userRole:    { fontSize: 11, color: '#7c3aed', textTransform: 'capitalize' },
  logoutBtn:   { padding: '7px 14px', borderRadius: 8, border: '1px solid #e9d5ff', background: 'transparent', color: '#7c3aed', cursor: 'pointer', fontSize: 13, fontWeight: 500 },

  hero: {
    display: 'flex', alignItems: 'center', gap: 18,
    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    padding: '28px 40px', color: '#fff',
  },
  heroIcon:  { fontSize: 52, flexShrink: 0 },
  heroTitle: { fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6 },
  heroSub:   { fontSize: 14, opacity: 0.82, maxWidth: 560 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20, padding: '32px 32px 60px' },

  card: {
    background: '#fff', borderRadius: 20, padding: '22px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    boxShadow: '0 4px 20px rgba(124,58,237,0.08)',
    border: '1.5px solid #f0e6ff',
    transition: 'transform .15s, box-shadow .15s',
  },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  tableLabel: { fontSize: 16, fontWeight: 800, color: '#1c1917' },
  qrIcon: { fontSize: 20 },

  qrWrap: { padding: 8, background: '#faf5ff', borderRadius: 14, border: '2px solid #e9d5ff', marginBottom: 12 },

  urlText: { fontSize: 10, color: '#a8a29e', textAlign: 'center', marginBottom: 14, wordBreak: 'break-all' },

  cardActions: { display: 'flex', gap: 8, width: '100%', marginBottom: 10 },
  dlBtn:    { flex: 1, padding: '9px', borderRadius: 9, border: '1px solid #e9d5ff', background: '#f5f3ff', color: '#7c3aed', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  printBtn: { flex: 1, padding: '9px', borderRadius: 9, border: '1px solid #e9d5ff', background: '#f5f3ff', color: '#7c3aed', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  previewBtn: { padding: '9px 12px', borderRadius: 9, border: '1px solid #e9d5ff', background: '#fff', color: '#7c3aed', fontSize: 13, cursor: 'pointer' },

  testLink: { fontSize: 12, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 },

  /* Modal */
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 24 },
  modal:   { background: '#fff', borderRadius: 24, padding: '36px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.25)', position: 'relative' },
  closeBtn:    { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f5f5f4', color: '#44403c', fontSize: 14, cursor: 'pointer' },
  modalTitle:  { fontSize: 22, fontWeight: 900, color: '#1c1917', marginBottom: 20 },
  modalQr:     { display: 'inline-block', padding: 12, background: '#faf5ff', borderRadius: 16, border: '2px solid #e9d5ff', marginBottom: 14 },
  modalUrl:    { fontSize: 11, color: '#a8a29e', marginBottom: 20, wordBreak: 'break-all' },
  modalActions:{ display: 'flex', gap: 10, marginBottom: 14 },
  dlBtnLg:    { flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  printBtnLg: { flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #7c3aed', background: '#fff', color: '#7c3aed', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  modalLink:  { fontSize: 13, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 },
};
