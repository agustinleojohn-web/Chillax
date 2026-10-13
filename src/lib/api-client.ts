import { API_BASE_URL } from './constants';
import {
  ApiResponse,
  ListMoviesData,
  ListMoviesParams,
  MovieDetailsData,
  MovieSuggestionsData,
  ParentalGuidesData,
} from '../types/api';
import { Movie } from '../types/movie';
import {
  BrowsePage,
  MoviePeople,
  SITE_PROXY_PREFIX,
  buildBrowsePath,
  looksLikeSpaShell,
  mapWithConcurrency,
  parseBrowseHtml,
  parseMoviePeople,
  slugToSearchText,
} from './site-browse';
import { parseFilters } from './movie-filters';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Normalizes movie data ensuring consistent arrays and fallback types
 */
export function normalizeMovie(raw: Movie): Movie {
  return {
    ...raw,
    genres: Array.isArray(raw.genres) ? raw.genres : [],
    torrents: Array.isArray(raw.torrents) ? raw.torrents : [],
    cast: Array.isArray(raw.cast) ? raw.cast : [],
    rating: typeof raw.rating === 'number' ? raw.rating : 0,
    year: typeof raw.year === 'number' ? raw.year : 0,
    runtime: typeof raw.runtime === 'number' ? raw.runtime : 0,
  };
}

async function request<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, signal?: AbortSignal): Promise<T> {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.set(key, String(val));
      }
    });
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError('Unable to connect to the movie catalog service. Please check your network connection.');
  }

  if (!res.ok) {
    throw new ApiError(`Movie catalog request failed (${res.status} ${res.statusText})`, res.status);
  }

  let json: ApiResponse<T>;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('Malformed response received from movie catalog server.');
  }

  if (json.status !== 'ok') {
    throw new ApiError(json.status_message || 'Movie catalog query returned an error.', res.status, json);
  }

  return json.data;
}

/** Slug lookups are stable, so remember them across pages and filter changes. */
const slugCache = new Map<string, Movie>();

export const movieApi = {
  /**
   * List movies with filters, pagination, and sorting
   */
  async listMovies(params: ListMoviesParams = {}, signal?: AbortSignal): Promise<ListMoviesData> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      limit: params.limit ?? 20,
      page: params.page ?? 1,
      quality: params.quality && params.quality !== 'all' ? params.quality : undefined,
      minimum_rating: params.minimum_rating && params.minimum_rating > 0 ? params.minimum_rating : undefined,
      query_term: params.query_term ? params.query_term.trim() : undefined,
      genre: params.genre && params.genre !== 'All' ? params.genre.toLowerCase() : undefined,
      sort_by: params.sort_by ?? 'date_added',
      order_by: params.order_by ?? 'desc',
      with_rt_ratings: params.with_rt_ratings ?? true,
    };

    const data = await request<ListMoviesData>('list_movies.json', queryParams, signal);
    return {
      ...data,
      movies: (data.movies || []).map(normalizeMovie),
    };
  },

  /**
   * Quick search used by the navbar and the Search page. The API only matches titles (and IMDb
   * codes), so when it finds nothing the same text is searched on the website, which also matches
   * actor and director names. Site failures degrade to the API's (empty) answer.
   */
  async searchMovies(
    params: ListMoviesParams & { query_term: string },
    signal?: AbortSignal
  ): Promise<ListMoviesData> {
    const res = await movieApi.listMovies(params, signal);
    const term = params.query_term.trim();
    if (res.movie_count > 0 || !term) return res;

    try {
      const filters = parseFilters(new URLSearchParams({ q: term }));
      const httpRes = await fetch(`${SITE_PROXY_PREFIX}${buildBrowsePath(filters, params.page ?? 1)}`, { signal });
      if (!httpRes.ok) return res;
      const html = await httpRes.text();
      if (looksLikeSpaShell(html)) return res;

      const page: BrowsePage = parseBrowseHtml(html);
      const entries = page.entries.slice(0, params.limit ?? 20);
      const resolved = await mapWithConcurrency(entries, 5, (e) => movieApi.findMovieBySlug(e.slug, e.title, signal));
      const movies = resolved.filter((m): m is Movie => m !== null);
      return { movie_count: movies.length, limit: params.limit ?? 20, page_number: params.page ?? 1, movies };
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err;
      return res;
    }
  },

  /**
   * Finds a movie's full record from its website slug. The API can't look up by slug, so it is
   * searched by the card title (exact, then slug words) and the result matched on `slug`.
   */
  async findMovieBySlug(slug: string, titleHint?: string, signal?: AbortSignal): Promise<Movie | null> {
    const cached = slugCache.get(slug);
    if (cached) return cached;
    const queries = [...new Set([titleHint, slugToSearchText(slug)].filter((q): q is string => Boolean(q)))];
    for (const query_term of queries) {
      try {
        const res = await movieApi.listMovies({ query_term, limit: 50, with_rt_ratings: false }, signal);
        const hit = (res.movies ?? []).find((m) => m.slug === slug);
        if (hit) {
          slugCache.set(slug, hit);
          return hit;
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') throw err;
        // try next query
      }
    }
    return null;
  },

  /**
   * Get detailed movie information including cast and images
   */
  async getMovieDetails(
    idOrImdb: number | string,
    options: { with_images?: boolean; with_cast?: boolean } = { with_images: true, with_cast: true },
    signal?: AbortSignal
  ): Promise<Movie> {
    const isImdb = typeof idOrImdb === 'string' && idOrImdb.startsWith('tt');
    const params: Record<string, string | number | boolean | undefined> = {
      with_images: options.with_images ?? true,
      with_cast: options.with_cast ?? true,
    };

    if (isImdb) {
      params.imdb_id = idOrImdb;
    } else {
      params.movie_id = idOrImdb;
    }

    const data = await request<MovieDetailsData>('movie_details.json', params, signal);
    if (!data?.movie) {
      throw new ApiError('Requested movie details were not found.', 404);
    }
    return normalizeMovie(data.movie);
  },

  /**
   * Directors and cast names for a movie, read from the website's movie page (the API has no
   * directors). Best effort: returns empty lists if the page can't be loaded.
   */
  async getMoviePeople(slug: string, signal?: AbortSignal): Promise<MoviePeople> {
    try {
      const res = await fetch(`${SITE_PROXY_PREFIX}/movies/${encodeURIComponent(slug)}`, { signal });
      if (!res.ok) return { directors: [], cast: [] };
      const html = await res.text();
      if (looksLikeSpaShell(html)) return { directors: [], cast: [] };
      return parseMoviePeople(html);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err;
      return { directors: [], cast: [] };
    }
  },

  /**
   * Get related movie recommendations
   */
  async getMovieSuggestions(movieId: number, signal?: AbortSignal): Promise<Movie[]> {
    try {
      const data = await request<MovieSuggestionsData>('movie_suggestions.json', { movie_id: movieId }, signal);
      return (data.movies || []).map(normalizeMovie);
    } catch {
      // Fallback empty if suggestions endpoint fails or has no entries
      return [];
    }
  },

  /**
   * Get parental guides / content ratings
   */
  async getMovieParentalGuides(movieId: number, signal?: AbortSignal) {
    try {
      const data = await request<ParentalGuidesData>('movie_parental_guides.json', { movie_id: movieId }, signal);
      return data.parental_guides || [];
    } catch {
      return [];
    }
  },
};