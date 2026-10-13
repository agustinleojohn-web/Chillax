import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 30, // 30 minutes cache retention
      refetchOnWindowFocus: false, // Avoid excessive refetching
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        // Do not retry 404s or malformed responses
        if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...movieKeys.lists(), params] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (idOrImdb: number | string) => [...movieKeys.details(), String(idOrImdb)] as const,
  suggestions: (id: number) => [...movieKeys.all, 'suggestions', id] as const,
  people: (slug: string) => [...movieKeys.all, 'people', slug] as const,
  parentalGuides: (id: number) => [...movieKeys.all, 'parental-guides', id] as const,
};