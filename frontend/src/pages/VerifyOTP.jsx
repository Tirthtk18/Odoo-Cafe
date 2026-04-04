import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTPApi, resendOTPApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  admin:   { color: '#f59e0b', icon: '👑', label: 'Admin',         redirect: '/dashboard' },
  user:    { color: '#a855f7', icon: '☕', label: 'Customer',      redirect: '/user'      },
  cashier: { color: '#3b82f6', icon: '🧾', label: 'Cashier',       redirect: '/pos'       },
  kitchen: { color: '#f97316', icon: '🍳', label: 'Kitchen Staff', redirect: '/kitchen'   },
};

export default function VerifyOTP() {
  const [digits, setDigits]       = useState(['', '', '', '', '', '']);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [verified, setVerified]   = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [shake, setShake]         = useState(false);
  const inputs                    = useRef([]);
  const { state }                 = useLocation();
  const navigate                  = useNavigate();
  const { login }                 = useAuth();

  const email = state?.email;
  const role  = state?.role || 'user';
  const cfg   = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  useEffect(() => {
    if (!email) navigate('/signup');
    else inputs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown === 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError('');
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    // Auto-submit when all filled
    if (val && idx === 5) {
      const fullOtp = [...next].join('');
      if (fullOtp.length === 6) handleVerify([...next]);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0)
      inputs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setDigits(arr);
      inputs.current[5]?.focus();
      setTimeout(() => handleVerify(arr), 50);
    }
  };

  const handleVerify = async (digitArr = null) => {
    const otp = (digitArr || digits).join('');
    if (otp.length < 6) return setError('Please enter all 6 digits');
    setError('');
    setLoading(true);

    const res = await verifyOTPApi({ email, otp });
    setLoading(false);

    if (res.token) {
      setVerified(true);
      login(res);
      const redirect = ROLE_CONFIG[res.role]?.redirect || '/login';
      setTimeout(() => navigate(redirect), 1200);
    } else {
      setError(res.message || 'Verification failed. Try again.');
      setDigits(['', '', '', '', '', '']);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      inputs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    setError('');
    setResendMsg('');
    const res = await resendOTPApi({ email });
    if (res.message === 'New OTP sent') {
      setResendMsg('New OTP sent! Check your email.');
      setTimeout(() => setResendMsg(''), 4000);
    } else {
      setError(res.message || 'Failed to resend OTP');
    }
  };

  const progress = ((60 - countdown) / 60) * 100;
  const circumference = 2 * Math.PI * 28;
  const strokeDash = circumference - (progress / 100) * circumference;

  if (verified) {
    return (
      <div style={s.page}>
        <div style={s.bgOrb1} />
        <div style={s.card} className="anim-fadeUp">
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...s.successRing, borderColor: cfg.color, boxShadow: `0 0 0 12px ${cfg.color}15` }}>
              <span style={{ fontSize: 40 }}>✓</span>
            </div>
            <h2 style={{ ...s.title, color: cfg.color, marginTop: 24, marginBottom: 8 }}>Verified!</h2>
            <p style={s.sub}>
              Welcome, <strong>{cfg.icon} {cfg.label}</strong>.<br />
              Redirecting you to your workspace...
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ ...s.loadDot, background: cfg.color, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.bgOrb1} />
      <div style={s.bgOrb2} />

      <div style={s.card} className="anim-fadeUp">

        {/* ─ Header ─ */}
        <div style={s.header}>
          {/* Countdown ring */}
          <div style={s.countdown}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#f0eeed" strokeWidth="4" />
              <circle
                cx="36" cy="36" r="28" fill="none"
                stroke={canResend ? '#a8a29e' : cfg.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={canResend ? circumference : strokeDash}
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
              />
            </svg>
            <div style={s.countdownInner}>
              <span style={{ fontSize: 20 }}>📧</span>
            </div>
          </div>

          <h2 style={s.title}>Check your email</h2>
          <p style={s.sub}>
            We sent a 6-digit code to
          </p>
          <div style={{ ...s.emailBadge, borderColor: `${cfg.color}40`, background: `${cfg.color}0e` }}>
            <span style={{ fontSize: 13 }}>📬</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1c1917' }}>{email}</span>
          </div>

          {/* Role badge */}
          <div style={{ ...s.roleBadge, background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
            {cfg.icon} Registering as {cfg.label}
          </div>
        </div>

        {/* ─ OTP Input ─ */}
        <div
          style={{ ...s.otpRow, animation: shake ? 'shake 0.5s ease' : 'none' }}
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              value={d}
              maxLength={1}
              inputMode="numeric"
              id={`otp-${i}`}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              style={{
                ...s.otpBox,
                borderColor:  error ? '#ef4444' : d ? cfg.color : '#e7e5e4',
                background:   d ? `${cfg.color}08` : '#fff',
                boxShadow:    d ? `0 0 0 3px ${cfg.color}20` : 'none',
                transform:    d ? 'scale(1.05)' : 'scale(1)',
                color:        d ? cfg.color : '#1c1917',
              }}
            />
          ))}
        </div>

        {/* ─ Loading dots ─ */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ ...s.loadDot, background: cfg.color, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {/* ─ Error ─ */}
        {error && (
          <div style={s.errorBox} className="anim-slideDown">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ─ Success msg ─ */}
        {resendMsg && (
          <div style={s.successBox} className="anim-slideDown">
            <span>✅</span> {resendMsg}
          </div>
        )}

        {/* ─ Verify Button ─ */}
        <button
          id="verify-btn"
          onClick={() => handleVerify()}
          disabled={loading || digits.join('').length < 6}
          style={{
            ...s.btn,
            background: `linear-gradient(135deg, ${cfg.color} 0%, ${cfg.color}cc 100%)`,
            boxShadow: `0 4px 20px ${cfg.color}35`,
            opacity: (loading || digits.join('').length < 6) ? 0.6 : 1,
            cursor: (loading || digits.join('').length < 6) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Verifying...' : 'Verify Email →'}
        </button>

        {/* ─ Resend ─ */}
        <div style={s.resendRow}>
          {canResend ? (
            <span onClick={handleResend} style={{ ...s.resendLink, color: cfg.color }}>
              🔄 Resend code
            </span>
          ) : (
            <span style={s.resendTimer}>
              Resend available in <strong style={{ color: cfg.color }}>{countdown}s</strong>
            </span>
          )}
        </div>

        <div style={s.backRow}>
          <span onClick={() => navigate('/signup')} style={s.backLink}>
            ← Use a different email
          </span>
        </div>

        {/* ─ Info tip ─ */}
        <div style={s.tip}>
          💡 Didn't receive? Check your spam folder or request a new code after the timer ends.
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-10px); }
          40%       { transform: translateX(10px); }
          60%       { transform: translateX(-7px); }
          80%       { transform: translateX(7px); }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f7f4f0', padding: 24, position: 'relative', overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute', top: '-5%', right: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'absolute', bottom: '-10%', left: '-5%',
    width: 360, height: 360, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  card: {
    background: '#fff', borderRadius: 28, padding: '44px 48px',
    width: '100%', maxWidth: 460,
    boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.12)',
    border: '1px solid #ece9e6',
    position: 'relative', zIndex: 1,
  },

  header: { textAlign: 'center', marginBottom: 32 },

  countdown: {
    position: 'relative', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  countdownInner: {
    position: 'absolute', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },

  title: { fontSize: 24, fontWeight: 800, color: '#1c1917', marginBottom: 8, letterSpacing: '-0.03em' },
  sub:   { fontSize: 13.5, color: '#78716c', marginBottom: 12 },

  emailBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', borderRadius: 99, border: '1px solid',
    marginBottom: 12,
  },
  roleBadge: {
    display: 'inline-block', padding: '5px 14px', borderRadius: 99,
    fontSize: 12.5, fontWeight: 700, letterSpacing: '0.01em',
  },

  otpRow: {
    display: 'flex', gap: 10, justifyContent: 'center',
    marginBottom: 22,
  },
  otpBox: {
    width: 52, height: 62, textAlign: 'center',
    fontSize: 26, fontWeight: 800,
    borderRadius: 14, border: '2px solid #e7e5e4',
    outline: 'none', fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s ease',
    boxShadow: 'none',
  },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 12, padding: '12px 16px',
    fontSize: 13, color: '#dc2626', marginBottom: 16,
  },
  successBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 12, padding: '12px 16px',
    fontSize: 13, color: '#16a34a', marginBottom: 16,
  },

  btn: {
    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
    color: '#fff', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', transition: 'opacity 0.15s, transform 0.1s',
    marginBottom: 18, letterSpacing: '0.01em',
  },

  resendRow:  { textAlign: 'center', fontSize: 13, color: '#78716c', marginBottom: 12 },
  resendLink: { fontWeight: 700, cursor: 'pointer' },
  resendTimer:{ color: '#a8a29e' },
  backRow:    { textAlign: 'center', fontSize: 13, marginBottom: 20 },
  backLink:   { color: '#78716c', cursor: 'pointer' },

  tip: {
    fontSize: 11.5, color: '#c0bbb7', textAlign: 'center',
    background: '#fafaf9', borderRadius: 10, padding: '10px 14px',
    border: '1px solid #f0eeed', lineHeight: 1.6,
  },

  loadDot: {
    width: 8, height: 8, borderRadius: '50%',
    animation: 'dotBounce 1.2s ease infinite',
    marginBottom: 16,
  },
  successRing: {
    width: 90, height: 90, borderRadius: '50%',
    border: '3px solid', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    margin: '0 auto', fontSize: 40,
    animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};
