import React, { useState } from 'react';
import { Play, Plus, MoreHorizontal, ListPlus, X } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistApi } from '../../services/api';
import { toast } from 'react-toastify';

function formatDuration(ms) {
  if (!ms) return '--:--';
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
}

export default function TrackCard({ track, queue = [], index = 0, showAlbum = true, playlistId = null, onRemove, playlists: playlistsProp }) {
  const { playTrack, currentTrack } = usePlayer();
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();
  const isCurrentTrack = currentTrack?.id === track.id;

  // Only fetch playlists if not provided by parent — avoids N queries for N track cards
  const { data: playlistsData = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistApi.getAll().then(r => r.data),
    enabled: !playlistsProp,
  });
  const playlists = playlistsProp ?? playlistsData;

  const addToPlaylistMutation = useMutation({
    mutationFn: ({ pid, track }) => playlistApi.addTrack(pid, track),
    onSuccess: (_, { pid }) => {
      queryClient.invalidateQueries(['playlist', pid]);
      queryClient.invalidateQueries(['playlists']);
      toast.success('Added to playlist!');
      setShowMenu(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add track')
  });

  const removeFromPlaylistMutation = useMutation({
    mutationFn: () => playlistApi.removeTrack(playlistId, track.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', playlistId]);
      queryClient.invalidateQueries(['playlists']);
      toast.success('Removed from playlist');
      setShowMenu(false);
      if (onRemove) onRemove();
    }
  });

  const img = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;

  return (
    <>
      {/* Backdrop to close menu */}
      {showMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 98 }}
          onClick={() => setShowMenu(false)}
        />
      )}

      <div style={{
        ...styles.row,
        background: isCurrentTrack ? 'rgba(124,58,237,0.08)' : 'transparent'
      }}>
        {/* Index / Play */}
        <div style={styles.indexCell}>
          <span style={{ color: isCurrentTrack ? 'var(--purple-bright)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
            {index + 1}
          </span>
        </div>

        {/* Art + Name - clicking plays the track */}
        <div
          style={{ ...styles.titleCell, cursor: 'pointer' }}
          onClick={() => playTrack(track, queue.length ? queue : [track], index)}
        >
          <div style={styles.art}>
            {img
              ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
              : <div style={styles.artPlaceholder} />}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ ...styles.trackName, color: isCurrentTrack ? 'var(--purple-bright)' : 'var(--text-primary)' }}>
              {track.name}
            </div>
            <div style={styles.artistName}>
              {track.artists?.map(a => a.name).join(', ')}
            </div>
          </div>
        </div>

        {/* Album */}
        {showAlbum && (
          <div style={styles.albumName}>{track.album?.name}</div>
        )}

        {/* Duration + Menu */}
        <div style={styles.actions}>
          <span style={styles.duration}>{formatDuration(track.duration_ms)}</span>
          <div style={{ position: 'relative', zIndex: 99 }}>
            <button
              style={styles.menuBtn}
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div style={styles.menu}>
                <div style={styles.menuHeader}>Add to playlist</div>
                {playlists.length === 0 ? (
                  <div style={styles.menuNote}>No playlists yet — create one in the sidebar</div>
                ) : (
                  playlists.map(pl => (
                    <button
                      key={pl.id}
                      style={styles.menuItem}
                      onClick={() => addToPlaylistMutation.mutate({ pid: pl.id, track })}
                    >
                      <ListPlus size={13} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pl.name}
                      </span>
                    </button>
                  ))
                )}
                {playlistId && (
                  <>
                    <div style={styles.menuDivider} />
                    <button
                      style={{ ...styles.menuItem, color: '#f87171' }}
                      onClick={() => removeFromPlaylistMutation.mutate()}
                    >
                      <X size={13} />
                      <span>Remove from playlist</span>
                    </button>
                  </>
                )}
                {!track.preview_url && (
                  <div style={styles.menuNote}>⚠ No 30s preview for this track</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  row: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr auto auto',
    alignItems: 'center',
    gap: 12,
    padding: '6px 8px',
    borderRadius: 8,
    transition: 'background 0.15s',
  },
  indexCell: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  titleCell: {
    display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden',
  },
  art: {
    width: 38, height: 38, borderRadius: 4,
    overflow: 'hidden', flexShrink: 0,
    background: 'var(--bg-overlay)',
  },
  artPlaceholder: {
    width: '100%', height: '100%',
    background: 'linear-gradient(135deg, var(--purple-deep), var(--bg-overlay))',
  },
  trackName: {
    fontSize: '0.88rem', fontWeight: 500,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  artistName: {
    fontSize: '0.78rem', color: 'var(--text-muted)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  albumName: {
    fontSize: '0.82rem', color: 'var(--text-muted)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    maxWidth: 160,
  },
  actions: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  duration: {
    fontSize: '0.82rem', color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums', minWidth: 36, textAlign: 'right',
  },
  menuBtn: {
    width: 30, height: 30, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-muted)', cursor: 'pointer',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
  },
  menu: {
    position: 'absolute',
    right: 0,
    bottom: '100%',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 10,
    padding: 6,
    minWidth: 200,
    maxWidth: 240,
    zIndex: 100,
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    marginBottom: 4,
  },
  menuHeader: {
    padding: '6px 10px 8px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border-subtle)',
    marginBottom: 4,
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '8px 10px',
    borderRadius: 6, fontSize: '0.83rem',
    color: 'var(--text-secondary)', cursor: 'pointer',
    textAlign: 'left', background: 'none', border: 'none',
    overflow: 'hidden',
  },
  menuDivider: {
    height: 1, background: 'var(--border-subtle)', margin: '4px 0',
  },
  menuNote: {
    padding: '6px 10px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
};