import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, Disc3 } from 'lucide-react';
import { spotifyApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/common/TrackCard';
import Loader from '../components/common/Loader';

export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const { data: album, isLoading } = useQuery({
    queryKey: ['album', id],
    queryFn: () => spotifyApi.getAlbum(id).then(r => r.data)
  });

  if (isLoading) return <Loader />;
  if (!album) return null;

  const tracks = (album.tracks?.items || []).map(t => ({
    ...t,
    album: { id: album.id, name: album.name, images: album.images }
  }));

  const coverUrl = album.images?.[0]?.url;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerBg} />
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div style={styles.headerContent}>
          <div style={styles.cover}>
            {coverUrl
              ? <img src={coverUrl} alt={album.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Disc3 size={48} color="var(--text-muted)" />
            }
          </div>
          <div style={styles.info}>
            <div style={styles.albumLabel}>{album.album_type?.toUpperCase()}</div>
            <h1 style={styles.albumName}>{album.name}</h1>
            <div style={styles.meta}>
              {album.artists?.map((a, i) => (
                <React.Fragment key={a.id}>
                  {i > 0 && <span style={{ color: 'var(--text-muted)' }}>, </span>}
                  <Link to={`/artist/${a.id}`} style={styles.artistLink}>{a.name}</Link>
                </React.Fragment>
              ))}
              <span style={{ color: 'var(--text-muted)' }}>
                {' · '}{album.release_date?.slice(0, 4)}{' · '}{tracks.length} tracks
              </span>
            </div>
            <div style={styles.actions}>
              <button
                style={styles.playBtn}
                onClick={() => tracks[0] && playTrack(tracks[0], tracks, 0)}
              >
                <Play size={18} fill="currentColor" /> Play All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div>
        {tracks.map((track, i) => (
          <TrackCard key={track.id} track={track} queue={tracks} index={i} />
        ))}
      </div>

      {album.label && (
        <p style={styles.label}>© {album.release_date?.slice(0, 4)} {album.label}</p>
      )}
    </div>
  );
}

const styles = {
  header: {
    position: 'relative', padding: '28px', marginBottom: 28,
    borderRadius: 'var(--radius-xl)', overflow: 'hidden',
    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.15), transparent)',
    pointerEvents: 'none',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', border: 'none',
    color: 'var(--text-secondary)', cursor: 'pointer',
    marginBottom: 16, position: 'relative',
  },
  headerContent: { display: 'flex', gap: 24, alignItems: 'flex-end', position: 'relative' },
  cover: {
    width: 160, height: 160,
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    background: 'var(--bg-overlay)', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  info: { flex: 1 },
  albumLabel: { fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 },
  albumName: { fontSize: '2rem', fontWeight: 800, marginBottom: 10 },
  meta: { fontSize: '0.88rem', marginBottom: 18, display: 'flex', flexWrap: 'wrap', gap: 2 },
  artistLink: { color: 'var(--purple-light)', fontWeight: 600 },
  actions: { display: 'flex', gap: 10 },
  playBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 22px',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    border: 'none', borderRadius: 99,
    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', boxShadow: 'var(--glow-purple-sm)',
    fontFamily: 'Syne, sans-serif',
  },
  label: {
    color: 'var(--text-muted)', fontSize: '0.78rem',
    padding: '24px 8px', marginTop: 12,
    borderTop: '1px solid var(--border-subtle)',
  },
};
