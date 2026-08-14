import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProjects,
  fetchProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  type ProjectFilter,
} from '../repositories/projectRepository';
import type { ContentEntry } from '../types/cms.types';

export const PROJECTS_QUERY_KEY = ['projects'] as const;

export function useProjects(filter?: ProjectFilter) {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery<ContentEntry[]>({
    queryKey: ['projects', filter?.status || 'all', filter?.category || 'all', filter?.search || ''],
    queryFn: () => fetchProjects(filter),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  const createMutation = useMutation<ContentEntry, Error, Partial<ContentEntry>>({
    mutationFn: (newProject) => createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation<
    ContentEntry,
    Error,
    { id: string; updates: Partial<ContentEntry> }
  >({
    mutationFn: ({ id, updates }) => updateProject(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['project_by_slug', updated.slug] });
    },
  });

  const deleteMutation = useMutation<boolean, Error, string>({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  const duplicateMutation = useMutation<ContentEntry, Error, ContentEntry>({
    mutationFn: async (original) => {
      const copySlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
      const duplicated: Partial<ContentEntry> = {
        ...original,
        id: undefined,
        slug: copySlug,
        route: `/project/${copySlug}`,
        title: {
          en: `${original.title.en} (Copy)`,
          vi: `${original.title.vi} (Bản sao)`,
        },
        status: 'draft',
        sort_order: (original.sort_order ?? 0) + 1,
      };
      return createProject(duplicated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isFetching: projectsQuery.isFetching,
    isError: projectsQuery.isError,
    error: projectsQuery.error,
    refetch: projectsQuery.refetch,
    // Mutations
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    duplicateProject: duplicateMutation.mutateAsync,
    isDuplicating: duplicateMutation.isPending,
  };
}

export function useProjectBySlug(slug: string) {
  const queryClient = useQueryClient();

  const projectQuery = useQuery<ContentEntry | null>({
    queryKey: ['project_by_slug', slug],
    queryFn: () => fetchProjectBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation<
    ContentEntry,
    Error,
    { id: string; updates: Partial<ContentEntry> }
  >({
    mutationFn: ({ id, updates }) => updateProject(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['project_by_slug', updated.slug], updated);
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    isFetching: projectQuery.isFetching,
    isError: projectQuery.isError,
    error: projectQuery.error,
    refetch: projectQuery.refetch,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
