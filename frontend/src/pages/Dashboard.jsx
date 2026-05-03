import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useSpotify';
import { SectionRow, AlbumCard, ArtistCard, TrackMiniCard } from '../components/common/Cards';
import Loader from '../components/common/Loader';

export default function Dashboard() {
  const { profile } = useAuth();
  const { data, isLoading, error } = useDashboard();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) return <Loader />;
  if (error) return (
    <div style={styles.error}>
      <h2>Unable to load dashboard</h2>
      <p>Check your backend is running and Spotify API keys are set.</p>
    </div>
  );

  const topTracks = data?.topTracks || [];
  const topArtists = data?.topArtists || [];
  const newAlbums = data?.newReleases?.albums?.items || [];
  const hiphopTracks = data?.hiphopTracks || [];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={styles.hero}>
        <div style={styles.heroBg} />
        <h1 style={styles.heroTitle}>{greeting}{profile?.displayName ? `, ${profile.displayName}` : ''}!</h1>
        <p style={styles.heroSub}>Discover something new today</p>
      </div>

      {topTracks.length > 0 && (
        <SectionRow title="Popular Tracks">
          {topTracks.map((track, i) => (
            <TrackMiniCard key={track.id} track={track} queue={topTracks} index={i} />
          ))}
        </SectionRow>
      )}

      {topArtists.length > 0 && (
        <SectionRow title="Popular Artists">
          {topArtists.map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </SectionRow>
      )}

      {newAlbums.length > 0 && (
        <SectionRow title="Albums">
          {newAlbums.map(album => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </SectionRow>
      )}

      {hiphopTracks.length > 0 && (
        <SectionRow title="Hip Hop">
          {hiphopTracks.map((track, i) => (
            <TrackMiniCard key={track.id} track={track} queue={hiphopTracks} index={i} />
          ))}
        </SectionRow>
      )}
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative', padding: '32px 36px 36px',
    marginBottom: 32, borderRadius: 'var(--radius-xl)',
    overflow: 'hidden', background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 120% 120% at -10% 50%, rgba(124,58,237,0.4) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroTitle: { fontSize: '2.2rem', fontWeight: 800, position: 'relative', marginBottom: 8 },
  heroSub: { color: 'var(--text-muted)', fontSize: '1rem', position: 'relative' },
  error: { padding: 40, textAlign: 'center', color: 'var(--text-muted)' },
};