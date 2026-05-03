import React from 'react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../../context/PlayerContext';
import { Play } from 'lucide-react';

export function ArtistCard({ artist }) {
  return (
    <Link to={`/artist/${artist.id}`} style={styles.card}>
      <div style={{ ...styles.art, borderRadius: '50%', overflow: 'hidden' }}>
        {artist.images?.[0]?.url
          ? <img src={artist.images[0].url} alt={artist.name} style={styles.img} />
          : <div style={styles.artPlaceholder} />}
      </div>
      <div style={styles.cardName}>{artist.name}</div>
      <div style={styles.cardSub}>Artist</div>
    </Link>
  );
}

export function AlbumCard({ album }) {
  return (
    <Link to={`/album/${album.id}`} style={styles.card}>
      <div style={styles.art}>
        {album.images?.[0]?.url
          ? <img src={album.images[0].url} alt={album.name} style={styles.img} />
          : <div style={styles.artPlaceholder} />}
      </div>
      <div style={styles.cardName}>{album.name}</div>
      <div style={styles.cardSub}>{album.artists?.[0]?.name} • {album.release_date?.slice(0, 4)}</div>
    </Link>
  );
}

export function TrackMiniCard({ track, queue = [], index = 0 }) {
  const { playTrack, currentTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const img = track.album?.images?.[0]?.url;

  return (
    <div
      className="track-mini-card"
      onClick={() => playTrack(track, queue.length ? queue : [track], index)}
    >
      <div style={{ ...styles.art, position: 'relative' }}>
        {img
          ? <img src={img} alt={track.name} style={styles.img} />
          : <div style={styles.artPlaceholder} />}
        <div className="play-overlay">
          <div style={styles.playCircle}><Play size={18} fill="#fff" /></div>
        </div>
        {isActive && <div style={styles.activeDot} />}
      </div>
      <div style={{ ...styles.cardName, color: isActive ? 'var(--purple-bright)' : 'var(--text-primary)' }}>
        {track.name}
      </div>
      <div style={styles.cardSub}>{track.artists?.map(a => a.name).join(', ')}</div>
    </div>
  );
}

export function GenreCard({ category }) {
  const colors = [
    '#7c3aed', '#db2777', '#0891b2', '#059669', '#d97706', '#dc2626',
    '#4f46e5', '#0284c7', '#7c3aed', '#be185d'
  ];
  const color = colors[Math.abs(category.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];

  return (
    <Link
      to={`/genre/${category.id}`}
      style={{ ...styles.genreCard, background: `linear-gradient(135deg, ${color}cc, ${color}55)` }}
    >
      {category.icons?.[0]?.url && (
        <img src={category.icons[0].url} alt="" style={styles.genreImg} />
      )}
      <div style={styles.genreName}>{category.name}</div>
    </Link>
  );
}

export function SectionRow({ title, children, seeAllLink }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        {seeAllLink && (
          <a href={seeAllLink} style={styles.seeAll}>See all</a>
        )}
      </div>
      <div style={styles.scrollRow}>{children}</div>
    </section>
  );
}

const styles = {
  section: { marginBottom: 36 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
  },
  seeAll: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
    letterSpacing: '0.03em',
  },
  scrollRow: {
    display: 'flex',
    gap: 16,
    overflowX: 'auto',
    paddingBottom: 8,
    scrollbarWidth: 'none',
  },
  card: {
    flexShrink: 0,
    width: 148,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  art: {
    width: 148,
    height: 148,
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    background: 'var(--bg-overlay)',
    marginBottom: 10,
    position: 'relative',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  artPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, var(--purple-deep), var(--bg-overlay))',
  },
  cardName: {
    fontSize: '0.88rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--text-primary)',
    marginBottom: 3,
  },
  cardSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--glow-purple)',
  },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--purple-bright)',
    animation: 'pulse-glow 2s infinite',
  },
  genreCard: {
    flexShrink: 0,
    width: 148,
    height: 90,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '12px 14px',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  genreImg: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 64,
    height: 64,
    objectFit: 'cover',
    opacity: 0.5,
    transform: 'rotate(15deg)',
  },
  genreName: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 800,
    fontSize: '0.95rem',
    color: '#fff',
    position: 'relative',
    zIndex: 1,
  },
};
