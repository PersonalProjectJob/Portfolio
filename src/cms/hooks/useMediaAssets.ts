import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMediaAssets,
  uploadMediaAsset,
  deleteMediaAsset,
  updateMediaAssetAltText,
} from '../repositories/mediaRepository';
import type { MediaAsset, LocalizedString } from '../types/cms.types';

export const MEDIA_ASSETS_QUERY_KEY = ['media_assets'] as const;

export function useMediaAssets(search?: string) {
  const queryClient = useQueryClient();

  const assetsQuery = useQuery<MediaAsset[]>({
    queryKey: ['media_assets', search || ''],
    queryFn: () => fetchMediaAssets(search),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const uploadMutation = useMutation<
    MediaAsset,
    Error,
    { file: File; folder?: string; altText?: LocalizedString }
  >({
    mutationFn: ({ file, folder, altText }) => uploadMediaAsset(file, folder, altText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_ASSETS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation<
    boolean,
    Error,
    { id: string; storagePath: string }
  >({
    mutationFn: ({ id, storagePath }) => deleteMediaAsset(id, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_ASSETS_QUERY_KEY });
    },
  });

  const updateAltMutation = useMutation<
    MediaAsset | null,
    Error,
    { id: string; altText: LocalizedString }
  >({
    mutationFn: ({ id, altText }) => updateMediaAssetAltText(id, altText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_ASSETS_QUERY_KEY });
    },
  });

  return {
    assets: assetsQuery.data || [],
    isLoading: assetsQuery.isLoading,
    isFetching: assetsQuery.isFetching,
    isError: assetsQuery.isError,
    error: assetsQuery.error,
    refetch: assetsQuery.refetch,
    // Upload
    uploadAsset: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    // Delete
    deleteAsset: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    // Update Alt Text
    updateAltText: updateAltMutation.mutateAsync,
    isUpdatingAlt: updateAltMutation.isPending,
  };
}
