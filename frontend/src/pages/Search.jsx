import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, X } from 'lucide-react';
import { spotifyApi } from '../services/api';
import { ArtistCard, AlbumCard, SectionRow } from '../components/common/Cards';
import TrackCard from '../components/common/TrackCard';
import Loader from '../components/common/Loader';

const TABS = ['All', 'Tracks', 'Artists', 'Albums'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const timerRef = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQ(val), 400);
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQ, 'track,artist,album'],
    queryFn: () => spotifyApi.search(debouncedQ.trim(), 'track,artist,album', 20).then(r => r.data),
    enabled: typeof debouncedQ === 'string' && debouncedQ.trim().length > 1,
    staleTime: 5 * 60 * 1000,
  });

  const tracks = data?.tracks?.items || [];
  const artists = data?.artists?.items || [];
  const albums = data?.albums?.items || [];

  const showTracks = activeTab === 'All' || activeTab === 'Tracks';
  const showArtists = activeTab === 'All' || activeTab === 'Artists';
  const showAlbums = activeTab === 'All' || activeTab === 'Albums';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Search bar */}
      <div style={styles.searchBar}>
        <SearchIcon size={20} style={styles.searchIcon} />
        <input
          value={query}
          onChange={handleInput}
          placeholder="Search songs, artists, albums..."
          style={styles.searchInput}
          autoFocus
        />
        {query && (
          <button style={styles.clearBtn} onClick={() => { setQuery(''); setDebouncedQ(''); }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Tabs */}
      {debouncedQ && (
        <div style={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {isLoading && <Loader />}

      {!debouncedQ && (
        <div style={styles.hint}>
          <SearchIcon size={48} color="var(--text-muted)" />
          <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>
            Search for your favorite tracks, artists & albums
          </p>
        </div>
      )}

      {debouncedQ && !isLoading && data && (
        <div>
          {showTracks && tracks.length > 0 && (
            <SectionRow title="Tracks">
              <div style={{ width: '100%' }}>
                {tracks.map((track, i) => (
                  <TrackCard key={track.id} track={track} queue={tracks} index={i} />
                ))}
              </div>
            </SectionRow>
          )}

          {showArtists && artists.length > 0 && (
            <SectionRow title="Artists">
              {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
            </SectionRow>
          )}

          {showAlbums && albums.length > 0 && (
            <SectionRow title="Albums">
              {albums.map(a => <AlbumCard key={a.id} album={a} />)}
            </SectionRow>
          )}

          {tracks.length === 0 && artists.length === 0 && albums.length === 0 && (
            <div style={styles.hint}>
              <p style={{ color: 'var(--text-muted)' }}>No results for "{debouncedQ}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--radius-xl)',
    padding: '12px 18px',
    marginBottom: 24,
    boxShadow: 'var(--glow-purple-sm)',
  },
  searchIcon: { color: 'var(--text-muted)', flexShrink: 0 },
  searchInput: {
    flex: 1,
    fontSize: '1rem',
    color: 'var(--text-primary)',
    background: 'none',
    border: 'none',
    outline: 'none',
  },
  clearBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: '50%',
    background: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    padding: '7px 18px',
    borderRadius: 99,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  tabActive: {
    background: 'var(--purple-vivid)',
    borderColor: 'transparent',
    color: '#fff',
  },
  hint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0',
  },
};
