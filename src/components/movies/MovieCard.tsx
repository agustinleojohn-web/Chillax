import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, BookmarkCheck, Film } from 'lucide-react';
import { Movie, WatchlistMovie } from '../../types/movie';
import { useWatchlist } from '../../hooks/useWatchlist';
import { toast } from 'sonner';

interface MovieCardProps {
  movie: Movie | WatchlistMovie;
  priority?: boolean;
  onQuickView?: (movie: Movie) => void;
}

export function MovieCard({ movie, priority = false, onQuickView }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const saved = isInWatchlist(movie.id);

  // Normalize poster URL
  const posterUrl =
    'large_cover_image' in movie && (movie as Movie).large_cover_image
      ? (movie as Movie).large_cover_image
      : 'medium_cover_image' in movie && movie.medium_cover_image
      ? movie.medium_cover_image
      : '';

  const movieSlug = movie.slug ? `${movie.id}-${movie.slug}` : `${movie.id}`;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const movieObj: Movie = 'torrents' in movie
      ? (movie as Movie)
      : {
          id: movie.id,
          title: movie.title,
          title_english: movie.title,
          title_long: `${movie.title} (${movie.year})`,
          slug: movie.slug,
          year: movie.year,
          rating: movie.rating,
          runtime: (movie as WatchlistMovie).runtime || 0,
          genres: movie.genres || [],
          url: '',
          imdb_code: '',
          language: 'en',
          background_image: '',
          background_image_original: '',
          small_cover_image: '',
          medium_cover_image: movie.medium_cover_image || '',
          large_cover_image: '',
        };

    const isNowSaved = toggleWatchlist(movieObj);
    if (isNowSaved) {
      toast.success(`Saved "${movie.title}" to My List`);
    } else {
      toast.info(`Removed "${movie.title}" from My List`);
    }
  };

  return (
    <div className="group relative flex flex-col cursor-pointer select-none">
      <Link
        to={`/movie/${movieSlug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded-lg"
        aria-label={`View movie details for ${movie.title} (${movie.year})`}
      >
        {/* Netflix-style Poster Container */}
        <div className="relative aspect-[2/3] w-full rounded-lg bg-[#1E1E1E] overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-1 group-hover:ring-white/20">
          {!imgError && posterUrl ? (
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              loading={priority ? 'eager' : 'lazy'}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-[#1A1A1A] text-[#888888] text-center">
              <Film className="w-8 h-8 mb-2 text-[#444444]" />
              <span className="text-xs font-semibold text-white/90 line-clamp-2">{movie.title}</span>
            </div>
          )}

          {/* Scrim Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

          {/* Rating Badge Overlay */}
          {movie.rating > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/85 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-white border border-white/10 shadow-sm">
              <Star className="w-3 h-3 text-[#E50914] fill-[#E50914]" />
              <span className="tabular-nums">{movie.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Watchlist Quick Toggle Button */}
          <button
            type="button"
            onClick={handleWatchlistToggle}
            className={`absolute top-2 right-2 p-1.5 rounded-md border transition-all duration-150 focus-visible:outline-none ${
              saved
                ? 'bg-[#E50914] text-white border-[#E50914] opacity-100 shadow-md'
                : 'bg-black/75 hover:bg-black text-white/90 hover:text-white border-white/20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
            }`}
            title={saved ? 'Remove from My List' : 'Add to My List'}
            aria-label={saved ? `Remove ${movie.title} from My List` : `Add ${movie.title} to My List`}
          >
            {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Clean Movie Title & Metadata (Netflix Inspiration Style) */}
        <div className="pt-2 px-0.5 space-y-0.5">
          <h3 className="text-xs sm:text-sm font-semibold text-white/90 group-hover:text-[#E50914] transition-colors truncate">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-[#888888]">
            <span>{movie.year || ''}</span>
            {movie.genres && movie.genres.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[100px]">{movie.genres[0]}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
