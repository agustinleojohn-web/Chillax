import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { useSeo } from '../lib/seo';

const ITEMS_PER_PAGE = 24;

export function FourKPage() {
  const [page, setPage] = useState(1);

  useSeo({
    title: '2160p 4K YTS YIFY Movies — Latest 4K Torrents',
    description: 'Download 2160p 4K Ultra HD YTS YIFY movies ordered by latest additions with verified BitTorrent magnets.',
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: movieKeys.list({ quality: '2160p', sort_by: 'date_added', order_by: 'desc', page, limit: ITEMS_PER_PAGE }),
    queryFn: ({ signal }) =>
      movieApi.listMovies(
        {
          quality: '2160p',
          sort_by: 'date_added',
          order_by: 'desc',
          page,
          limit: ITEMS_PER_PAGE,
        },
        signal
      ),
  });

  const totalPages = Math.ceil((data?.movie_count ?? 0) / ITEMS_PER_PAGE);
  const movies = data?.movies || [];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="border-b border-[#262626] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#E50914] mb-1">
            <Tv className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">2160P ULTRA HD</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-5xl font-normal uppercase tracking-wide text-white">
            2160p 4K YTS YIFY Movies
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Ultra high-definition releases ordered by latest torrent uploads.
          </p>
        </div>

        {typeof data?.movie_count === 'number' && (
          <div className="px-3 py-1.5 rounded-md bg-[#181818] border border-[#2F2F2F] text-xs font-mono text-[#AAAAAA] self-start sm:self-auto">
            <span className="text-[#E50914] font-bold">{data.movie_count.toLocaleString()}</span> 4K titles
          </div>
        )}
      </div>

      {/* Content Grid */}
      {isError ? (
        <ErrorState
          title="Could Not Load 4K Movies"
          message={error instanceof Error ? error.message : 'Failed to query 2160p 4K movie releases.'}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <MovieGrid movies={movies} isLoading={isLoading} skeletonCount={ITEMS_PER_PAGE} />

          {/* Pagination */}
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
