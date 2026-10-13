import { Movie } from '../types/movie';
import { isValidTorrentHash } from './torrent-utils';

export interface PopularityThresholdOptions {
  minRating?: number; // e.g. 4.5
  minReleaseYear?: number; // e.g. 2018 (ensures recent cinema rather than vintage archive rips)
  minSwarmSeeds?: number; // Active swarm threshold (e.g. 5)
  minDownloads?: number; // Verified download volume (e.g. 1000)
  minLikes?: number; // Verified likes volume (e.g. 10)
}

export interface RankingOptions {
  popularityThresholds?: PopularityThresholdOptions;
  maxGenreConsecutive?: number; // Prevent single genre cluster
}

export const DEFAULT_POPULARITY_THRESHOLDS: PopularityThresholdOptions = {
  minRating: 4.5,
  minReleaseYear: 2018,
  minSwarmSeeds: 5,
  minDownloads: 1000,
  minLikes: 10,
};

/**
 * Extracts the verified torrent upload timestamp (unix timestamp in seconds)
 * from the movie record or its torrent records.
 *
 * CRITICAL DATE DISTINCTIONS:
 * - Torrent upload date (date_uploaded_unix): When the torrent was indexed on the tracker.
 * - Movie release date / year (movie.year): Theatrical/cinematic premiere year.
 *
 * This function NEVER substitutes movie.year for the torrent upload timestamp.
 * If torrent-level timestamps exist, it selects the newest valid torrent upload timestamp.
 */
export function getMovieUploadTimestamp(movie: Movie | null | undefined): number {
  if (!movie || typeof movie !== 'object') return 0;

  // 1. Inspect torrents array: find newest valid torrent-level upload timestamp
  if (Array.isArray(movie.torrents) && movie.torrents.length > 0) {
    const torrentTimestamps = movie.torrents
      .map((t) => {
        if (!t || typeof t !== 'object') return 0;
        if (typeof t.date_uploaded_unix === 'number' && !isNaN(t.date_uploaded_unix) && t.date_uploaded_unix > 0) {
          return t.date_uploaded_unix;
        }
        if (t.date_uploaded && typeof t.date_uploaded === 'string') {
          const parsed = Date.parse(t.date_uploaded);
          if (!isNaN(parsed) && parsed > 0) return Math.floor(parsed / 1000);
        }
        return 0;
      })
      .filter((ts) => ts > 0);

    if (torrentTimestamps.length > 0) {
      return Math.max(...torrentTimestamps);
    }
  }

  // 2. Movie-level upload timestamp fallback
  if (typeof movie.date_uploaded_unix === 'number' && !isNaN(movie.date_uploaded_unix) && movie.date_uploaded_unix > 0) {
    return movie.date_uploaded_unix;
  }

  if (movie.date_uploaded && typeof movie.date_uploaded === 'string') {
    const parsed = Date.parse(movie.date_uploaded);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.floor(parsed / 1000);
    }
  }

  // If no verified upload timestamp exists, return 0 (never substitute movie.year)
  return 0;
}

/**
 * Validates that a movie is eligible for the "Latest Movies Torrents" section.
 * - Must have a valid identifier and title.
 * - Must have at least one genuine torrent record with a valid torrent info-hash.
 * - Must have a verified torrent upload timestamp > 0.
 * - Excludes invalid, corrupted, or placeholder records.
 */
export function isEligibleTorrentMovie(movie: Movie | null | undefined): boolean {
  if (!movie || typeof movie !== 'object') return false;
  if (!movie.id || typeof movie.id !== 'number' || isNaN(movie.id) || movie.id <= 0) return false;
  if (!movie.title || typeof movie.title !== 'string' || movie.title.trim().length === 0) return false;

  // Must have at least one valid torrent record with a validated info-hash
  if (!Array.isArray(movie.torrents) || movie.torrents.length === 0) return false;
  const hasValidTorrent = movie.torrents.some(
    (t) => t && typeof t === 'object' && isValidTorrentHash(t.hash)
  );
  if (!hasValidTorrent) return false;

  // Must have a verified upload timestamp
  const uploadTs = getMovieUploadTimestamp(movie);
  if (uploadTs <= 0) return false;

  return true;
}

/**
 * Evaluates whether a candidate movie meets the popularity eligibility rules.
 * Popularity acts as an ELIGIBILITY FILTER, not a recency override.
 *
 * Rules:
 * 1. Vintage filter: Movie release year must be recent enough (>= minReleaseYear, default 2018),
 *    unless the title has massive verified download volume (>= 25,000).
 * 2. Unrated filter: Movies with 0 or missing IMDb rating must have active swarm metrics
 *    (seeds >= 15) or verified download counts (>= 5,000) to qualify.
 * 3. Low-rating filter: Movies with IMDb < minRating (4.5) must show strong genuine demand
 *    (seeds >= 20 or downloads >= 15,000) to avoid obscure low-interest uploads dominating.
 * 4. General demand: Movie must show reasonable audience interest through rating (>= 5.0),
 *    active swarm seeds/peers (>= 5), or download/like counts.
 */
export function isPopularityEligible(
  movie: Movie,
  options: PopularityThresholdOptions = DEFAULT_POPULARITY_THRESHOLDS
): boolean {
  const minRating = options.minRating ?? DEFAULT_POPULARITY_THRESHOLDS.minRating!;
  const minReleaseYear = options.minReleaseYear ?? DEFAULT_POPULARITY_THRESHOLDS.minReleaseYear!;
  const minSwarmSeeds = options.minSwarmSeeds ?? DEFAULT_POPULARITY_THRESHOLDS.minSwarmSeeds!;
  const minDownloads = options.minDownloads ?? DEFAULT_POPULARITY_THRESHOLDS.minDownloads!;
  const minLikes = options.minLikes ?? DEFAULT_POPULARITY_THRESHOLDS.minLikes!;

  const maxSeeds = Math.max(
    0,
    ...(movie.torrents || []).map((t) => (typeof t?.seeds === 'number' && !isNaN(t.seeds) ? t.seeds : 0))
  );
  const maxPeers = Math.max(
    0,
    ...(movie.torrents || []).map((t) => (typeof t?.peers === 'number' && !isNaN(t.peers) ? t.peers : 0))
  );
  const dls = typeof movie.download_count === 'number' && !isNaN(movie.download_count) ? movie.download_count : 0;
  const likes = typeof movie.like_count === 'number' && !isNaN(movie.like_count) ? movie.like_count : 0;
  const rating = typeof movie.rating === 'number' && !isNaN(movie.rating) ? movie.rating : 0;
  const year = typeof movie.year === 'number' && !isNaN(movie.year) ? movie.year : 0;

  // 1. Release recency filter: Exclude obscure vintage archive rips unless massive popularity
  if (year < minReleaseYear && dls < 25000 && maxSeeds < 50) {
    return false;
  }

  // 2. Unrated movies (rating <= 0): Require active swarm demand to qualify
  if (rating <= 0) {
    return maxSeeds >= 15 || dls >= 5000;
  }

  // 3. Low-rating threshold (< minRating, e.g. 4.5): Require verified swarm or download demand
  if (rating < minRating) {
    return maxSeeds >= 20 || dls >= 15000;
  }

  // 4. Positive demand: Either rating >= 5.0, active swarm, or verified downloads/likes
  const hasRatingDemand = rating >= 5.0;
  const hasSwarmDemand = maxSeeds >= minSwarmSeeds || maxPeers >= minSwarmSeeds;
  const hasDownloadDemand = dls >= minDownloads || likes >= minLikes;

  return hasRatingDemand || hasSwarmDemand || hasDownloadDemand;
}

/**
 * Calculates a composite popularity score (0.0 to 1.0) used EXCLUSIVELY
 * as a tie-breaker when two movies have the exact same upload timestamp.
 *
 * It uses available metrics:
 * - IMDb rating (0 to 10)
 * - Swarm seeds and peers (log-scaled)
 * - Download count and like count (log-scaled if present)
 */
export function computePopularityScore(movie: Movie): number {
  const rating = typeof movie.rating === 'number' && !isNaN(movie.rating) ? movie.rating : 0;
  const ratingScore = Math.max(0, Math.min(10, rating)) / 10;

  const maxSeeds = Math.max(
    0,
    ...(movie.torrents || []).map((t) => (typeof t?.seeds === 'number' && !isNaN(t.seeds) ? t.seeds : 0))
  );
  const maxPeers = Math.max(
    0,
    ...(movie.torrents || []).map((t) => (typeof t?.peers === 'number' && !isNaN(t.peers) ? t.peers : 0))
  );

  const swarmScore =
    maxSeeds > 0 || maxPeers > 0
      ? 0.7 * (Math.log10(1 + maxSeeds) / Math.log10(501)) +
        0.3 * (Math.log10(1 + maxPeers) / Math.log10(501))
      : 0.2;

  let downloadScore = 0.2; // Neutral baseline for missing metric
  if (typeof movie.download_count === 'number' && !isNaN(movie.download_count) && movie.download_count > 0) {
    downloadScore = Math.min(1.0, Math.log10(1 + movie.download_count) / Math.log10(100001));
  } else if (typeof movie.like_count === 'number' && !isNaN(movie.like_count) && movie.like_count > 0) {
    downloadScore = Math.min(1.0, Math.log10(1 + movie.like_count) / Math.log10(5001));
  }

  // Weighted tie-breaker: 40% rating, 35% swarm activity, 25% download volume
  return Math.min(1.0, Math.max(0.05, 0.4 * ratingScore + 0.35 * swarmScore + 0.25 * downloadScore));
}

/**
 * Primary ranking function for "Latest Chillax Movies Torrents".
 *
 * ORDERING STRATEGY (Strictly Enforced):
 * 1. Filter out invalid records and movies failing popularity eligibility.
 * 2. Sort the remaining movies by verified torrent upload timestamp, NEWEST FIRST.
 * 3. When two movies have the exact same upload timestamp, break the tie by popularity.
 * 4. Deterministic final tie-breaker: movie ID.
 *
 * A weighted popularity score is NEVER allowed to move an older upload ahead of a newer qualifying upload.
 */
export function rankLatestTorrents(
  candidates: (Movie | null | undefined)[],
  options: RankingOptions = {}
): Movie[] {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return [];
  }

  const popOptions = options.popularityThresholds || DEFAULT_POPULARITY_THRESHOLDS;
  const maxGenreConsecutive = options.maxGenreConsecutive ?? 3;

  // Step 1: Deduplicate candidates by stable movie ID and filter
  const seenIds = new Set<number>();
  const qualifying: Movie[] = [];

  for (const movie of candidates) {
    if (!movie || typeof movie !== 'object') continue;
    if (seenIds.has(movie.id)) continue;
    seenIds.add(movie.id);

    // Essential torrent and timestamp validation
    if (!isEligibleTorrentMovie(movie)) continue;

    // Popularity eligibility check
    if (!isPopularityEligible(movie, popOptions)) continue;

    qualifying.push(movie);
  }

  // Step 2: Sort qualifying movies by verified upload timestamp FIRST
  qualifying.sort((a, b) => {
    const uploadTsA = getMovieUploadTimestamp(a);
    const uploadTsB = getMovieUploadTimestamp(b);

    // Primary rule: Upload date/timestamp, newest first
    if (uploadTsB !== uploadTsA) {
      return uploadTsB - uploadTsA;
    }

    // Secondary rule: Popularity tie-breaker for identical upload timestamp
    const popA = computePopularityScore(a);
    const popB = computePopularityScore(b);
    if (Math.abs(popB - popA) > 0.0001) {
      return popB - popA;
    }

    // Final deterministic tie-breaker: movie ID
    return b.id - a.id;
  });

  // Step 3: Apply subtle genre diversity smoothing while preserving chronology
  if (maxGenreConsecutive > 0 && qualifying.length > 8) {
    const result: Movie[] = [];
    const deferred: Movie[] = [];
    let lastGenre = '';
    let consecutiveCount = 0;

    for (const item of qualifying) {
      const primaryGenre = item.genres?.[0] || 'Unknown';
      if (primaryGenre === lastGenre) {
        consecutiveCount++;
        if (consecutiveCount > maxGenreConsecutive) {
          deferred.push(item);
          continue;
        }
      } else {
        lastGenre = primaryGenre;
        consecutiveCount = 1;
      }
      result.push(item);
    }

    for (const item of deferred) {
      result.push(item);
    }

    return result;
  }

  return qualifying;
}
