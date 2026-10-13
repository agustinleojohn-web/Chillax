import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { useSeo } from '../lib/seo';

const ITEMS_PER_PAGE = 24;

export function TopRatedPage() {
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState(8);

  useSeo({
    title: 'Top Rated Movies — High Scores',
    description: 'Explore masterworks and high-scoring films rated 8.0+ on IMDb available in verified formats.',
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: movieKeys.list({ sort_by: 'rating', minimum_rating: minRating, page, limit: ITEMS_PER_PAGE }),
    queryFn: ({ signal }) =>
      movieApi.listMovies(
        {
          sort_by: 'rating',
          order_by: 'desc',
          minimum_rating: minRating,
          page,
          limit: ITEMS_PER_PAGE,
        },
        signal
      ),
  });

  const totalPages = Math.ceil((data?.movie_count ?? 0) / ITEMS_PER_PAGE);
  const movies = data?.movies || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-[#262626] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E50914] mb-1">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Critical Acclaim</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-4xl font-normal uppercase tracking-wide text-white">
            Top Rated Cinema
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Films ranked strictly by critical reception and audience acclaim.
          </p>
        </div>

        {/* Rating threshold filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#181818] border border-[#2F2F2F]">
          {[7, 8, 9].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => {
                setMinRating(score);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                minRating === score
                  ? 'bg-[#E50914] text-white shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              {score}.0+
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <ErrorState
          title="Could Not Load Top Rated Titles"
          message={error instanceof Error ? error.message : 'Failed to query top rated movies.'}
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
