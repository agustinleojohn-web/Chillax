import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { MovieGrid } from '../components/movies/MovieGrid';
import { MovieFilters } from '../components/movies/MovieFilters';
import {
  FilterState,
  ITEMS_PER_PAGE,
  MAX_SCAN_PAGES,
  SCAN_PAGE_SIZE,
  applyClientFilters,
  dedupeById,
  needsClientFilter,
  paginate,
  parseFilters,
  parsePage,
  serializeFilters,
  totalPagesFor,
} from '../lib/movie-filters';
import { Movie } from '../types/movie';
import { LANGUAGE_COUNTS } from '../lib/constants';
import {
  SITE_PROXY_PREFIX,
  buildBrowsePath,
  looksLikeSpaShell,
  mapWithConcurrency,
  parseBrowseHtml,
} from '../lib/site-browse';
import { ListMoviesParams } from '../types/api';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Button } from '../components/ui/Button';
import { useSeo } from '../lib/seo';

interface CatalogResult {
  /** Movies to show: one page when `localPaging` is false, otherwise the full filtered list. */
  movies: Movie[];
  /** Total matches when known (undefined for website listings with extra filters). */
  total?: number;
  /** True when the movies are the whole filtered list and must be paged here. */
  localPaging: boolean;
  /** Website listing only: whether the site has another page after this one. */
  hasNext?: boolean;
  /** True when a client-side scan stopped at MAX_SCAN_PAGES before covering the whole catalog. */
  truncated: boolean;
  /** Website listing only: listed titles that couldn't be matched to an API record. */
  unresolved?: number;
  /** The website listing was unavailable, so language was filtered from a capped API scan instead. */
  fellBack?: boolean;
}

/** Only language is chosen here; every other active filter makes the site's total unknown to us. */
function onlyLanguageActive(f: FilterState): boolean {
  return !f.query_term && f.quality === 'all' && f.genre === 'All' && f.minimum_rating === 0;
}

async function fetchSiteListing(filters: FilterState, page: number, signal?: AbortSignal): Promise<CatalogResult> {
  const res = await fetch(`${SITE_PROXY_PREFIX}${buildBrowsePath(filters, page)}`, { signal });
  if (!res.ok) throw new Error(`Website listing failed (${res.status})`);
  const html = await res.text();
  if (looksLikeSpaShell(html)) throw new Error('Website listing proxy is not configured');

  const { entries, hasNext } = parseBrowseHtml(html);
  const resolved = await mapWithConcurrency(entries, 5, (e) => movieApi.findMovieBySlug(e.slug, e.title, signal));
  const movies = resolved.filter((m): m is Movie => m !== null);

  return {
    movies,
    total: onlyLanguageActive(filters) ? LANGUAGE_COUNTS[filters.language] : undefined,
    localPaging: false,
    hasNext,
    truncated: false,
    unresolved: entries.length - movies.length,
  };
}

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useSeo({
    title: 'Browse Movies & Torrents',
    description: 'Browse the complete catalog of cinema titles. Filter by quality, genre, rating, year, language, and order.',
  });

  const filters: FilterState = useMemo(() => parseFilters(searchParams), [searchParams]);
  const requestedPage = parsePage(searchParams);

  // The API can't filter by language or year, and can't search by actor or director. The website's
  // listing can do all of these, so it answers those requests; year/language fall back to a capped
  // local scan of API pages if the website listing is unavailable.
  const personSearch = searchParams.get('person') === '1' && Boolean(filters.query_term);
  const siteOnly = filters.language !== 'all' || filters.year !== 'all' || personSearch;
  const clientMode = needsClientFilter(filters);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<CatalogResult>({
    // Local-paging scans are cached once, so page changes don't refetch them.
    queryKey: movieKeys.list({
      ...filters,
      page: clientMode && !siteOnly ? 0 : requestedPage,
      clientMode,
      siteOnly,
      personSearch,
    }),
    placeholderData: (previous) => previous,
    queryFn: async ({ signal }): Promise<CatalogResult> => {
      const base: ListMoviesParams = {
        query_term: filters.query_term.trim() || undefined,
        genre: filters.genre !== 'All' ? filters.genre : undefined,
        quality: filters.quality !== 'all' ? filters.quality : undefined,
        minimum_rating: filters.minimum_rating > 0 ? filters.minimum_rating : undefined,
        sort_by: filters.sort_by,
        order_by: filters.order_by,
      };

      let fellBack = false;
      if (siteOnly) {
        try {
          return await fetchSiteListing(filters, requestedPage, signal);
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') throw err;
          fellBack = true; // fall through to the API below
        }
      }

      if (!clientMode) {
        const res = await movieApi.listMovies({ ...base, limit: ITEMS_PER_PAGE, page: requestedPage }, signal);

        // The API only matches titles. A name search (actor / director) comes back empty there,
        // so retry it against the website listing before reporting "no results".
        if (res.movie_count === 0 && base.query_term && !siteOnly) {
          try {
            const viaSite = await fetchSiteListing(filters, requestedPage, signal);
            if (viaSite.movies.length > 0) return viaSite;
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') throw err;
          }
        }
        return { movies: res.movies ?? [], total: res.movie_count, localPaging: false, truncated: false, fellBack };
      }

      const first = await movieApi.listMovies({ ...base, limit: SCAN_PAGE_SIZE, page: 1 }, signal);
      const pagesAvailable = Math.ceil(first.movie_count / SCAN_PAGE_SIZE);
      const pagesToScan = Math.min(pagesAvailable, MAX_SCAN_PAGES);
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, pagesToScan - 1) }, (_, i) =>
          movieApi.listMovies({ ...base, limit: SCAN_PAGE_SIZE, page: i + 2 }, signal)
        )
      );

      const scanned = dedupeById([first, ...rest].flatMap((r) => r.movies ?? []));
      const matches = applyClientFilters(scanned, filters);
      return {
        movies: matches,
        total: matches.length,
        localPaging: true,
        truncated: pagesAvailable > pagesToScan,
        fellBack,
      };
    },
  });

  const totalPages = !data
    ? 1
    : data.localPaging
    ? totalPagesFor(data.total ?? 0)
    : data.hasNext !== undefined
    ? Math.max(requestedPage + (data.hasNext ? 1 : 0), data.total ? totalPagesFor(data.total) : 1)
    : totalPagesFor(data.total ?? 0);
  const currentPage = Math.min(requestedPage, totalPages);

  // A shrinking result set (e.g. a narrower filter) can leave the URL on a page that no longer exists.
  useEffect(() => {
    if (data && requestedPage !== currentPage) {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(currentPage));
      setSearchParams(next, { replace: true });
    }
  }, [data, requestedPage, currentPage, searchParams, setSearchParams]);

  const visibleMovies = useMemo(
    () => (data?.localPaging ? paginate(data.movies, currentPage) : data?.movies ?? []),
    [data, currentPage]
  );

  // Filters are only applied (and the API only called) when the user presses Search.
  const handleApply = (next: FilterState) => {
    const params = serializeFilters(next, 1);
    // A person search stays a person search only while the name in the box is unchanged.
    if (personSearch && next.query_term === filters.query_term) params.set('person', '1');
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams({ page: '1' }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="border-b border-[#262626] pb-4">
        <h1 className="font-bebas text-3xl sm:text-5xl font-normal uppercase tracking-wide text-white">
          All Movies
        </h1>
        <p className="text-xs text-[#AAAAAA] mt-1">
          Explore the cinema catalog filtered by quality, genre, IMDb score, release year, and language.
        </p>
      </div>

      {personSearch && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#262626] bg-[#181818] px-4 py-3 text-sm">
          <span className="text-[#CCCCCC]">
            Movies featuring <strong className="text-white">{filters.query_term}</strong>
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-[#888888] hover:text-[#E50914] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Filter Component */}
      <MovieFilters
        filters={filters}
        onApply={handleApply}
        onReset={handleResetFilters}
        totalCount={data?.total}
        totalIsApproximate={data?.truncated}
      />

      {/* States */}
      {isError ? (
        <ErrorState
          title="Failed to Load Movies"
          message={error instanceof Error ? error.message : 'Unable to query the movie catalog.'}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <MovieGrid isLoading skeletonCount={ITEMS_PER_PAGE} />
      ) : visibleMovies.length === 0 ? (
        <EmptyState
          type="movies"
          title="No movies found"
          description="We couldn't find any titles matching the selected filters. Try broadening your criteria."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          {data?.fellBack && (
            <p className="text-xs text-[#E5A00D]">
              The full catalog listing is unavailable right now, so these results come from a limited search and may be
              incomplete.
            </p>
          )}
          {data?.truncated && (
            <p className="text-xs text-[#888888]">
              Year/language filters were applied to the first {MAX_SCAN_PAGES * SCAN_PAGE_SIZE} matching titles. Narrow
              the search (genre, quality, rating) to see more.
            </p>
          )}
          {Boolean(data?.unresolved) && (
            <p className="text-xs text-[#888888]">
              {data?.unresolved} listed title{data?.unresolved === 1 ? '' : 's'} on this page couldn't be loaded.
            </p>
          )}
          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <MovieGrid movies={visibleMovies} />
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#262626]">
              <div className="text-xs text-[#888888] font-mono">
                Page <span className="text-white font-bold">{currentPage}</span>
                {data?.hasNext === undefined || data.total ? (
                  <>
                    {' '}of <span className="text-white font-bold">{totalPages.toLocaleString()}</span>
                  </>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  <span className="w-8 h-8 rounded-md bg-[#E50914] text-white font-bold text-xs flex items-center justify-center font-mono">
                    {currentPage}
                  </span>
                  {currentPage < totalPages && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="w-8 h-8 rounded-md bg-[#222222] hover:bg-[#2C2C2C] text-[#AAAAAA] hover:text-white border border-[#333333] text-xs flex items-center justify-center font-mono transition-colors"
                    >
                      {currentPage + 1}
                    </button>
                  )}
                  {currentPage + 1 < totalPages && (
                    <span className="text-xs text-[#666666] px-1 font-mono">...</span>
                  )}
                  {currentPage + 2 < totalPages && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 rounded-md bg-[#222222] hover:bg-[#2C2C2C] text-[#AAAAAA] hover:text-white border border-[#333333] text-xs flex items-center justify-center font-mono transition-colors"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
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