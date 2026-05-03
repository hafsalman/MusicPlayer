import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Edit2, Music2, ListMusic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playlistApi } from '../services/api';
import Loader from '../components/common/Loader';

export default function Profile() {
  const { user, profile } = useAuth();

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistApi.getAll().then(r => r.data),
    enabled: !!user
  });

  if (!profile) return <Loader />;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerBg} />
        <div style={styles.headerContent}>
          {/* Avatar */}
          <div style={styles.avatar}>
 <span style={styles.avatarLetter}>
  {(profile.displayName || profile.username || 'U')[0].toUpperCase()}
</span>
          </div>
          <div style={styles.headerInfo}>
            <div style={styles.profileType}>Profile</div>
            <h1 style={styles.displayName}>{profile.displayName || profile.username || 'User'}</h1>
            {profile.username && profile.username !== profile.displayName && (
              <div style={styles.username}>@{profile.username}</div>
            )}
            {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
            <div style={styles.stats}>
              <div style={styles.stat}>
                <span style={styles.statNum}>{playlists.length}</span>
                <span style={styles.statLabel}>Playlists</span>
              </div>
            </div>
          </div>
        </div>
        <Link to="/profile/edit" style={styles.editBtn}>
          <Edit2 size={15} />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Playlists */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Your Playlists</h2>
        {isLoading ? <Loader /> : playlists.length === 0 ? (
          <div style={styles.empty}>
            <ListMusic size={48} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>No playlists yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Create one from the sidebar!</p>
          </div>
        ) : (
          <div style={styles.playlistGrid}>
            {playlists.map(pl => (
              <Link key={pl.id} to={`/playlist/${pl.id}`} style={styles.plCard}>
                <div style={styles.plArt}>
                  {pl.coverImage
                    ? <img src={pl.coverImage} alt={pl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Music2 size={28} color="var(--text-muted)" />
                  }
                </div>
                <div style={styles.plName}>{pl.name}</div>
                <div style={styles.plMeta}>{pl.trackCount || 0} songs</div>
                {pl.description && <div style={styles.plDesc}>{pl.description}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    position: 'relative',
    padding: '32px',
    marginBottom: 36,
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(236,72,153,0.15) 60%, transparent 100%)',
    pointerEvents: 'none',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 24,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--accent-pink))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: 'var(--glow-purple)',
    border: '3px solid rgba(255,255,255,0.1)',
  },
  avatarLetter: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#fff',
    fontFamily: 'Syne, sans-serif',
  },
  headerInfo: { flex: 1 },
  profileType: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 },
  displayName: { fontSize: '2.5rem', fontWeight: 800, marginBottom: 4 },
  username: { fontSize: '0.9rem', color: 'var(--purple-light)', marginBottom: 8 },
  bio: { fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12, maxWidth: 400 },
  stats: { display: 'flex', gap: 24 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { fontWeight: 700, fontSize: '1.1rem' },
  statLabel: { fontSize: '0.78rem', color: 'var(--text-muted)' },
  editBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 16px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-medium)',
    borderRadius: 99,
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    zIndex: 1,
    textDecoration: 'none',
  },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0',
  },
  playlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 18,
  },
  plCard: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 14,
    cursor: 'pointer',
    transition: 'var(--transition)',
    textDecoration: 'none',
    color: 'inherit',
  },
  plArt: {
    width: '100%',
    aspectRatio: '1',
    background: 'linear-gradient(135deg, var(--purple-deep), var(--bg-overlay))',
    borderRadius: 'var(--radius-md)',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  plName: { fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  plMeta: { fontSize: '0.78rem', color: 'var(--text-muted)' },
  plDesc: { fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};
