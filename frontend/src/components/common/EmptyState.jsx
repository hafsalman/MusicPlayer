import React from 'react';

export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={styles.container}>
      {Icon && <Icon size={52} color="var(--text-muted)" strokeWidth={1.5} />}
      <h3 style={styles.title}>{title}</h3>
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      {action && <div style={styles.action}>{action}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px 20px', gap: 12, textAlign: 'center',
  },
  title: {
    fontSize: '1.1rem', fontWeight: 700,
    color: 'var(--text-secondary)', marginTop: 4,
  },
  subtitle: {
    fontSize: '0.88rem', color: 'var(--text-muted)',
    maxWidth: 320, lineHeight: 1.5,
  },
  action: { marginTop: 8 },
};
