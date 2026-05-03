import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play } from 'lucide-react';
import { spotifyApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/common/TrackCard';
import Loader from '../components/common/Loader';

export default function GenrePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  // Fetch recommendations by genre seed
  const { data, isLoading } = useQuery({
    queryKey: ['genre-recs', id],
    queryFn: () => spotifyApi.getRecommendations({ genre: id, limit: 30 }).then(r => r.data)
  });

  const tracks = data?.tracks || [];

  // Also fetch category playlists
  const { data: playlistData } = useQuery({
    queryKey: ['category-playlists', id],
    queryFn: () => spotifyApi.getCategoryPlaylists(id).then(r => r.data)
  });

  const playlists = playlistData?.playlists?.items || [];

  const genreName = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerBg} />
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.genreName}>{genreName}</h1>
          <p style={styles.sub}>Tracks you might love</p>
          {tracks.length > 0 && (
            <button style={styles.playBtn} onClick={() => playTrack(tracks[0], tracks, 0)}>
              <Play size={18} fill="currentColor" /> Play All
            </button>
          )}
        </div>
      </div>

      {isLoading ? <Loader /> : (
        <div>
          {tracks.length > 0 && (
            <section style={{ marginBottom: 36 }}>
              <h2 style={styles.sectionTitle}>Recommended Tracks</h2>
              {tracks.map((track, i) => (
                <TrackCard key={track.id} track={track} queue={tracks} index={i} />
              ))}
            </section>
          )}

          {playlists.length > 0 && (
            <section>
              <h2 style={styles.sectionTitle}>Featured Playlists</h2>
              <div style={styles.playlistGrid}>
                {playlists.map(pl => (
                  <div key={pl.id} style={styles.plCard}>
                    <div style={styles.plArt}>
                      {pl.images?.[0]?.url && (
                        <img src={pl.images[0].url} alt={pl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    <div style={styles.plName}>{pl.name}</div>
                    <div style={styles.plDesc}>{pl.description}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tracks.length === 0 && playlists.length === 0 && (
            <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
              No content found for this genre.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    position: 'relative', padding: '32px', marginBottom: 36,
    borderRadius: 'var(--radius-xl)', overflow: 'hidden',
    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
  },
  headerBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.5) 0%, rgba(236,72,153,0.25) 60%, transparent 100%)',
    pointerEvents: 'none',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 34, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', border: 'none',
    color: 'var(--text-secondary)', cursor: 'pointer',
    marginBottom: 16, position: 'relative',
  },
  headerContent: { position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' },
  genreName: { fontSize: '2.5rem', fontWeight: 900, textTransform: 'capitalize' },
  sub: { color: 'var(--text-muted)', fontSize: '0.9rem' },
  playBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '11px 24px',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    border: 'none', borderRadius: 99,
    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
    cursor: 'pointer', boxShadow: 'var(--glow-purple-sm)',
    fontFamily: 'Syne, sans-serif',
  },
  sectionTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 },
  playlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 16,
  },
  plCard: { cursor: 'default' },
  plArt: {
    width: '100%', aspectRatio: '1',
    borderRadius: 'var(--radius-md)', overflow: 'hidden',
    background: 'var(--bg-overlay)', marginBottom: 10,
  },
  plName: { fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 },
  plDesc: { fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};
