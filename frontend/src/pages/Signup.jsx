import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupApi } from '../api/authApi';

// Only customer self-registration is allowed.
// Admin accounts are created by a backend seeder or existing admin via the dashboard.
const ROLES = [
  {
    key:    'user',
    icon:   '☕',
    label:  'Customer',
    desc:   'Browse the menu and place orders online',
    color:  '#a855f7',
    shadow: 'rgba(168,85,247,0.25)',
    bg:     '#faf5ff',
    border: '#e9d5ff',
    tag:    'Self-serve',
    perks:  ['View menu', 'Place orders', 'Track status'],
  },
];

function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '#e7e5e4' };
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
    if (score <= 3) return { score, label: 'Fair',   color: '#f59e0b' };
    if (score <= 4) return { score, label: 'Good',   color: '#22c55e' };
    return                { score, label: 'Strong', color: '#15803d' };
  };

  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 4,
            background: i <= score ? color : '#e7e5e4',
            transition: 'background 0.2s ease',
          }} />
        ))}
      </div>
      {label && <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label} password</span>}
    </div>
  );
}

export default function Signup() {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [role, setRole]       = useState('user');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate              = useNavigate();

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters');
    if (!form.name.trim())
      return setError('Please enter your full name');

    setLoading(true);
    const res = await signupApi({ ...form, role });
    setLoading(false);

    if (res.message === 'OTP sent to your email') {
      navigate('/verify-otp', { state: { email: form.email, role } });
    } else {
      setError(res.message || 'Signup failed. Please try again.');
    }
  };

  const selected = ROLES.find(r => r.key === role);

  return (
    <div style={s.page}>
      {/* Background orbs */}
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />

      {/* ── Left Panel ── */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <div style={s.brand}>
            <div style={s.brandIcon}>☕</div>
            <span style={s.brandName}>POS Café</span>
          </div>

          <h1 style={s.tagline}>
            Join us<br />
            <span className="gradient-text">today.</span>
          </h1>
          <p style={s.taglineSub}>
            Choose your role and get verified in seconds. Start managing your café operations right away.
          </p>

          <div style={s.divider} />

          {/* Feature highlights */}
          <div style={s.featureList}>
            {[
              { icon: '🔐', title: 'OTP Verification',     desc: '6-digit email code for safety' },
              { icon: '🧾', title: 'Role-Based Access',    desc: 'Each role gets its own workspace' },
              { icon: '📦', title: 'Real-Time Orders',     desc: 'Live POS + kitchen sync' },
              { icon: '📊', title: 'Admin Dashboard',      desc: 'Full reports & staff management' },
            ].map((f, i) => (
              <div key={f.title} style={{ ...s.featureItem, animationDelay: `${i * 0.1}s` }} className="anim-fadeUp">
                <div style={s.featureIconBox}>{f.icon}</div>
                <div>
                  <div style={s.featureTitle}>{f.title}</div>
                  <div style={s.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Signup Form ── */}
      <div style={s.right}>
        <div style={s.card} className="anim-fadeUp">
          <div style={s.cardHeader}>
            <div style={s.headerIcon}>✨</div>
            <h2 style={s.title}>Create Account</h2>
            <p style={s.sub}>Select your role to get started</p>
          </div>

          {/* ── Role Selector ── */}
          <div style={s.roleGrid}>
            {ROLES.map(r => (
              <button
                key={r.key}
                type="button"
                id={`role-${r.key}`}
                onClick={() => setRole(r.key)}
                style={{
                  ...s.roleCard,
                  background:  role === r.key ? r.bg              : '#fafaf9',
                  borderColor: role === r.key ? r.color           : '#e7e5e4',
                  boxShadow:   role === r.key ? `0 0 0 3px ${r.color}25, 0 4px 16px ${r.shadow}` : 'none',
                  transform:   role === r.key ? 'translateY(-1px)' : 'none',
                }}
              >
                <div style={{ ...s.roleEmoji, background: `${r.color}18`, fontSize: 24 }}>{r.icon}</div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: role === r.key ? r.color : '#1c1917', marginBottom: 3 }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#78716c' }}>{r.desc}</div>
                  {role === r.key && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }} className="anim-slideDown">
                      {r.perks.map(p => (
                        <span key={p} style={{ ...s.perk, background: `${r.color}18`, color: r.color }}>✓ {p}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{
                  ...s.roleCheck,
                  background:   role === r.key ? r.color : '#f0eeed',
                  color:        role === r.key ? '#fff'  : '#c0bbb7',
                  border:      `2px solid ${role === r.key ? r.color : '#e7e5e4'}`,
                  transform:    role === r.key ? 'scale(1)' : 'scale(0.9)',
                }}>
                  {role === r.key ? '✓' : ''}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ marginTop: 20 }}>
            {/* Name */}
            <div style={s.field}>
              <label style={s.label} htmlFor="signup-name">Full Name</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>👤</span>
                <input
                  id="signup-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  style={s.input}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div style={s.field}>
              <label style={s.label} htmlFor="signup-email">Email Address</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>📧</span>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder={role === 'admin' ? 'admin@yourcafe.com' : 'you@email.com'}
                  style={s.input}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={s.label} htmlFor="signup-password">Password</label>
              <div style={s.inputWrap}>
                <span style={s.inputIcon}>🔒</span>
                <input
                  id="signup-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min 6 characters"
                  style={{ ...s.input, paddingRight: 44 }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} style={s.eyeBtn}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Error */}
            {error && (
              <div style={s.errorBox} className="anim-slideDown">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              style={{
                ...s.btn,
                background: `linear-gradient(135deg, ${selected?.color || '#1c1917'} 0%, ${selected?.color ? selected.color + 'cc' : '#292524'} 100%)`,
                boxShadow: `0 4px 20px ${selected?.shadow || 'rgba(28,25,23,0.25)'}`,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={s.spinner} /> Sending code...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Send Verification Code <span>→</span>
                </span>
              )}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account?{' '}
            <Link to="/login" style={{ ...s.link, color: selected?.color || '#1c1917' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex', minHeight: '100vh',
    background: '#0d0c0b', position: 'relative', overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute', top: '10%', right: '30%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
    animation: 'orb 14s ease-in-out infinite', pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '5%', left: '30%',
    width: 350, height: 350, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
    animation: 'orb 18s ease-in-out infinite reverse', pointerEvents: 'none',
  },

  left: {
    width: 400, flexShrink: 0,
    background: 'linear-gradient(160deg, #1a1614 0%, #0f0d0c 100%)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', padding: '48px 0',
    position: 'relative', zIndex: 1,
  },
  leftInner: { padding: '0 44px', width: '100%' },

  brand: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 44 },
  brandIcon: {
    width: 40, height: 40, borderRadius: 11,
    background: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
  },
  brandName: { fontSize: 18, fontWeight: 700, color: '#fafaf9', letterSpacing: '-0.02em' },

  tagline: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 50, fontWeight: 400, lineHeight: 1.05, marginBottom: 16, color: '#fafaf9',
  },
  taglineSub: { fontSize: 13, color: '#57534e', lineHeight: 1.75, marginBottom: 32 },
  divider: { height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 28 },

  featureList: { display: 'flex', flexDirection: 'column', gap: 16 },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: 14, animation: 'fadeUp 0.4s ease both' },
  featureIconBox: {
    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
  },
  featureTitle: { fontSize: 13, fontWeight: 600, color: '#d6d3d1', marginBottom: 3 },
  featureDesc:  { fontSize: 11.5, color: '#57534e', lineHeight: 1.5 },

  right: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px', background: '#f7f4f0', position: 'relative', zIndex: 1,
  },
  card: {
    background: '#fff', borderRadius: 24, padding: '40px 36px',
    width: '100%', maxWidth: 480,
    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.12)',
    border: '1px solid #ece9e6',
  },
  cardHeader: { textAlign: 'center', marginBottom: 24 },
  headerIcon: {
    width: 60, height: 60, borderRadius: 18,
    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
    border: '1px solid #c4b5fd',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, margin: '0 auto 16px',
  },
  title: { fontSize: 24, fontWeight: 800, color: '#1c1917', marginBottom: 5, letterSpacing: '-0.03em' },
  sub:   { fontSize: 13, color: '#78716c' },

  roleGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  roleCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 16px', borderRadius: 14,
    border: '1.5px solid', cursor: 'pointer',
    background: '#fafaf9', transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  roleEmoji: {
    width: 44, height: 44, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  perk: {
    fontSize: 10.5, fontWeight: 600, padding: '2px 8px',
    borderRadius: 99, letterSpacing: '0.01em',
  },
  roleCheck: {
    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, transition: 'all 0.2s ease',
  },

  field:     { marginBottom: 16 },
  label:     { display: 'block', fontSize: 12.5, fontWeight: 600, color: '#44403c', marginBottom: 7 },
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
    cursor: 'pointer', fontSize: 16, padding: '4px',
    borderRadius: 6, color: '#a8a29e',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 12, padding: '12px 16px',
    fontSize: 13, color: '#dc2626', marginBottom: 16,
  },
  btn: {
    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
    color: '#fff', fontSize: 15, fontWeight: 700,
    transition: 'opacity 0.15s, transform 0.1s',
    letterSpacing: '0.01em',
  },
  spinner: {
    width: 18, height: 18,
    border: '2px solid rgba(255,255,255,0.25)',
    borderTopColor: '#fff', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.65s linear infinite',
  },

  footer: { fontSize: 13, color: '#78716c', textAlign: 'center', marginTop: 22 },
  link:   { fontWeight: 700, textDecoration: 'none' },
};
