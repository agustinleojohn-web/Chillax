import { useState, useEffect, useCallback } from 'react';
import { Movie, WatchlistMovie } from '../types/movie';
import { getStoredWatchlist, saveStoredWatchlist, movieToWatchlistItem } from '../lib/storage';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>(() => getStoredWatchlist());

  const sync = useCallback(() => {
    setWatchlist(getStoredWatchlist());
  }, []);

  useEffect(() => {
    // Listen to changes from other windows/tabs and current window
    window.addEventListener('storage', sync);
    window.addEventListener('chillax_watchlist_updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('chillax_watchlist_updated', sync);
    };
  }, [sync]);

  const isInWatchlist = useCallback(
    (movieId: number): boolean => {
      return watchlist.some((item) => item.id === movieId);
    },
    [watchlist]
  );

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.some((item) => item.id === movie.id)) return prev;
      const updated = [movieToWatchlistItem(movie), ...prev];
      saveStoredWatchlist(updated);
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((movieId: number) => {
    setWatchlist((prev) => {
      const updated = prev.filter((item) => item.id !== movieId);
      saveStoredWatchlist(updated);
      return updated;
    });
  }, []);

  const toggleWatchlist = useCallback(
    (movie: Movie) => {
      if (isInWatchlist(movie.id)) {
        removeFromWatchlist(movie.id);
        return false;
      } else {
        addToWatchlist(movie);
        return true;
      }
    },
    [isInWatchlist, removeFromWatchlist, addToWatchlist]
  );

  return {
    watchlist,
    count: watchlist.length,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  };
}
