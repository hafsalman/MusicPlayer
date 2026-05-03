const axios = require('axios');

let tokenCache = {
  token: null,
  expiresAt: 0
};

const getAccessToken = async () => {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured.');
  }

  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(
            `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')
        }
      }
    );

    tokenCache.token = response.data.access_token;
    tokenCache.expiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
    return tokenCache.token;

  } catch (error) {
    console.error('Spotify token error:', error.response?.status, JSON.stringify(error.response?.data));
    throw new Error('Failed to authorize with Spotify API');
  }
};

const spotifyGet = async (endpoint, params = {}, retry = true) => {
  const token = await getAccessToken();
  try {
    const response = await axios.get(`https://api.spotify.com/v1${endpoint}`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && retry) {
      tokenCache.token = null;
      tokenCache.expiresAt = 0;
      return spotifyGet(endpoint, params, false);
    }
    console.error('spotifyGet error:', endpoint, error.response?.status, JSON.stringify(error.response?.data));
    throw error;
  }
};

// Search — builds URL manually so commas in 'type' are never percent-encoded
// Axios v1.x encodes commas as %2C in params; Spotify rejects that with 400 "Invalid limit"
const search = async (query, types = 'track,artist,album', limit = 20) => {
  const safeLimit = Math.min(Math.max(1, parseInt(limit) || 20), 50);
  const token = await getAccessToken();
  // Construct the query string manually — type commas stay as literal ','
  const qs = `q=${encodeURIComponent(query)}&type=${types}&limit=${safeLimit}`;

  const makeRequest = async (tok) =>
    axios.get(`https://api.spotify.com/v1/search?${qs}`, {
      headers: { Authorization: `Bearer ${tok}` }
    });

  try {
    const response = await makeRequest(token);
    return response.data;
  } catch (error) {
    // Retry once on 401 with a fresh token
    if (error.response?.status === 401) {
      tokenCache.token = null;
      tokenCache.expiresAt = 0;
      const freshToken = await getAccessToken();
      const response = await makeRequest(freshToken);
      return response.data;
    }
    console.error('search error:', error.response?.status, JSON.stringify(error.response?.data));
    throw error;
  }
};

const getTrack = async (trackId) => {
  return spotifyGet(`/tracks/${trackId}`, { market: 'PK' });
};

const getTracks = async (trackIds) => {
  return spotifyGet('/tracks', { ids: trackIds.join(','), market: 'PK' });
};

const getArtist = async (artistId) => {
  return spotifyGet(`/artists/${artistId}`);
};

const getArtistTopTracks = async (artistId) => {
  return spotifyGet(`/artists/${artistId}/top-tracks`, { market: 'PK' });
};

const getArtistAlbums = async (artistId) => {
  return spotifyGet(`/artists/${artistId}/albums`, {
    market: 'PK',
    limit: 10,
    include_groups: 'album,single'
  });
};

const getRelatedArtists = async (artistId) => {
  return spotifyGet(`/artists/${artistId}/related-artists`);
};

const getAlbum = async (albumId) => {
  return spotifyGet(`/albums/${albumId}`, { market: 'PK' });
};

// Replaced with search-based approach since browse endpoints are restricted
const getNewReleases = async () => {
  const year = new Date().getFullYear();
  return search(`new releases ${year}`, 'album', 10);
};

const getRecommendationsByGenre = async (genre, limit = 20) => {
  return search(genre, 'track', limit);
};

const getSeveralArtists = async (artistIds) => {
  return spotifyGet('/artists', { ids: artistIds.slice(0, 50).join(',') });
};

module.exports = {
  search,
  getTrack,
  getTracks,
  getArtist,
  getArtistTopTracks,
  getArtistAlbums,
  getRelatedArtists,
  getAlbum,
  getNewReleases,
  getRecommendationsByGenre,
  getSeveralArtists
};