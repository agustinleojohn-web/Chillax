import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { rankLatestTorrents } from '../lib/ranking';
import { Movie } from '../types/movie';

/**
 * Hook to retrieve candidates and rank movies for "Latest Chillax Movies Torrents".
 *
 * Requirements:
 * 1. Fetches candidate pool from https://movies-api.accel.li/api/v2/list_movies.json
 *    using sort_by=date_added, order_by=desc, limit=50.
 * 2. Paginates across recent pages (150 candidates total) to ensure enough qualifying titles.
 * 3. Deduplicates candidates by stable movie ID.
 * 4. Filters out invalid records and those failing popularity eligibility.
 * 5. Sorts strictly by verified torrent upload timestamp, newest first, using popularity as a tie-breaker.
 * 6. Uses TanStack Query with stable query key and 10-minute cache retention.
 */
export function useRankedLatestTorrents() {
  return useQuery({
    queryKey: movieKeys.list({ section: 'latest_torrents_by_upload_date_v1' }),
    queryFn: async ({ signal }) => {
      // Fetch 3 pages of recent uploads (50 per page = 150 candidates)
      const [resPage1, resPage2, resPage3] = await Promise.all([
        movieApi
          .listMovies({ sort_by: 'date_added', order_by: 'desc', limit: 50, page: 1 }, signal)
          .catch(() => ({ movies: [] as Movie[] })),
        movieApi
          .listMovies({ sort_by: 'date_added', order_by: 'desc', limit: 50, page: 2 }, signal)
          .catch(() => ({ movies: [] as Movie[] })),
        movieApi
          .listMovies({ sort_by: 'date_added', order_by: 'desc', limit: 50, page: 3 }, signal)
          .catch(() => ({ movies: [] as Movie[] })),
      ]);

      const pool: Movie[] = [
        ...(resPage1.movies || []),
        ...(resPage2.movies || []),
        ...(resPage3.movies || []),
      ];

      // Rank candidates using upload-date-first ordering with popularity eligibility
      const ranked = rankLatestTorrents(pool, {
        popularityThresholds: {
          minRating: 4.5,
          minReleaseYear: 2018,
          minSwarmSeeds: 5,
        },
        maxGenreConsecutive: 3,
      });

      return ranked;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
