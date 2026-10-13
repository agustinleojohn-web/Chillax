import { Movie } from '../types/movie';
import { GENRES, LANGUAGE_OPTIONS, QUALITIES, SORT_OPTIONS, YEAR_OPTIONS } from './constants';

export type SortBy = 'date_added' | 'year' | 'download_count' | 'rating' | 'seeds' | 'peers' | 'like_count' | 'title';
export type OrderBy = 'desc' | 'asc';

export interface FilterState {
  query_term: string;
  quality: string;
  genre: string;
  minimum_rating: number;
  year: string;
  language: string;
  sort_by: SortBy;
  order_by: OrderBy;
}

export const DEFAULT_SORT: SortBy = 'date_added';

/** Page size shown to the user. */
export const ITEMS_PER_PAGE = 20;
/** Page size used when scanning the catalog for client-side filters. */
export const SCAN_PAGE_SIZE = 50;
/** Hard cap on API pages scanned for client-side filters (cap * SCAN_PAGE_SIZE titles). */
export const MAX_SCAN_PAGES = 8;

/** Natural direction for each sort: A-Z for titles, biggest/newest first for everything else. */
export function defaultOrderFor(sortBy: SortBy): OrderBy {
  return sortBy === 'title' ? 'asc' : 'desc';
}

const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((s) => s.value));
const QUALITY_VALUES = new Set<string>(QUALITIES);
const GENRE_VALUES = new Set<string>(GENRES);
const YEAR_VALUES = new Set<string>(YEAR_OPTIONS.map((y) => y.value));
const LANGUAGE_VALUES = new Set<string>(LANGUAGE_OPTIONS.map((l) => l.value));

function parsePositiveInt(raw: string | null, fallback: number): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : fallback;
}

/**
 * Reads filter state from URL params, discarding unknown / malformed values
 * so a hand-edited URL can never produce NaN or an invalid API request.
 */
export function parseFilters(params: URLSearchParams): FilterState {
  const rawSort = params.get('sort_by');
  const sort_by = (rawSort && SORT_VALUES.has(rawSort) ? rawSort : DEFAULT_SORT) as SortBy;

  const rawOrder = params.get('order_by');
  const order_by: OrderBy = rawOrder === 'asc' || rawOrder === 'desc' ? rawOrder : defaultOrderFor(sort_by);

  const rating = Number(params.get('rating') || '0');
  const rawQuality = params.get('quality');
  const rawGenre = params.get('genre');
  const rawYear = params.get('year');
  const rawLanguage = (params.get('language') || 'all').toLowerCase();
  const language = LANGUAGE_VALUES.has(rawLanguage) ? rawLanguage : 'all';

  return {
    query_term: params.get('q') || '',
    quality: rawQuality && QUALITY_VALUES.has(rawQuality) ? rawQuality : 'all',
    genre: rawGenre && GENRE_VALUES.has(rawGenre) ? rawGenre : 'All',
    minimum_rating: Number.isFinite(rating) && rating > 0 && rating <= 10 ? rating : 0,
    year: rawYear && YEAR_VALUES.has(rawYear) ? rawYear : 'all',
    language,
    sort_by,
    order_by,
  };
}

export function parsePage(params: URLSearchParams): number {
  return parsePositiveInt(params.get('page'), 1);
}

/** True when any filter (including non-default sort) differs from the pristine state. */
export function isFiltered(f: FilterState): boolean {
  return (
    Boolean(f.query_term) ||
    f.quality !== 'all' ||
    f.genre !== 'All' ||
    f.minimum_rating > 0 ||
    f.year !== 'all' ||
    f.language !== 'all' ||
    f.sort_by !== DEFAULT_SORT ||
    f.order_by !== defaultOrderFor(f.sort_by)
  );
}

/**
 * Year and language are not supported by the API. They are answered by the website's own
 * listing (see site-browse.ts), with a capped local scan of API pages as the fallback.
 */
export function needsClientFilter(f: Pick<FilterState, 'year' | 'language'>): boolean {
  return f.year !== 'all' || f.language !== 'all';
}

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

const LANGUAGE_ALIASES: Record<string, string> = {
  eng: 'en',
  english: 'en',
  fil: 'tl',
  tagalog: 'tl',
  filipino: 'tl',
  mandarin: 'zh',
  chinese: 'zh',
  cantonese: 'cn',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  japanese: 'ja',
  korean: 'ko',
  hindi: 'hi',
  italian: 'it',
  russian: 'ru',
  portuguese: 'pt',
};

export function normalizeLanguage(raw: string | undefined | null): string {
  const v = (raw || '').trim().toLowerCase();
  return LANGUAGE_ALIASES[v] ?? v;
}

export function matchesLanguage(movie: Pick<Movie, 'language'>, language: string): boolean {
  if (language === 'all') return true;
  const actual = normalizeLanguage(movie.language);
  if (language === 'foreign') return actual !== '' && actual !== 'en';
  return actual === normalizeLanguage(language);
}

// ---------------------------------------------------------------------------
// Year
// ---------------------------------------------------------------------------

/** "2024" -> [2024, 2024]; "2015-2018" -> [2015, 2018]; "all"/invalid -> null. */
export function parseYearRange(year: string): [number, number] | null {
  if (year === 'all') return null;
  const parts = year.split('-').map(Number);
  if (parts.some((n) => !Number.isInteger(n))) return null;
  if (parts.length === 1) return [parts[0], parts[0]];
  if (parts.length === 2) return [Math.min(parts[0], parts[1]), Math.max(parts[0], parts[1])];
  return null;
}

export function matchesYear(movie: Pick<Movie, 'year'>, year: string): boolean {
  const range = parseYearRange(year);
  if (!range) return true;
  return movie.year >= range[0] && movie.year <= range[1];
}

export function applyClientFilters(movies: Movie[], f: Pick<FilterState, 'year' | 'language'>): Movie[] {
  return movies.filter((m) => matchesYear(m, f.year) && matchesLanguage(m, f.language));
}

/** Removes duplicates (same id) while preserving first-seen order. Pages can overlap if the catalog shifts mid-scan. */
export function dedupeById(movies: Movie[]): Movie[] {
  const seen = new Set<number>();
  return movies.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
}

export function paginate<T>(items: T[], page: number, perPage: number = ITEMS_PER_PAGE): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function totalPagesFor(total: number, perPage: number = ITEMS_PER_PAGE): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/** Inverse of parseFilters: URL params for a filter state, omitting every default value. */
export function serializeFilters(f: FilterState, page = 1): URLSearchParams {
  const p = new URLSearchParams();
  if (f.query_term.trim()) p.set('q', f.query_term.trim());
  if (f.quality !== 'all') p.set('quality', f.quality);
  if (f.genre !== 'All') p.set('genre', f.genre);
  if (f.minimum_rating > 0) p.set('rating', String(f.minimum_rating));
  if (f.year !== 'all') p.set('year', f.year);
  if (f.language !== 'all') p.set('language', f.language);
  if (f.sort_by !== DEFAULT_SORT) p.set('sort_by', f.sort_by);
  if (f.order_by !== defaultOrderFor(f.sort_by)) p.set('order_by', f.order_by);
  p.set('page', String(page));
  return p;
}

/** Same filters (ignoring page)? Used to tell whether the form has un-applied edits. */
export function sameFilters(a: FilterState, b: FilterState): boolean {
  return serializeFilters(a).toString() === serializeFilters(b).toString();
}