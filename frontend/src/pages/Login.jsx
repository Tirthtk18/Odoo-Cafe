import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'admin',   icon: '👑', label: 'Admin',         desc: 'Full system control',    color: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
  { key: 'cashier', icon: '🧾', label: 'Cashier',       desc: 'POS terminal access',    color: '#3b82f6', shadow: 'rgba(59,130,246,0.3)'  },
  { key: 'kitchen', icon: '🍳', label: 'Kitchen Staff', desc: 'Order queue & prep',     color: '#f97316', shadow: 'rgba(249,115,22,0.3)'  },
  { key: 'user',    icon: '☕', label: 'Customer',      desc: 'Browse & order online',  color: '#a855f7', shadow: 'rgba(168,85,247,0.3)'  },
];

const REDIRECT = { admin: '/dashboard', cashier: '/pos', kitchen: '/kitchen', user: '/user' };

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [activeRole, setActive] = useState(null);
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const emailRef                = useRef(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await loginApi(form);
    setLoading(false);

    if (res.token) {
      setActive(res.role);
      login(res);
      setTimeout(() => navigate(REDIRECT[res.role] || '/login'), 400);
    } else if (res.needsVerification) {
      navigate('/verify-otp', { state: { email: form.email } });
    } else {
      setError(res.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div style={s.page}>
      {/* Animated background */}
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />
      <div style={s.bgOrb3} />

      {/* ── Left Panel: Brand + Role showcase ── */}
      <div style={s.left}>
        <div style={s.leftInner}>
          {/* Brand */}
          <div style={s.brand}>
            <div style={s.brandIcon}>☕</div>
            <span style={s.brandName}>POS Café</span>
          </div>

          <div style={s.taglineWrap}>
            <h1 style={s.tagline}>
              Welcome<br />
              <span className="gradient-text">back.</span>
            </h1>
            <p style={s.taglineSub}>
              Sign in to access your role-based workspace and manage your café operations seamlessly.
            </p>
          </div>

          <div style={s.divider} />

          <p style={s.rolesLabel}>Available roles</p>
          <div style={s.roleGrid}>
            {ROLES.map((r, i) => (
              <div
                key={r.key}
                style={{
                  ...s.roleCard,
                  animationDelay: `${i * 0.08}s`,
                  borderColor: activeRole === r.key ? r.color : 'rgba(255,255,255,0.07)',
                  background: activeRole === r.key ? `${r.color}14` : 'rgba(255,255,255,0.03)',
                  boxShadow: activeRole === r.key ? `0 0 0 1px ${r.color}40, 0 4px 20px ${r.shadow}` : 'none',
                }}
                className="anim-fadeSlideRight"
              >
                <div style={{ ...s.roleIconBox, background: `${r.color}20`, color: r.color, boxShadow: activeRole === r.key ? `0 0 12px ${r.shadow}` : 'none' }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ ...s.roleLabel, color: activeRole === r.key ? r.color : '#fafaf9' }}>{r.label}</div>
                  <div style={s.roleDesc}>{r.desc}</div>
                </div>
                {activeRole === r.key && (
                  <div style={{ ...s.activeCheck, background: r.color }} className="anim-popIn">✓</div>
                )}
              </div>
            ))}
          </div>

          <div style={s.leftFooter}>
            <div style={s.statBadge}>🔐 OTP Verified</div>
            <div style={s.statBadge}>🛡 JWT Secured</div>
            <div style={s.statBadge}>⚡ Real-time</div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div style={s.right}>
        <div style={s.card} className="anim-fadeUp">
          {/* Card header */}
          <div style={s.cardHeader}>
            <div style={s.headerIcon}>
              <span style={{ fontSize: 28 }}>🔑</span>
            </div>
            <h2 style={s.title}>Sign in</h2>
            <p style={s.sub}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={s.field}>
              <label style={s.label} htmlFor="login-email">Email address</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>📧</span>
                <input
                  id="login-email"
                  ref={emailRef}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  autoComplete="email"
                  style={s.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label} htmlFor="login-password">Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  id="login-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Your password"
                  autoComplete="current-password"
                  style={{ ...s.input, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={s.eyeBtn}
                  title={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox} className="anim-slideDown">
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{ ...s.btn, opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={s.spinner} />
                  Signing in...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Sign In
                  <span style={{ fontSize: 18 }}>→</span>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={s.orRow}>
            <div style={s.orLine} />
            <span style={s.orText}>New to POS Café?</span>
            <div style={s.orLine} />
          </div>

          <Link to="/signup" style={s.signupBtn} id="go-to-signup">
            Create an account →
          </Link>

          <p style={s.secureNote}>
            🔐 Your session is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0d0c0b',
    position: 'relative',
    overflow: 'hidden',
  },

  /* Animated background orbs */
  bgOrb1: {
    position: 'absolute', top: '15%', left: '20%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
    animation: 'orb 12s ease-in-out infinite',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '10%', right: '25%',
    width: 320, height: 320, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
    animation: 'orb 16s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  bgOrb3: {
    position: 'absolute', top: '60%', left: '40%',
    width: 240, height: 240, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
    animation: 'orb 20s ease-in-out infinite 4s',
    pointerEvents: 'none',
  },

  /* Left */
  left: {
    width: 420,
    flexShrink: 0,
    background: 'linear-gradient(160deg, #1a1614 0%, #0f0d0c 100%)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    padding: '48px 0',
    position: 'relative',
    zIndex: 1,
  },
  leftInner: {
    padding: '0 44px',
    width: '100%',
  },

  brand: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 },
  brandIcon: {
    width: 42, height: 42, borderRadius: 12,
    background: 'linear-gradient(135deg, #f59e0b22 0%, #f9731622 100%)',
    border: '1px solid rgba(245,158,11,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22,
  },
  brandName: { fontSize: 18, fontWeight: 700, color: '#fafaf9', letterSpacing: '-0.02em' },

  taglineWrap: { marginBottom: 36 },
  tagline: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 52, fontWeight: 400,
    lineHeight: 1.05, marginBottom: 16,
    color: '#fafaf9',
  },
  taglineSub: { fontSize: 13, color: '#57534e', lineHeight: 1.75 },

  divider: { height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 },

  rolesLabel: {
    fontSize: 10.5, color: '#44403c', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12,
  },
  roleGrid: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 },
  roleCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 14px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(255,255,255,0.03)',
    transition: 'all 0.25s ease',
    position: 'relative',
    animation: 'fadeUp 0.4s ease both',
  },
  roleIconBox: {
    width: 38, height: 38, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0, 
    transition: 'box-shadow 0.25s ease',
  },
  roleLabel:  { fontSize: 13, fontWeight: 600 },
  roleDesc:   { fontSize: 11, color: '#57534e', marginTop: 2 },
  activeCheck: {
    position: 'absolute', top: -6, right: -6,
    width: 20, height: 20, borderRadius: '50%',
    color: '#000', fontSize: 10, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  leftFooter: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  statBadge: {
    padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
    color: '#78716c',
  },

  /* Right */
  right: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px',
    background: '#f7f4f0',
    position: 'relative', zIndex: 1,
  },
  card: {
    background: '#ffffff',
    borderRadius: 24, padding: '44px 40px',
    width: '100%', maxWidth: 420,
    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.12)',
    border: '1px solid #ece9e6',
  },
  cardHeader: { textAlign: 'center', marginBottom: 32 },
  headerIcon: {
    width: 68, height: 68, borderRadius: 20,
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #fcd34d',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 4px 16px rgba(245,158,11,0.2)',
  },
  title:  { fontSize: 26, fontWeight: 800, color: '#1c1917', marginBottom: 6, letterSpacing: '-0.03em' },
  sub:    { fontSize: 13.5, color: '#78716c' },

  field:  { marginBottom: 18 },
  label:  { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#44403c', marginBottom: 7, letterSpacing: '0.01em' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, fontSize: 15, pointerEvents: 'none', color: '#a8a29e' },
  input: {
    width: '100%', padding: '12px 14px 12px 40px',
    borderRadius: 12, border: '1.5px solid #e7e5e4',
    fontSize: 14, color: '#1c1917', background: '#fafaf9',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: 12, background: 'none', border: 'none',
    cursor: 'pointer', fontSize: 16, padding: '4px', borderRadius: 6,
    color: '#a8a29e', transition: 'color 0.15s',
  },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 12, padding: '12px 16px',
    fontSize: 13, color: '#dc2626', marginBottom: 18,
  },

  btn: {
    width: '100%', padding: '14px',
    borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    color: '#fff', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.15s, transform 0.1s',
    boxShadow: '0 4px 16px rgba(28,25,23,0.25)',
    letterSpacing: '0.01em',
  },
  spinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.25)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.65s linear infinite',
  },

  orRow:   { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0 16px' },
  orLine:  { flex: 1, height: 1, background: '#ece9e6' },
  orText:  { fontSize: 12, color: '#a8a29e', whiteSpace: 'nowrap' },

  signupBtn: {
    display: 'block', textAlign: 'center', padding: '13px',
    borderRadius: 12, border: '1.5px solid #e7e5e4',
    color: '#1c1917', fontSize: 14, fontWeight: 600,
    textDecoration: 'none', background: '#fafaf9',
    transition: 'background 0.15s, border-color 0.15s',
    letterSpacing: '0.01em',
  },
  secureNote: {
    textAlign: 'center', fontSize: 11.5, color: '#c0bbb7', marginTop: 20,
  },
};
