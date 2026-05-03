import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Music2, Check, Plus } from 'lucide-react';
import { playlistApi } from '../../services/api';
import { toast } from 'react-toastify';

export default function AddToPlaylistModal({ track, onClose }) {
  const queryClient = useQueryClient();

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistApi.getAll().then(r => r.data),
  });

  const addMutation = useMutation({
    mutationFn: ({ playlistId, track }) => playlistApi.addTrack(playlistId, track),
    onSuccess: (_, { playlistId }) => {
      queryClient.invalidateQueries(['playlist', playlistId]);
      queryClient.invalidateQueries(['playlists']);
      toast.success('Added to playlist!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Already in playlist or error'),
  });

  const createAndAdd = useMutation({
    mutationFn: async () => {
      const name = `${track.name}'s Playlist`;
      const res = await playlistApi.create({ name });
      await playlistApi.addTrack(res.data.id, track);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      toast.success('New playlist created with track!');
      onClose();
    },
  });

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Add to Playlist</h3>
            <p style={styles.trackName}>{track.name}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Create New */}
        <button
          style={styles.createNew}
          onClick={() => createAndAdd.mutate()}
          disabled={createAndAdd.isPending}
        >
          <div style={styles.createIcon}><Plus size={16} /></div>
          <span>Create new playlist</span>
        </button>

        <div style={styles.divider} />

        {/* Existing playlists */}
        <div style={styles.list}>
          {isLoading ? (
            <p style={styles.loading}>Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p style={styles.loading}>No playlists yet</p>
          ) : (
            playlists.map(pl => {
              const alreadyIn = pl.tracks?.some?.(t => t.id === track.id);
              return (
                <button
                  key={pl.id}
                  style={{ ...styles.playlistRow, opacity: alreadyIn ? 0.5 : 1 }}
                  onClick={() => !alreadyIn && addMutation.mutate({ playlistId: pl.id, track })}
                  disabled={alreadyIn || addMutation.isPending}
                >
                  <div style={styles.plThumb}>
                    {pl.coverImage
                      ? <img src={pl.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                      : <Music2 size={14} color="var(--text-muted)" />
                    }
                  </div>
                  <div style={styles.plInfo}>
                    <span style={styles.plName}>{pl.name}</span>
                    <span style={styles.plCount}>{pl.trackCount || 0} songs</span>
                  </div>
                  {alreadyIn && <Check size={16} color="var(--purple-bright)" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    width: 360,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: 20,
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    animation: 'fadeIn 0.2s ease',
  },
  header: {
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 12,
    marginBottom: 16,
  },
  title: { fontSize: '1rem', fontWeight: 700, marginBottom: 3 },
  trackName: { fontSize: '0.82rem', color: 'var(--text-muted)' },
  closeBtn: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'var(--bg-hover)', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
  },
  createNew: {
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', padding: '10px 8px',
    background: 'none', border: 'none',
    borderRadius: 8, cursor: 'pointer',
    color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  createIcon: {
    width: 38, height: 38, borderRadius: 6,
    background: 'var(--bg-hover)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px dashed var(--border-medium)',
    flexShrink: 0,
  },
  divider: {
    height: 1, background: 'var(--border-subtle)',
    margin: '10px 0',
  },
  list: { maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 },
  loading: { color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px 8px' },
  playlistRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px', borderRadius: 8,
    background: 'none', border: 'none',
    cursor: 'pointer', width: '100%', textAlign: 'left',
    transition: 'background 0.15s',
  },
  plThumb: {
    width: 38, height: 38, borderRadius: 6,
    background: 'var(--bg-hover)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
  },
  plInfo: { flex: 1, overflow: 'hidden' },
  plName: {
    display: 'block', fontSize: '0.88rem', fontWeight: 500,
    color: 'var(--text-primary)', whiteSpace: 'nowrap',
    overflow: 'hidden', textOverflow: 'ellipsis',
  },
  plCount: { display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' },
};
