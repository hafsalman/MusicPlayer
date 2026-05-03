import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Camera, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { toast } from 'react-toastify';

export default function EditProfile() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: profile?.username || '',
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const updateMutation = useMutation({
    mutationFn: async () => {
      await userApi.updateProfile(form);
    
    },
    onSuccess: async () => {
      await refreshProfile();
      toast.success('Profile updated!');
      navigate('/profile');
    },
    onError: () => toast.error('Failed to update profile')
  });


  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 560 }}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <button style={styles.backBtn} onClick={() => navigate('/profile')}>
          <ArrowLeft size={18} />
        </button>
        <h1 style={styles.pageTitle}>Edit Profile</h1>
      </div>

      <div style={styles.card}>
        {/* Photo */}
<div style={styles.photoSection}>
  <div style={styles.avatar}>
    <span style={styles.avatarLetter}>
      {(form.displayName || form.username || 'U')[0]?.toUpperCase()}
    </span>
  </div>
  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
    No Profile Photo Added
  </p>
</div>

        {/* Form */}
        <div style={styles.form}>
          {[
            { key: 'displayName', label: 'Display Name', placeholder: 'Your name', type: 'text' },
            { key: 'username', label: 'Username', placeholder: '@username', type: 'text' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                style={styles.input}
              />
            </div>
          ))}

          <div style={styles.field}>
            <label style={styles.label}>Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell people about yourself..."
              style={styles.textarea}
              rows={3}
              maxLength={200}
            />
            <span style={styles.charCount}>{form.bio.length}/200</span>
          </div>

          <button
            style={styles.saveBtn}
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            <Save size={16} />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  pageTitle: { fontSize: '1.4rem', fontWeight: 800 },
  card: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: 32,
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    paddingBottom: 28,
    borderBottom: '1px solid var(--border-subtle)',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--accent-pink))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    border: '3px solid rgba(255,255,255,0.1)',
    boxShadow: 'var(--glow-purple-sm)',
  },
  avatarLetter: { fontSize: '2rem', fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif' },


  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7, position: 'relative' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' },
  input: {
    padding: '12px 14px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '12px 14px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    resize: 'none',
    lineHeight: 1.5,
  },
  charCount: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textAlign: 'right',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '13px',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontFamily: 'Syne, sans-serif',
    boxShadow: 'var(--glow-purple-sm)',
    marginTop: 6,
  },
};
