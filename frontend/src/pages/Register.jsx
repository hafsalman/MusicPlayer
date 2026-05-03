import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Music2, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.displayName || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form.email, form.password, form.displayName);
      toast.success('Account created! Welcome to Aurora Tunes 🎵');
      navigate('/');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'Email already in use'
        : 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      toast.error('Google sign-in failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}><Music2 size={22} color="#fff" /></div>
          <span style={styles.logoText}>Aurora Tunes</span>
        </div>

        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.sub}>Start your musical journey</p>

        <button style={styles.googleBtn} onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { key: 'displayName', label: 'Display Name', type: 'text', icon: User, placeholder: 'Your name' },
            { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'your@email.com' },
            { key: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••' },
            { key: 'confirm', label: 'Confirm Password', type: 'password', icon: Lock, placeholder: '••••••••' },
          ].map(({ key, label, type, icon: Icon, placeholder }) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <div style={styles.inputWrapper}>
                <Icon size={16} style={styles.inputIcon} />
                <input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  style={styles.input}
                />
              </div>
            </div>
          ))}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-base)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(124,58,237,0.35) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: 420,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: '36px 40px',
    position: 'relative', zIndex: 1,
    animation: 'fadeIn 0.4s ease',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' },
  logoIcon: {
    width: 40, height: 40, borderRadius: 12,
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--accent-pink))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: 'var(--glow-purple-sm)',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem',
    background: 'linear-gradient(135deg, var(--purple-bright), var(--accent-pink))',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  heading: { fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: 6 },
  sub: { color: 'var(--text-muted)', textAlign: 'center', marginBottom: 28, fontSize: '0.9rem' },
  googleBtn: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
    fontWeight: 500, fontSize: '0.9rem', cursor: 'pointer', marginBottom: 20,
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
    color: 'var(--text-muted)', fontSize: '0.82rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, color: 'var(--text-muted)', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '11px 14px 11px 42px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.88rem',
  },
  submitBtn: {
    padding: '13px',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    border: 'none', borderRadius: 'var(--radius-md)',
    color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
    marginTop: 4, boxShadow: 'var(--glow-purple-sm)',
    fontFamily: 'Syne, sans-serif',
  },
  switchText: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 20 },
  switchLink: { color: 'var(--purple-bright)', fontWeight: 600 },
};
