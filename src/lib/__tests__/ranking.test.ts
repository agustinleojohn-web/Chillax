import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMovieUploadTimestamp,
  isEligibleTorrentMovie,
  isPopularityEligible,
  computePopularityScore,
  rankLatestTorrents,
} from '../ranking';
import { Movie, Torrent } from '../../types/movie';

// Helper to create synthetic test fixtures clearly identified as mock test data
function createMockTorrent(overrides: Partial<Torrent> = {}): Torrent {
  return {
    url: 'https://example.com/mock.torrent',
    hash: '0123456789ABCDEF0123456789ABCDEF01234567', // Valid 40-char SHA1 hex
    quality: '1080p',
    type: 'bluray',
    seeds: 50,
    peers: 20,
    size: '2.1 GB',
    size_bytes: 2254857830,
    date_uploaded: '2026-10-12 02:36:20',
    date_uploaded_unix: 1791765380,
    ...overrides,
  };
}

function createMockMovie(overrides: Partial<Movie> = {}): Movie {
  const defaultTorrent = createMockTorrent();
  return {
    id: 1001,
    url: 'https://example.com/movie/1001',
    imdb_code: 'tt1001001',
    title: 'Synthetic Test Movie',
    title_english: 'Synthetic Test Movie',
    title_long: 'Synthetic Test Movie (2026)',
    slug: 'synthetic-test-movie',
    year: 2026,
    rating: 6.5,
    runtime: 120,
    genres: ['Action', 'Comedy'],
    summary: 'A synthetic test movie summary',
    description_full: 'Synthetic full description',
    synopsis: 'Synthetic synopsis',
    yt_trailer_code: 'dQw4w9WgXcQ',
    language: 'en',
    mpa_rating: 'PG-13',
    background_image: 'https://example.com/bg.jpg',
    background_image_original: 'https://example.com/bgo.jpg',
    small_cover_image: 'https://example.com/cover_s.jpg',
    medium_cover_image: 'https://example.com/cover_m.jpg',
    large_cover_image: 'https://example.com/cover_l.jpg',
    state: 'ok',
    torrents: [defaultTorrent],
    date_uploaded: '2026-10-12 02:36:20',
    date_uploaded_unix: 1791765380,
    download_count: 20000,
    like_count: 500,
    ...overrides,
  };
}

describe('Latest Chillax Movies Torrents Ranking Engine', () => {
  // Test 1: A newer popular upload ranks above an older popular upload even if older has higher IMDb rating
  it('a newer popular upload ranks above an older popular upload even if older movie has a higher IMDb rating', () => {
    // Newer upload (e.g. Practical Magic 2 scenario: October 2026 upload, rating 6.3)
    const newerUpload = createMockMovie({
      id: 79035,
      title: 'Mock Practical Magic 2',
      year: 2026,
      rating: 6.3,
      date_uploaded_unix: 1791765380, // October 12, 2026
      torrents: [createMockTorrent({ date_uploaded_unix: 1791765380, seeds: 100, peers: 100 })],
      download_count: 35000,
    });

    // Older upload (e.g. Project Hail Mary scenario: July 2026 upload, rating 8.2)
    const olderUpload = createMockMovie({
      id: 76210,
      title: 'Mock Project Hail Mary',
      year: 2026,
      rating: 8.2, // Higher rating!
      date_uploaded_unix: 1785171602, // July 27, 2026 (older by ~2.5 months)
      torrents: [createMockTorrent({ date_uploaded_unix: 1785171602, seeds: 100, peers: 100 })],
      download_count: 85000,
    });

    // Given both candidates in any input order
    const ranked = rankLatestTorrents([olderUpload, newerUpload]);

    assert.equal(ranked.length, 2);
    assert.equal(
      ranked[0].id,
      newerUpload.id,
      'Newer upload must strictly rank ahead of older upload, regardless of rating'
    );
    assert.equal(ranked[1].id, olderUpload.id);
  });

  // Test 2: A newer obscure upload is filtered out by popularity eligibility rules
  it('a newer obscure upload can be filtered out by popularity eligibility rules', () => {
    // Highly recent upload, but completely obscure (0 rating, 0 seeds, 0 peers, 0 downloads)
    const obscureZeroRating = createMockMovie({
      id: 99001,
      title: 'Mock Obscure Unrated File Rip',
      year: 2026,
      rating: 0,
      date_uploaded_unix: 1791800000, // Very fresh timestamp
      torrents: [createMockTorrent({ date_uploaded_unix: 1791800000, seeds: 0, peers: 0 })],
      download_count: 0,
      like_count: 0,
    });

    // Low rated without any swarm interest
    const obscureLowRated = createMockMovie({
      id: 99002,
      title: 'Mock Low Rated Junk Rip',
      year: 2026,
      rating: 2.8,
      date_uploaded_unix: 1791800000,
      torrents: [createMockTorrent({ date_uploaded_unix: 1791800000, seeds: 1, peers: 0 })],
      download_count: 10,
    });

    // Valid popular recent upload
    const validPopular = createMockMovie({
      id: 99003,
      title: 'Mock Valid Popular Release',
      year: 2026,
      rating: 6.8,
      date_uploaded_unix: 1791700000,
      torrents: [createMockTorrent({ date_uploaded_unix: 1791700000, seeds: 80, peers: 40 })],
    });

    assert.equal(isPopularityEligible(obscureZeroRating), false, 'Unrated movie with 0 seeds must fail');
    assert.equal(isPopularityEligible(obscureLowRated), false, 'Sub-4.0 movie with 1 seed must fail');
    assert.equal(isPopularityEligible(validPopular), true, 'Valid movie with good rating/swarm must pass');

    const ranked = rankLatestTorrents([obscureZeroRating, obscureLowRated, validPopular]);
    assert.equal(ranked.length, 1);
    assert.equal(ranked[0].id, validPopular.id);
  });

  // Test 3: Popularity breaks ties between uploads with the same timestamp
  it('popularity breaks ties between uploads with the same timestamp', () => {
    const sameTimestamp = 1791500000;

    const lowerPopularity = createMockMovie({
      id: 8801,
      title: 'Mock Lower Popularity Film',
      rating: 5.5,
      date_uploaded_unix: sameTimestamp,
      torrents: [createMockTorrent({ date_uploaded_unix: sameTimestamp, seeds: 10, peers: 5 })],
      download_count: 2000,
    });

    const higherPopularity = createMockMovie({
      id: 8802,
      title: 'Mock Higher Popularity Blockbuster',
      rating: 8.5,
      date_uploaded_unix: sameTimestamp,
      torrents: [createMockTorrent({ date_uploaded_unix: sameTimestamp, seeds: 200, peers: 120 })],
      download_count: 90000,
    });

    const ranked = rankLatestTorrents([lowerPopularity, higherPopularity]);

    assert.equal(ranked.length, 2);
    assert.equal(
      ranked[0].id,
      higherPopularity.id,
      'When upload timestamps are identical, the more popular title must win the tie-breaker'
    );
  });

  // Test 4: Missing or invalid upload dates are handled explicitly and cannot make old movie appear new
  it('missing or invalid upload dates are handled explicitly and cannot make an old movie appear new', () => {
    const movieNoDate = createMockMovie({
      id: 7701,
      title: 'Mock Movie Missing Upload Date',
      year: 2027, // Release year must NOT be substituted!
      date_uploaded: '',
      date_uploaded_unix: 0,
      torrents: [createMockTorrent({ date_uploaded: '', date_uploaded_unix: 0 })],
    });

    const timestamp = getMovieUploadTimestamp(movieNoDate);
    assert.equal(timestamp, 0, 'Timestamp must be 0 when upload date is missing, never movie.year');
    assert.equal(isEligibleTorrentMovie(movieNoDate), false, 'Movie without upload date must not be eligible');

    const ranked = rankLatestTorrents([movieNoDate]);
    assert.equal(ranked.length, 0);
  });

  // Test 5: Duplicate movie records are removed
  it('duplicate movie records are removed', () => {
    const movie1 = createMockMovie({ id: 5501, title: 'Mock Movie Dup 1' });
    const movie1Dup = createMockMovie({ id: 5501, title: 'Mock Movie Dup 1 (Page 2 copy)' });
    const movie2 = createMockMovie({ id: 5502, title: 'Mock Movie Distinct' });

    const ranked = rankLatestTorrents([movie1, movie1Dup, movie2]);
    assert.equal(ranked.length, 2);
    const ids = ranked.map((m) => m.id);
    assert.equal(ids.filter((id) => id === 5501).length, 1);
  });

  // Test 6: The ordering is deterministic
  it('the ordering is deterministic across repeated runs', () => {
    const candidates = [
      createMockMovie({ id: 101, date_uploaded_unix: 1791700000 }),
      createMockMovie({ id: 102, date_uploaded_unix: 1791800000 }),
      createMockMovie({ id: 103, date_uploaded_unix: 1791600000 }),
      createMockMovie({ id: 104, date_uploaded_unix: 1791800000, rating: 8.0 }),
    ];

    const run1 = rankLatestTorrents(candidates);
    const run2 = rankLatestTorrents(candidates);
    const run3 = rankLatestTorrents(candidates);

    assert.deepEqual(
      run1.map((m) => m.id),
      run2.map((m) => m.id)
    );
    assert.deepEqual(
      run2.map((m) => m.id),
      run3.map((m) => m.id)
    );
  });

  // Test 7: The Latest Torrents section does not accidentally use Trending or release-date sorting
  it('the Latest Torrents section does not accidentally use Trending or release-date sorting', () => {
    // Movie released in 2026 with 9.0 rating, but torrent was uploaded earlier (Jan 2026)
    const olderUploadTheatrical2026 = createMockMovie({
      id: 601,
      title: 'Mock 2026 Theatrical with Early Upload',
      year: 2026,
      rating: 9.0, // Outstanding rating
      download_count: 100000, // Massive popularity
      date_uploaded_unix: 1767225600, // Jan 2026 upload
      torrents: [createMockTorrent({ date_uploaded_unix: 1767225600, seeds: 200 })],
    });

    // Movie released in 2024 with 6.5 rating, but torrent was uploaded recently (Oct 2026)
    const newerUploadTheatrical2024 = createMockMovie({
      id: 602,
      title: 'Mock 2024 Theatrical with Fresh Torrent Upload',
      year: 2024,
      rating: 6.5,
      download_count: 25000,
      date_uploaded_unix: 1791765380, // Oct 2026 upload
      torrents: [createMockTorrent({ date_uploaded_unix: 1791765380, seeds: 80 })],
    });

    const ranked = rankLatestTorrents([olderUploadTheatrical2026, newerUploadTheatrical2024]);

    assert.equal(
      ranked[0].id,
      newerUploadTheatrical2024.id,
      'Newer torrent upload must rank first; must NOT sort by release year or rating'
    );
  });

  // Test 8: Empty arrays, undefined, and corrupted objects are handled safely
  it('handles empty arrays, undefined, and corrupted objects safely', () => {
    assert.deepEqual(rankLatestTorrents([]), []);
    assert.deepEqual(rankLatestTorrents(null as unknown as Movie[]), []);
    assert.deepEqual(rankLatestTorrents(undefined as unknown as Movie[]), []);

    const mixed = [
      null,
      undefined,
      {} as unknown as Movie,
      { id: -99 } as unknown as Movie,
      createMockMovie({ id: 1234 }),
    ];

    const result = rankLatestTorrents(mixed);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 1234);
  });
});
