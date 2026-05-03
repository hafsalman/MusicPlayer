import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, backTo, actions }) {
  const navigate = useNavigate();

  return (
    <div style={styles.header}>
      <div style={styles.left}>
        {(backTo !== undefined) && (
          <button
            style={styles.backBtn}
            onClick={() => backTo ? navigate(backTo) : navigate(-1)}
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
          <h1 style={styles.title}>{title}</h1>
        </div>
      </div>
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28, gap: 16,
  },
  left: { display: 'flex', alignItems: 'center', gap: 14 },
  backBtn: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-secondary)', cursor: 'pointer',
    flexShrink: 0,
  },
  subtitle: {
    fontSize: '0.75rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-muted)', marginBottom: 3,
  },
  title: { fontSize: '1.5rem', fontWeight: 800 },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
};
