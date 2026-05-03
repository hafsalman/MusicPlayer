import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistApi } from '../services/api';
import { toast } from 'react-toastify';

export function usePlaylists() {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: () => playlistApi.getAll().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePlaylist(id) {
  return useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistApi.getOne(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => playlistApi.create(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      toast.success('Playlist created!');
    },
    onError: () => toast.error('Failed to create playlist'),
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => playlistApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlists']);
      toast.success('Playlist deleted');
    },
    onError: () => toast.error('Failed to delete playlist'),
  });
}

export function useAddTrack(playlistId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (track) => playlistApi.addTrack(playlistId, track),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', playlistId]);
      queryClient.invalidateQueries(['playlists']);
      toast.success('Added to playlist!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add track'),
  });
}

export function useRemoveTrack(playlistId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trackId) => playlistApi.removeTrack(playlistId, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries(['playlist', playlistId]);
      queryClient.invalidateQueries(['playlists']);
      toast.success('Track removed');
    },
    onError: () => toast.error('Failed to remove track'),
  });
}
