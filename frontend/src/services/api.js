import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000
});

// Attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Spotify endpoints
export const spotifyApi = {
  search: (q, type = 'track,artist,album', limit = 20) =>
    api.get('/spotify/search', { params: { q, type, limit } }),

  getTrack: (id) => api.get(`/spotify/tracks/${id}`),

  getTracks: (ids) => api.get('/spotify/tracks', { params: { ids: ids.join(',') } }),

  getArtist: (id) => api.get(`/spotify/artists/${id}`),

  getAlbum: (id) => api.get(`/spotify/albums/${id}`),

  getDashboard: () => api.get('/spotify/dashboard'),

  getGenres: () => api.get('/spotify/genres'),

  getRecommendations: (params) => api.get('/spotify/recommendations', { params }),

  getCategoryPlaylists: (id) => api.get(`/spotify/categories/${id}/playlists`)
};

// User endpoints
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
};

// Playlist endpoints
export const playlistApi = {
  getAll: () => api.get('/playlist'),
  getOne: (id) => api.get(`/playlist/${id}`),
  create: (data) => api.post('/playlist', data),
  update: (id, data) => api.put(`/playlist/${id}`, data),
  delete: (id) => api.delete(`/playlist/${id}`),
  addTrack: (id, track) => api.post(`/playlist/${id}/tracks`, { track }),
  removeTrack: (playlistId, trackId) => api.delete(`/playlist/${playlistId}/tracks/${trackId}`),
  reorderTracks: (id, tracks) => api.put(`/playlist/${id}/tracks/reorder`, { tracks })
};

export default api;
