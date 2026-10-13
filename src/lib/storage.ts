import { Movie, WatchlistMovie } from '../types/movie';

const WATCHLIST_STORAGE_KEY = 'chillax_watchlist_v1';

export function getStoredWatchlist(): WatchlistMovie[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.id === 'number' && typeof item.title === 'string'
    );
  } catch (err) {
    console.error('Failed to parse watchlist from storage:', err);
    return [];
  }
}

export function saveStoredWatchlist(movies: WatchlistMovie[]): void {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(movies));
    // Dispatch custom event for same-tab reactivity
    window.dispatchEvent(new Event('chillax_watchlist_updated'));
  } catch (err) {
    console.error('Failed to persist watchlist to storage:', err);
  }
}

export function movieToWatchlistItem(movie: Movie): WatchlistMovie {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    rating: movie.rating,
    medium_cover_image: movie.medium_cover_image || movie.small_cover_image,
    genres: movie.genres?.slice(0, 3) || [],
    slug: movie.slug || `${movie.id}-${movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    runtime: movie.runtime,
    addedAt: Date.now(),
  };
}
