import React from 'react';

export default function Loader({ fullscreen = false, size = 36 }) {
  const spinner = (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid var(--bg-hover)`,
      borderTopColor: 'var(--purple-bright)',
      animation: 'spin 0.7s linear infinite'
    }} />
  );

  if (fullscreen) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', gap: 16
      }}>
        {spinner}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aurora Tunes</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      {spinner}
    </div>
  );
}
