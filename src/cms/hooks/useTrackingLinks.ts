import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrackingLinks,
  createTrackingLink,
  updateTrackingLink,
  deleteTrackingLink,
} from '../repositories/trackingRepository';
import type { TrackingLink } from '../types/cms.types';

export const TRACKING_LINKS_QUERY_KEY = ['tracking_links'] as const;

export function useTrackingLinks() {
  const queryClient = useQueryClient();

  const linksQuery = useQuery<TrackingLink[]>({
    queryKey: TRACKING_LINKS_QUERY_KEY,
    queryFn: fetchTrackingLinks,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const createMutation = useMutation<
    TrackingLink,
    Error,
    Omit<TrackingLink, 'id' | 'clicks_count' | 'created_at' | 'updated_at'> & {
      id?: string;
      clicks_count?: number;
    }
  >({
    mutationFn: (newLink) => createTrackingLink(newLink),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRACKING_LINKS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation<
    TrackingLink,
    Error,
    { id: string; updates: Partial<TrackingLink> }
  >({
    mutationFn: ({ id, updates }) => updateTrackingLink(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRACKING_LINKS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation<boolean, Error, string>({
    mutationFn: (id) => deleteTrackingLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRACKING_LINKS_QUERY_KEY });
    },
  });

  const toggleActive = async (id: string, currentStatus: boolean) => {
    return updateMutation.mutateAsync({
      id,
      updates: { is_active: !currentStatus },
    });
  };

  return {
    links: linksQuery.data || [],
    isLoading: linksQuery.isLoading,
    isFetching: linksQuery.isFetching,
    isError: linksQuery.isError,
    error: linksQuery.error,
    refetch: linksQuery.refetch,
    // Create
    createLink: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    // Update
    updateLink: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    toggleActive,
    // Delete
    deleteLink: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  };
}
