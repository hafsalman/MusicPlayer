import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Play, Users } from 'lucide-react';
import { spotifyApi } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/common/TrackCard';
import { AlbumCard, ArtistCard, SectionRow } from '../components/common/Cards';
import Loader from '../components/common/Loader';

function fmtFollowers(n) {
  if (!n) return '';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M followers`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K followers`;
  return `${n} followers`;
}

export default function ArtistPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const { data, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => spotifyApi.getArtist(id).then(r => r.data)
  });

  if (isLoading) return <Loader />;
  if (!data) return null;

  const { artist, topTracks, albums, related } = data;
  const tracks = topTracks?.tracks || [];
  const artistAlbums = albums?.items || [];
  const relatedArtists = related?.artists?.slice(0, 8) || [];
  const image = artist.images?.[0]?.url;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Hero */}
      <div style={{ ...styles.hero, '--artist-img': image ? `url(${image})` : 'none' }}>
        <div style={styles.heroBg} />
        {image && <img src={image} alt={artist.name} style={styles.heroImg} />}
        <div style={styles.heroContent}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div style={styles.artistMeta}>
            {artist.verified && <span style={styles.verified}>✓ Verified Artist</span>}
            <h1 style={styles.artistName}>{artist.name}</h1>
            <div style={styles.artistStats}>
              {fmtFollowers(artist.followers?.total) && (
                <span><Users size={14} style={{ marginRight: 4 }} />{fmtFollowers(artist.followers?.total)}</span>
              )}
              {artist.genres?.slice(0, 3).map(g => (
                <span key={g} style={styles.genreTag}>{g}</span>
              ))}
            </div>
          </div>
          <button
            style={styles.playBtn}
            onClick={() => tracks[0] && playTrack(tracks[0], tracks, 0)}
          >
            <Play size={20} fill="currentColor" /> Play
          </button>
        </div>
      </div>

      {/* Top Tracks */}
      {tracks.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={styles.sectionTitle}>Popular</h2>
          {tracks.map((track, i) => (
            <TrackCard key={track.id} track={track} queue={tracks} index={i} />
          ))}
        </section>
      )}

      {/* Albums */}
      {artistAlbums.length > 0 && (
        <SectionRow title="Discography">
          {artistAlbums.map(album => <AlbumCard key={album.id} album={album} />)}
        </SectionRow>
      )}

      {/* Related Artists */}
      {relatedArtists.length > 0 && (
        <SectionRow title="Fans Also Like">
          {relatedArtists.map(a => <ArtistCard key={a.id} artist={a} />)}
        </SectionRow>
      )}
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative',
    height: 320,
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    marginBottom: 36,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  heroImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(0.5)',
  },
  heroBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, transparent 30%, rgba(10,10,15,0.95) 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)', border: 'none',
    color: '#fff', cursor: 'pointer',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  artistMeta: { flex: 1 },
  verified: { fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600, display: 'block', marginBottom: 6 },
  artistName: { fontSize: '3rem', fontWeight: 900 },
  artistStats: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem' },
  genreTag: {
    padding: '3px 10px', borderRadius: 99,
    background: 'rgba(255,255,255,0.1)',
    fontSize: '0.78rem', textTransform: 'capitalize',
  },
  playBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 28px',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    border: 'none', borderRadius: 99,
    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
    cursor: 'pointer', boxShadow: 'var(--glow-purple)',
    alignSelf: 'flex-start',
    fontFamily: 'Syne, sans-serif',
  },
  sectionTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 },
};
