import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { useSeo } from '../lib/seo';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useSeo({
    title: debouncedQuery ? `Search: "${debouncedQuery}"` : 'Search Cinema Catalog',
    description: `Search movie catalog results for "${debouncedQuery}" on Chillax.`,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputVal.trim());
      if (inputVal.trim()) {
        setSearchParams({ q: inputVal.trim() }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputVal, setSearchParams]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q !== inputVal) {
      setInputVal(q);
      setDebouncedQuery(q);
    }
  }, [searchParams]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: movieKeys.list({ query_term: debouncedQuery, limit: 30 }),
    queryFn: ({ signal }) =>
      movieApi.searchMovies(
        {
          query_term: debouncedQuery,
          limit: 30,
          sort_by: 'download_count',
        },
        signal
      ),
    enabled: Boolean(debouncedQuery),
  });

  const movies = data?.movies || [];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <div className="space-y-4 text-center sm:text-left">
        <div>
          <h1 className="font-bebas text-3xl sm:text-4xl font-normal uppercase tracking-wide text-white">
            Search Titles
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Search by movie title, actor, director, or IMDb ID (e.g. tt1375666).
          </p>
        </div>

        <div className="relative max-w-2xl">
          <Input
            icon={<Search className="w-5 h-5 text-[#888888]" />}
            placeholder="Search movies, actors, franchises..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            autoFocus
            className="text-base py-3 pl-11 bg-[#181818] border-[#333333] focus:border-[#E50914] focus:ring-[#E50914]"
            rightElement={
              inputVal ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal('');
                    setDebouncedQuery('');
                    setSearchParams({});
                  }}
                  className="p-1 text-[#888888] hover:text-white rounded-md transition-colors"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null
            }
          />
        </div>
      </div>

      {!debouncedQuery ? (
        <div className="p-12 text-center rounded-lg border border-[#262626] bg-[#181818]">
          <Search className="w-10 h-10 text-[#444444] mx-auto mb-3" />
          <p className="text-sm text-[#AAAAAA]">Enter a movie title or keyword above to search the catalog.</p>
        </div>
      ) : isError ? (
        <ErrorState
          title="Search Failed"
          message={error instanceof Error ? error.message : 'Could not retrieve search results.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <MovieGrid isLoading skeletonCount={12} />
      ) : movies.length === 0 ? (
        <EmptyState
          type="search"
          title={`No results for "${debouncedQuery}"`}
          description="We couldn't find any movies matching that query. Try another keyword or check spelling."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#888888] font-mono border-b border-[#262626] pb-2">
            <span>
              Found <strong className="text-white">{data?.movie_count || movies.length}</strong> matching titles
            </span>
            <span>Sorted by popularity</span>
          </div>

          <MovieGrid movies={movies} />
        </div>
      )}
    </div>
  );
}