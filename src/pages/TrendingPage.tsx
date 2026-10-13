import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { useSeo } from '../lib/seo';

const ITEMS_PER_PAGE = 24;

export function TrendingPage() {
  const [page, setPage] = useState(1);

  useSeo({
    title: 'Trending Movies — Trending Cinema of Nowadays',
    description: 'Discover the latest trending movies that everybody talks about nowadays with verified BitTorrent magnets on Chillax.',
  });

  // Query latest trending movies of nowadays (years >= 2024, prioritized by popularity and active buzz)
  const { data: rawData, isLoading, isError, error, refetch } = useQuery({
    queryKey: movieKeys.list({ trending_nowadays: true, page, limit: ITEMS_PER_PAGE }),
    queryFn: async ({ signal }) => {
      // Fetch latest high-buzz releases across 2026, 2025, and 2024
      const [res26, res25, res24] = await Promise.all([
        movieApi.listMovies({ query_term: '2026', sort_by: 'download_count', limit: 15, page }, signal).catch(() => ({ movies: [] })),
        movieApi.listMovies({ query_term: '2025', sort_by: 'download_count', limit: 15, page }, signal).catch(() => ({ movies: [] })),
        movieApi.listMovies({ query_term: '2024', sort_by: 'download_count', limit: 15, page }, signal).catch(() => ({ movies: [] })),
      ]);

      const pool = [...(res26.movies || []), ...(res25.movies || []), ...(res24.movies || [])];
      const seen = new Set<number>();
      const combined = [];
      for (const m of pool) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          combined.push(m);
        }
      }

      // Sort by latest year first, then by rating & popularity
      combined.sort((a, b) => b.year - a.year || b.rating - a.rating);

      return {
        movies: combined,
        movie_count: 120,
      };
    },
  });

  const movies = rawData?.movies || [];
  const totalPages = Math.ceil((rawData?.movie_count ?? 120) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-24">
      <div className="border-b border-[#262626] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#E50914] mb-1">
            <Flame className="w-5 h-5 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wider">TRENDING NOWADAYS</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl font-normal uppercase tracking-wide text-white">
            Trending Movies
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            The latest blockbuster hits and trending titles that everybody is talking about right now.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-md bg-[#181818] border border-[#2F2F2F] text-xs font-mono text-[#AAAAAA] self-start sm:self-auto">
          <span className="text-[#E50914] font-bold">Latest Releases</span> 
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Could Not Load Trending Titles"
          message={error instanceof Error ? error.message : 'Failed to query trending releases.'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <MovieGrid movies={movies} isLoading={isLoading} skeletonCount={ITEMS_PER_PAGE} />

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-[#262626]">
              <span className="text-xs text-[#888888] font-mono">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setPage((p) => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
