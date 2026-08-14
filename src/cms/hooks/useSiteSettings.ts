import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSiteSettings, updateSiteSettings } from '../repositories/siteSettingsRepository';
import type { SiteSettings } from '../types/cms.types';

export const SITE_SETTINGS_QUERY_KEY = ['site_settings'] as const;

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<SiteSettings>({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  const updateMutation = useMutation<SiteSettings, Error, Partial<SiteSettings>>({
    mutationFn: (newSettings) => updateSiteSettings(newSettings),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(SITE_SETTINGS_QUERY_KEY, updatedData);
      queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isFetching: settingsQuery.isFetching,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    refetch: settingsQuery.refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isUpdateSuccess: updateMutation.isSuccess,
    updateError: updateMutation.error,
    resetUpdateStatus: updateMutation.reset,
  };
}
