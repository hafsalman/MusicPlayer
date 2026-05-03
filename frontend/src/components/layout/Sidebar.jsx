import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Home, Search, User, ListMusic, Plus, LogOut, Music2, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { playlistApi } from '../../services/api';
import { toast } from 'react-toastify';

const navItems = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistApi.getAll().then(r => r.data),
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (name) => playlistApi.create({ name }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['playlists']);
      setCreating(false);
      setNewName('');
      navigate(`/playlist/${res.data.id}`);
      toast.success('Playlist created!');
    },
    onError: () => toast.error('Failed to create playlist')
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate(newName.trim());
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Music2 size={20} color="#fff" />
        </div>
        <span style={styles.logoText}>Aurora Tunes</span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {})
            })}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Library */}
      <div style={styles.library}>
        <div style={styles.libraryHeader}>
          <div style={styles.libraryTitle}>
            <ListMusic size={16} />
            <span>Your Library</span>
          </div>
          <button
            style={styles.addBtn}
            onClick={() => setCreating(true)}
            title="New playlist"
          >
            <Plus size={16} />
          </button>
        </div>
{creating && (
  <form onSubmit={handleCreate} style={styles.createForm}>
    <input
      autoFocus
      value={newName}
      onChange={e => setNewName(e.target.value)}
      placeholder="Playlist name..."
      style={styles.createInput}
    />
    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
      <button type="submit" style={styles.createSubmitBtn}>
        Create
      </button>
      <button type="button" style={styles.createCancelBtn} onClick={() => { setCreating(false); setNewName(''); }}>
        Cancel
      </button>
    </div>
  </form>
)}

        <div style={styles.playlistList}>
          {playlists.length === 0 && !creating && (
            <p style={styles.emptyHint}>Create your first playlist</p>
          )}
          {playlists.map(pl => (
            <NavLink
              key={pl.id}
              to={`/playlist/${pl.id}`}
              style={({ isActive }) => ({
                ...styles.playlistItem,
                ...(isActive ? styles.playlistItemActive : {})
              })}
            >
              <div style={styles.playlistThumb}>
                {pl.coverImage
                  ? <img src={pl.coverImage} alt={pl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Music2 size={14} color="var(--text-muted)" />
                }
              </div>
              <div style={styles.playlistInfo}>
                <span style={styles.playlistName}>{pl.name}</span>
                <span style={styles.playlistMeta}>{pl.trackCount || 0} songs</span>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      {/* User footer */}
      <div style={styles.userFooter}>
        <Link to="/profile" style={styles.userInfo}>
          <div style={styles.avatar}>
<span style={styles.avatarLetter}>
  {(profile?.username || user?.email || 'U')[0].toUpperCase()}
</span>
          </div>
          <div>
            <div style={styles.userName}>{profile?.username || 'User'}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </Link>
        <button style={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-surface)',
    padding: '0',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '22px 20px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--accent-pink))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--glow-purple-sm)',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 800,
    fontSize: '1.05rem',
    background: 'linear-gradient(135deg, var(--purple-bright), var(--accent-pink))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  nav: {
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'var(--transition)',
  },
  navItemActive: {
    color: 'var(--purple-bright)',
    background: 'rgba(124, 58, 237, 0.12)',
  },
  library: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid var(--border-subtle)',
    padding: '14px 12px',
  },
  libraryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '0 4px',
  },
  libraryTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    transition: 'var(--transition)',
    cursor: 'pointer',
  },
  createForm: { marginBottom: 8 },
  createInput: {
    width: '100%',
    padding: '8px 12px',
    background: 'var(--bg-overlay)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
  },
  playlistList: {
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  emptyHint: {
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    textAlign: 'center',
    padding: '20px 0',
  },
  playlistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '7px 10px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    transition: 'var(--transition)',
  },
  playlistItemActive: {
    color: 'var(--text-primary)',
    background: 'var(--bg-hover)',
  },
  playlistThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    background: 'var(--bg-overlay)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  playlistInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflow: 'hidden',
  },
  playlistName: {
    fontSize: '0.85rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playlistMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  userFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    borderTop: '1px solid var(--border-subtle)',
    gap: 8,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
    flex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple-mid), var(--accent-pink))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarLetter: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fff',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'var(--bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-muted)',
    flexShrink: 0,
    transition: 'var(--transition)',
    cursor: 'pointer',
  },
  createSubmitBtn: {
  flex: 1, padding: '6px', background: 'var(--purple-vivid)',
  border: 'none', borderRadius: 'var(--radius-sm)',
  color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
},
createCancelBtn: {
  flex: 1, padding: '6px', background: 'var(--bg-hover)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer',
}
};
