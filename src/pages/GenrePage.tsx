import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ChevronRight as BreadcrumbArrow } from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { useSeo } from '../lib/seo';

const ITEMS_PER_PAGE = 24;

export function GenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [genre]);

  const formattedGenre = genre ? genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase() : '';

  useSeo({
    title: `${formattedGenre} Movies & Catalog`,
    description: `Discover top ${formattedGenre} cinema, ratings, and verified torrent releases on Chillax.`,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: movieKeys.list({ genre: formattedGenre, page, limit: ITEMS_PER_PAGE }),
    queryFn: ({ signal }) =>
      movieApi.listMovies(
        {
          genre: formattedGenre,
          sort_by: 'download_count',
          page,
          limit: ITEMS_PER_PAGE,
        },
        signal
      ),
    enabled: Boolean(formattedGenre),
  });

  const totalPages = Math.ceil((data?.movie_count ?? 0) / ITEMS_PER_PAGE);
  const movies = data?.movies || [];

  return (
    <div className="space-y-6 pb-12">
      <nav className="flex items-center gap-1.5 text-xs text-[#888888]">
        <Link to="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <Link to="/movies" className="hover:text-white transition-colors">
          Genres
        </Link>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <span className="text-[#E50914] font-bold">{formattedGenre}</span>
      </nav>

      <div className="border-b border-[#262626] pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1 h-3.5 bg-[#E50914] rounded-xs inline-block" />
            <span className="text-[11px] uppercase font-bold text-[#E50914] tracking-wider">
              GENRE ARCHIVE
            </span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-4xl font-normal uppercase tracking-wide text-white">
            {formattedGenre} Movies
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Displaying titles categorised under {formattedGenre}.
          </p>
        </div>

        {typeof data?.movie_count === 'number' && (
          <div className="px-3 py-1.5 rounded-md bg-[#181818] border border-[#2F2F2F] text-xs font-mono text-[#AAAAAA]">
            <span className="text-[#E50914] font-bold">{data.movie_count.toLocaleString()}</span> titles
          </div>
        )}
      </div>

      {isError ? (
        <ErrorState
          title={`Could not load ${formattedGenre} movies`}
          message={error instanceof Error ? error.message : 'Failed to query genre listings.'}
          onRetry={() => refetch()}
        />
      ) : !isLoading && movies.length === 0 ? (
        <EmptyState
          title={`No ${formattedGenre} titles found`}
          description="We couldn't locate any movies registered under this genre."
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
