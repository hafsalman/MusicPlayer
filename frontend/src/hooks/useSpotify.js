import { useQuery } from '@tanstack/react-query';
import { spotifyApi } from '../services/api';

export function useSearch(query, type = 'track,artist,album', limit = 20) {
  const q = query || '';
  return useQuery({
    queryKey: ['search', q, type],
    queryFn: () => spotifyApi.search(q.trim(), type, limit).then(r => r.data),
    enabled: q.trim().length > 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useArtist(id) {
  return useQuery({
    queryKey: ['artist', id],
    queryFn: () => spotifyApi.getArtist(id).then(r => r.data),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAlbum(id) {
  return useQuery({
    queryKey: ['album', id],
    queryFn: () => spotifyApi.getAlbum(id).then(r => r.data),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => spotifyApi.getDashboard().then(r => r.data),
    staleTime: 15 * 60 * 1000,
  });
}

export function useRecommendations(params) {
  return useQuery({
    queryKey: ['recommendations', params],
    queryFn: () => spotifyApi.getRecommendations(params).then(r => r.data),
    enabled: !!params,
    staleTime: 10 * 60 * 1000,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => spotifyApi.getGenres().then(r => r.data),
    staleTime: 60 * 60 * 1000, // 1 hour - genres rarely change
  });
}
