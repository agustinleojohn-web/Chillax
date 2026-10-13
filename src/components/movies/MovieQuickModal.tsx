import React, { useEffect } from 'react';
import { X, Play, Bookmark, BookmarkCheck, Star, Calendar, Clock, ExternalLink } from 'lucide-react';
import { Movie } from '../../types/movie';
import { DownloadOptions } from './DownloadOptions';
import { Button } from '../ui/Button';
import { useWatchlist } from '../../hooks/useWatchlist';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { personUrl } from '../../lib/site-browse';

interface MovieQuickModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export function MovieQuickModal({ movie, onClose }: MovieQuickModalProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Lock body scroll when modal is open to ensure clean mobile scrolling
  useEffect(() => {
    if (!movie) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [movie]);

  if (!movie) return null;

  const saved = isInWatchlist(movie.id);
  const movieSlug = movie.slug ? `${movie.id}-${movie.slug}` : `${movie.id}`;

  const handleWatchlist = () => {
    const isAdded = toggleWatchlist(movie);
    if (isAdded) {
      toast.success(`Saved "${movie.title}" to My List`);
    } else {
      toast.info(`Removed "${movie.title}" from My List`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${movie.title} Details Modal`}
    >
      <div
        className="relative w-full h-full sm:h-auto sm:max-h-[92vh] max-w-4xl bg-[#181818] sm:rounded-xl overflow-y-auto shadow-2xl border-0 sm:border border-[#2F2F2F] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky/Floating Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all touch-manipulation shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Header / Video / Backdrop */}
        <div className="relative aspect-video w-full bg-black shrink-0 overflow-hidden">
          {movie.yt_trailer_code ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${movie.yt_trailer_code}?autoplay=1&mute=0&rel=0`}
              title={`${movie.title} Trailer`}
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={movie.background_image_original || movie.background_image || movie.large_cover_image}
                alt={movie.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/40" />
              <div className="absolute bottom-4 left-4 sm:left-6 z-10">
                <h2 className="font-bebas text-3xl sm:text-5xl text-white uppercase tracking-wider drop-shadow-md">
                  {movie.title}
                </h2>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body Content (Scrollable on small screens) */}
        <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Quick Actions Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4 sm:pb-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <Link to={`/movie/${movieSlug}`} onClick={onClose} className="w-full sm:w-auto">
                <Button variant="white" size="md" className="w-full sm:w-auto">
                  <Play className="w-4 h-4 fill-current mr-2" />
                  Full Details &amp; Torrents
                </Button>
              </Link>

              <Button
                variant={saved ? 'secondary' : 'glass'}
                size="md"
                onClick={handleWatchlist}
                className="w-full sm:w-auto"
              >
                {saved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-2 text-[#E50914]" />
                    In My List
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Add to My List
                  </>
                )}
              </Button>
            </div>

            {movie.imdb_code && (
              <a
                href={`https://www.imdb.com/title/${movie.imdb_code}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#AAAAAA] hover:text-white flex items-center justify-center sm:justify-start gap-1 transition-colors py-1"
              >
                <span>IMDb #{movie.imdb_code}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Details & Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#AAAAAA]">
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1 font-bold text-white bg-[#222222] px-2 py-0.5 rounded border border-[#333333]">
                    <Star className="w-3.5 h-3.5 text-[#E50914] fill-[#E50914]" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-white font-medium">
                  <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                  <span>{movie.year}</span>
                </span>
                {movie.runtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#888888]" />
                    <span>{movie.runtime} min</span>
                  </span>
                )}
                {movie.mpa_rating && (
                  <span className="px-1.5 py-0.2 rounded border border-[#444444] text-[10px] font-mono text-white">
                    {movie.mpa_rating}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed">
                {movie.description_full || movie.summary || 'No extended synopsis available.'}
              </p>
            </div>

            <div className="space-y-3 text-xs text-[#AAAAAA] border-t md:border-t-0 md:border-l border-[#2A2A2A] md:pl-5 pt-3 md:pt-0">
              {movie.genres && movie.genres.length > 0 && (
                <div>
                  <span className="text-[#777777] block text-[11px] uppercase tracking-wider mb-1">
                    Genres:
                  </span>
                  <span className="text-white font-medium">{movie.genres.join(', ')}</span>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="text-[#777777] block text-[11px] uppercase tracking-wider mb-1">
                    Cast:
                  </span>
                  <span className="text-white">
                    {movie.cast.slice(0, 4).map((c, i) => (
                      <React.Fragment key={c.name + i}>
                        {i > 0 && ', '}
                        <Link
                          to={personUrl(c.name)}
                          onClick={onClose}
                          className="hover:text-[#E50914] hover:underline transition-colors"
                        >
                          {c.name}
                        </Link>
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[#777777] block text-[11px] uppercase tracking-wider mb-1">
                  Audio &amp; Language:
                </span>
                <span className="text-white uppercase font-mono">{movie.language || 'EN'}</span>
              </div>
            </div>
          </div>

          {/* Torrent Encodings */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Download Magnet &amp; Torrent Options
            </h3>
            <DownloadOptions movieTitle={movie.title} torrents={movie.torrents} />
          </div>
        </div>
      </div>
    </div>
  );
}