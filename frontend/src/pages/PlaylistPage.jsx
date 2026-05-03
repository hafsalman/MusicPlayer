import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, Shuffle, Pencil, Trash2, Plus, Music2, ArrowLeft, Search } from 'lucide-react';
import { playlistApi, spotifyApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/common/TrackCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playTrack, setIsShuffle } = usePlayer();

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [addMode, setAddMode] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = React.useRef();

  // Clear debounce timer on unmount to avoid state updates on unmounted component
  useEffect(() => {
    return () => clearTimeout(searchTimer.current);
  }, []);

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistApi.getOne(id).then(r => r.data)
  });

  const updateMutation = useMutation({
    mutationFn: (data) => playlistApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', id]);
      queryClient.invalidateQueries(['playlists']);
      setEditing(false);
      toast.success('Playlist updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => playlistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      navigate('/profile');
      toast.success('Playlist deleted');
    }
  });

  const handleSearch = (q) => {
    setSearchQ(q);
    clearTimeout(searchTimer.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await spotifyApi.search(q, 'track', 10);
        setSearchResults(res.data.tracks?.items || []);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const addTrackMutation = useMutation({
    mutationFn: (track) => playlistApi.addTrack(id, track),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', id]);
      queryClient.invalidateQueries(['playlists']);
      toast.success('Track added!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add track')
  });

  if (isLoading) return <Loader />;
  if (!playlist) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Playlist not found</div>;

  const tracks = playlist.tracks || [];
  const coverUrl = playlist.coverImage || tracks[0]?.album?.images?.[0]?.url;

  const playAll = (shuffle = false) => {
    if (!tracks.length) return;
    setIsShuffle(shuffle);
    const idx = shuffle ? Math.floor(Math.random() * tracks.length) : 0;
    playTrack(tracks[idx], tracks, idx);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerBg} />

        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>

        {/* Cover + Info */}
        <div style={styles.headerContent}>
          <div style={styles.cover}>
            {coverUrl
              ? <img src={coverUrl} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Music2 size={48} color="var(--text-muted)" />
            }
          </div>

          {editing ? (
            <div style={styles.editForm}>
              <input
                value={editForm.name ?? playlist.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                style={styles.editInput}
                placeholder="Playlist name"
              />
              <textarea
                value={editForm.description ?? playlist.description}
                onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                style={{ ...styles.editInput, resize: 'none', fontSize: '0.85rem' }}
                placeholder="Description (optional)"
                rows={2}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={styles.saveEditBtn} onClick={() => updateMutation.mutate(editForm)}>Save</button>
                <button style={styles.cancelEditBtn} onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={styles.info}>
              <div style={styles.playlistLabel}>Playlist</div>
              <h1 style={styles.playlistName}>{playlist.name}</h1>
              {playlist.description && <p style={styles.description}>{playlist.description}</p>}
              <div style={styles.meta}>{tracks.length} songs</div>

              <div style={styles.actions}>
                <button style={styles.playBtn} onClick={() => playAll(false)}>
                  <Play size={20} fill="currentColor" /> Play
                </button>
                <button style={styles.shuffleBtn} onClick={() => playAll(true)}>
                  <Shuffle size={16} /> Shuffle
                </button>
                <button style={styles.iconActionBtn} onClick={() => { setEditing(true); setEditForm({}); }}>
                  <Pencil size={16} />
                </button>
                <button
                  style={{ ...styles.iconActionBtn, color: 'var(--accent-pink)' }}
                  onClick={() => {
                    if (window.confirm('Delete this playlist?')) deleteMutation.mutate();
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Track list */}
      <div style={styles.trackSection}>
        {/* Column headers */}
        {tracks.length > 0 && (
          <div style={styles.tableHeader}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', paddingLeft: 44 }}>#</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TITLE</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ALBUM</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'right', paddingRight: 8 }}>DURATION</span>
          </div>
        )}

        {tracks.length === 0 && !addMode && (
          <div style={styles.empty}>
            <Music2 size={48} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>No tracks yet</p>
          </div>
        )}

        {tracks.map((track, i) => (
          <TrackCard
            key={`${track.id}-${i}`}
            track={track}
            queue={tracks}
            index={i}
            playlistId={id}
          />
        ))}
      </div>

      {/* Add songs */}
      <div style={styles.addSection}>
        <button style={styles.addSongsBtn} onClick={() => setAddMode(!addMode)}>
          <Plus size={16} />
          Add songs
        </button>

        {addMode && (
          <div style={styles.addPanel}>
            <div style={styles.addSearchBar}>
              <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                value={searchQ}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search for songs to add..."
                style={styles.addSearchInput}
                autoFocus
              />
            </div>

            {searching && <Loader size={24} />}

            {searchResults.map((track, i) => (
              <div key={track.id} style={styles.searchResultRow}>
                <TrackCard track={track} queue={searchResults} index={i} showAlbum={false} />
                <button
                  style={styles.addTrackBtn}
                  onClick={() => addTrackMutation.mutate(track)}
                  disabled={tracks.some(t => t.id === track.id)}
                >
                  {tracks.some(t => t.id === track.id) ? '✓' : <Plus size={14} />}
                </button>
              </div>
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
    padding: '28px 28px 32px',
    marginBottom: 28,
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(236,72,153,0.2) 60%, transparent 100%)',
    pointerEvents: 'none',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', border: 'none',
    color: 'var(--text-secondary)', cursor: 'pointer',
    marginBottom: 16, position: 'relative',
  },
  headerContent: { display: 'flex', gap: 24, alignItems: 'flex-end', position: 'relative' },
  cover: {
    width: 160,
    height: 160,
    borderRadius: 'var(--radius-lg)',
    background: 'linear-gradient(135deg, var(--purple-deep), var(--bg-overlay))',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  info: { flex: 1 },
  playlistLabel: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 },
  playlistName: { fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 },
  description: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 },
  meta: { color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 },
  actions: { display: 'flex', alignItems: 'center', gap: 10 },
  playBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 24px',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    border: 'none', borderRadius: 99,
    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', boxShadow: 'var(--glow-purple-sm)',
    fontFamily: 'Syne, sans-serif',
  },
  shuffleBtn: {
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '11px 20px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)',
    borderRadius: 99, color: 'var(--text-primary)',
    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
  },
  iconActionBtn: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  editForm: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  editInput: {
    padding: '10px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-md)',
    color: '#fff', fontSize: '1rem',
  },
  saveEditBtn: {
    padding: '9px 20px', background: 'var(--purple-vivid)', border: 'none',
    borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: 'pointer',
  },
  cancelEditBtn: {
    padding: '9px 20px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  trackSection: { marginBottom: 12 },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto auto',
    gap: 12, padding: '8px 8px',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: 8,
  },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' },
  addSection: { marginTop: 24 },
  addSongsBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 20px',
    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
    borderRadius: 99, color: 'var(--text-secondary)',
    fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
    transition: 'var(--transition)',
  },
  addPanel: {
    marginTop: 16,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
  },
  addSearchBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14,
  },
  addSearchInput: {
    flex: 1, color: 'var(--text-primary)', background: 'none', border: 'none', outline: 'none', fontSize: '0.9rem',
  },
  searchResultRow: { display: 'flex', alignItems: 'center', gap: 6 },
  addTrackBtn: {
    flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
    background: 'var(--purple-vivid)', border: 'none',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
  },
};
