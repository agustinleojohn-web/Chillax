import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { MovieGrid } from '../components/movies/MovieGrid';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { saveStoredWatchlist } from '../lib/storage';
import { useSeo } from '../lib/seo';
import { toast } from 'sonner';

export function WatchlistPage() {
  useSeo({
    title: 'My List — Watchlist',
    description: 'Your privately saved movies and torrent bookmarks on Chillax.',
    noindex: true,
  });

  const { watchlist, count } = useWatchlist();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const handleClearAll = () => {
    saveStoredWatchlist([]);
    setShowConfirmClear(false);
    toast.info('My List cleared');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-[#262626] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#E50914] mb-1">
            <Bookmark className="w-5 h-5 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wider">Saved Titles</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-4xl font-normal uppercase tracking-wide text-white">
            My List
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Your saved movies, trailers, and verified torrent downloads.
          </p>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#888888]">
              <strong className="text-[#E50914] font-bold">{count}</strong> titles saved
            </span>
            {showConfirmClear ? (
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={handleClearAll}>
                  Confirm Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowConfirmClear(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmClear(true)}
                className="text-xs text-[#E50914] hover:text-[#E50914]"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>

      {count === 0 ? (
        <EmptyState
          type="watchlist"
          title="Your List is Empty"
          description="Explore the catalog and bookmark movies to save them to your personal queue for fast torrent handoffs."
          actionText="Browse Movies Now"
          onAction={() => (window.location.href = '/movies')}
        />
      ) : (
        <div className="space-y-4">
          <MovieGrid movies={watchlist} />

          <div className="pt-6 border-t border-[#262626] flex items-center justify-between text-xs text-[#888888]">
            <span>My List entries are saved locally to your device.</span>
            <Link
              to="/movies"
              className="text-[#E50914] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Explore more titles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
