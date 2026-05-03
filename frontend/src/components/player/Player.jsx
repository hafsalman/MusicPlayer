import React, { useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Heart, ExternalLink, AlertCircle
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Player() {
  const {
    currentTrack, isPlaying, volume, progress, duration,
    isShuffle, repeatMode,
    togglePlay, handleNext, handlePrev, seek, changeVolume,
    setIsShuffle, cycleRepeat
  } = usePlayer();

  const [muted, setMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(0.8);

  const toggleMute = () => {
    if (muted) {
      changeVolume(prevVol);
      setMuted(false);
    } else {
      setPrevVol(volume);
      changeVolume(0);
      setMuted(true);
    }
  };

  const progressPct = duration ? (progress / duration) * 100 : 0;

  return (
    <div style={styles.player}>
      {/* Track Info */}
      <div style={styles.trackInfo}>
        {currentTrack ? (
          <>
            <div style={styles.albumArt}>
              {currentTrack.album?.images?.[0]?.url
                ? <img src={currentTrack.album.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={styles.albumArtPlaceholder} />
              }
            </div>
            <div style={styles.trackMeta}>
              <div style={styles.trackName}>{currentTrack.name}</div>
              <div style={styles.trackArtist}>
                {currentTrack.artists?.map(a => a.name).join(', ')}
              </div>
              {currentTrack.noPreview && (
                <div style={styles.noPreview}>
                  <AlertCircle size={11} />
                  <span>No preview available</span>
                </div>
              )}
            </div>
            {currentTrack.external_urls?.spotify && (
              <a
                href={currentTrack.external_urls.spotify}
                target="_blank"
                rel="noreferrer"
                style={styles.spotifyLink}
                title="Open in Spotify"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </>
        ) : (
          <div style={styles.noTrack}>
            <span>Nothing playing yet</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.controlBtns}>
          <button
            style={{ ...styles.iconBtn, color: isShuffle ? 'var(--purple-bright)' : 'var(--text-muted)' }}
            onClick={() => setIsShuffle(!isShuffle)}
          >
            <Shuffle size={16} />
          </button>
          <button style={styles.iconBtn} onClick={handlePrev}>
            <SkipBack size={20} />
          </button>
          <button style={styles.playBtn} onClick={togglePlay} disabled={!currentTrack || currentTrack.noPreview}>
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button style={styles.iconBtn} onClick={handleNext}>
            <SkipForward size={20} />
          </button>
          <button
            style={{ ...styles.iconBtn, color: repeatMode !== 'none' ? 'var(--purple-bright)' : 'var(--text-muted)' }}
            onClick={cycleRepeat}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressRow}>
          <span style={styles.time}>{formatTime(progress)}</span>
          <div
            style={styles.progressTrack}
            onClick={(e) => {
              if (!currentTrack || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <div style={{ ...styles.progressFill, width: `${progressPct}%` }}>
              <div style={styles.progressThumb} />
            </div>
          </div>
          <span style={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div style={styles.volumeSection}>
        <button style={styles.iconBtn} onClick={toggleMute}>
          {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div style={styles.volumeTrack}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            changeVolume(pct);
            setMuted(false);
          }}
        >
          <div style={{ ...styles.volumeFill, width: `${(muted ? 0 : volume) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  player: {
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    alignItems: 'center',
    padding: '0 24px',
    background: 'var(--bg-surface)',
    gap: 16,
  },
  trackInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    minWidth: 0,
  },
  albumArt: {
    width: 52,
    height: 52,
    borderRadius: 8,
    background: 'var(--bg-overlay)',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: 'var(--glow-purple-sm)',
  },
  albumArtPlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, var(--purple-deep), var(--bg-overlay))',
  },
  trackMeta: {
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  trackName: {
    fontSize: '0.88rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--text-primary)',
  },
  trackArtist: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  noPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.72rem',
    color: 'var(--accent-pink)',
    marginTop: 2,
  },
  spotifyLink: {
    color: 'var(--text-muted)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  },
  noTrack: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  controlBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%',
    color: 'var(--text-secondary)',
    transition: 'var(--transition)',
    cursor: 'pointer',
  },
  playBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--purple-vivid), var(--purple-bright))',
    color: '#fff',
    boxShadow: 'var(--glow-purple-sm)',
    transition: 'var(--transition)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  time: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    minWidth: 32,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 99,
    background: 'var(--bg-hover)',
    cursor: 'pointer',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    background: 'linear-gradient(90deg, var(--purple-vivid), var(--purple-bright))',
    position: 'relative',
    transition: 'width 0.1s linear',
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    right: -6,
    top: '50%',
    transform: 'translateY(-50%)',
    boxShadow: '0 0 6px rgba(0,0,0,0.4)',
  },
  volumeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-end',
  },
  volumeTrack: {
    width: 90,
    height: 4,
    borderRadius: 99,
    background: 'var(--bg-hover)',
    cursor: 'pointer',
    position: 'relative',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 99,
    background: 'var(--purple-mid)',
    transition: 'width 0.05s',
  },
};
