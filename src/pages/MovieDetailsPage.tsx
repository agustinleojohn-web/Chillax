import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronRight,
  Shield,
  Film,
  ExternalLink,
  Users,
  Play,
} from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { DownloadOptions } from '../components/movies/DownloadOptions';
import { TrailerModal } from '../components/movies/TrailerModal';
import { MovieGrid } from '../components/movies/MovieGrid';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { useWatchlist } from '../hooks/useWatchlist';
import { useSeo } from '../lib/seo';
import { personUrl } from '../lib/site-browse';
import { toast } from 'sonner';

export function MovieDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Extract numeric movie ID or IMDb ID from slug
  const movieId = React.useMemo(() => {
    if (!slug) return null;
    if (slug.startsWith('tt')) return slug;
    const match = slug.match(/^(\d+)/);
    return match ? Number(match[1]) : slug;
  }, [slug]);

  const {
    data: movie,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: movieKeys.detail(movieId ?? ''),
    queryFn: ({ signal }) => {
      if (!movieId) throw new Error('Invalid movie identifier.');
      return movieApi.getMovieDetails(movieId, { with_images: true, with_cast: true }, signal);
    },
    enabled: Boolean(movieId),
  });

  // The API doesn't return directors, so they come from the website's movie page (best effort).
  const { data: people } = useQuery({
    queryKey: movieKeys.people(movie?.slug ?? ''),
    queryFn: ({ signal }) => movieApi.getMoviePeople(movie!.slug, signal),
    enabled: Boolean(movie?.slug),
    staleTime: 1000 * 60 * 60,
  });
  const directors = people?.directors ?? [];

  const { data: suggestions = [] } = useQuery({
    queryKey: movieKeys.suggestions(typeof movieId === 'number' ? movieId : movie?.id || 0),
    queryFn: ({ signal }) => movieApi.getMovieSuggestions(movie?.id || (movieId as number), signal),
    enabled: Boolean(movie?.id || typeof movieId === 'number'),
  });

  const { data: parentalGuides = [] } = useQuery({
    queryKey: movieKeys.parentalGuides(typeof movieId === 'number' ? movieId : movie?.id || 0),
    queryFn: ({ signal }) => movieApi.getMovieParentalGuides(movie?.id || (movieId as number), signal),
    enabled: Boolean(movie?.id || typeof movieId === 'number'),
  });

  useSeo({
    title: movie ? `${movie.title} (${movie.year})` : 'Movie Details',
    description: movie?.description_full || movie?.summary || 'View movie specifications, cast, and download options on Chillax.',
    ogImage: movie?.large_cover_image || movie?.medium_cover_image,
  });

  const isSaved = movie ? isInWatchlist(movie.id) : false;

  const handleWatchlist = () => {
    if (!movie) return;
    const added = toggleWatchlist(movie);
    if (added) {
      toast.success(`Saved "${movie.title}" to My List`);
    } else {
      toast.info(`Removed "${movie.title}" from My List`);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        toast.success('Movie link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      toast.error('Could not copy link to clipboard.');
    }
  };

  const formatRuntime = (mins: number) => {
    if (!mins || mins <= 0) return 'N/A';
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return hours > 0 ? `${hours}h ${m}m` : `${m}m`;
  };

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <ErrorState
          title="Movie Unavailable"
          message={error instanceof Error ? error.message : 'Unable to find or load the requested movie details.'}
          onRetry={() => refetch()}
        />
        <div className="text-center mt-4">
          <Link to="/movies">
            <Button variant="secondary" size="md">
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !movie) {
    return (
      <div className="space-y-8 animate-pulse pb-12">
        <Skeleton className="w-full h-80 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const screenshots = [
    movie.large_screenshot_image1 || movie.medium_screenshot_image1,
    movie.large_screenshot_image2 || movie.medium_screenshot_image2,
    movie.large_screenshot_image3 || movie.medium_screenshot_image3,
  ].filter(Boolean) as string[];

  // With a trailer, the first screenshot becomes its thumbnail and the rest follow as normal images.
  const galleryItems: { kind: 'trailer' | 'image'; src?: string }[] = movie.yt_trailer_code
    ? [
        {
          kind: 'trailer',
          src: screenshots[0] || movie.background_image_original || movie.background_image || movie.large_cover_image,
        },
        ...screenshots.slice(1).map((src) => ({ kind: 'image' as const, src })),
      ]
    : screenshots.map((src) => ({ kind: 'image' as const, src }));

  return (
    <div className="space-y-12 pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-[#888888]">
        <Link to="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/movies" className="hover:text-white transition-colors">
          Movies
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-medium truncate max-w-xs">{movie.title}</span>
      </nav>

      {/* Hero Media Container with Netflix Backdrop */}
      <div className="relative rounded-xl overflow-hidden border border-[#262626] bg-[#181818] shadow-2xl">
        {/* Backdrop Scrim */}
        <div className="absolute inset-0">
          {movie.background_image_original || movie.background_image ? (
            <img
              src={movie.background_image_original || movie.background_image}
              alt=""
              className="w-full h-full object-cover object-top opacity-30 filter blur-xs"
              referrerPolicy="no-referrer"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/85 to-black/40" />
        </div>

        {/* Content Details Split */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Poster Column */}
          <div className="md:col-span-4 lg:col-span-3 space-y-3">
            <div className="aspect-[2/3] w-full rounded-lg bg-[#1E1E1E] border border-[#333333] overflow-hidden shadow-2xl">
              <img
                src={movie.large_cover_image || movie.medium_cover_image}
                alt={`${movie.title} poster`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Quick Action Buttons Under Poster */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant={isSaved ? 'secondary' : 'primary'}
                size="md"
                onClick={handleWatchlist}
                className="w-full"
              >
                {isSaved ? (
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

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="w-full text-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-[#22C55E]" />
                    Link Copied
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Share Title
                  </>
                )}
              </Button>

              {movie.imdb_code && (
                <a
                  href={`https://www.imdb.com/title/${movie.imdb_code}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded-lg bg-transparent text-[#AAAAAA] hover:text-white hover:bg-[#242424] border border-[#333333] text-xs px-2.5 py-1.5 h-8 gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View on IMDb
                </a>
              )}
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-[#E50914] rounded-xs inline-block" />
                <span className="text-[11px] uppercase font-bold text-[#E50914] tracking-wider">
                  CINEMA ARCHIVE
                </span>
              </div>

              <h1 className="font-bebas text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide uppercase leading-tight">
                {movie.title}
              </h1>

              {/* Specs & Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#AAAAAA]">
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1 font-bold text-white bg-[#222222] px-2.5 py-1 rounded-md border border-[#333333]">
                    <Star className="w-3.5 h-3.5 text-[#E50914] fill-[#E50914]" />
                    <span className="tabular-nums">{movie.rating.toFixed(1)} / 10</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-white">
                  <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                  <span>{movie.year}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#888888]" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </span>
                {movie.language && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase font-mono text-xs">{movie.language}</span>
                  </>
                )}
                {movie.mpa_rating && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="px-1.5 py-0.5 rounded border border-[#444444] text-[10px] font-mono text-white">
                      {movie.mpa_rating}
                    </span>
                  </>
                )}
              </div>

              {/* Genre Links */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {movie.genres.map((g) => (
                    <Link
                      key={g}
                      to={`/genres/${g.toLowerCase()}`}
                      className="px-2.5 py-1 rounded-md bg-[#242424] hover:bg-[#2E2E2E] hover:text-[#E50914] border border-[#333333] text-xs font-semibold text-white transition-colors"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#888888]">
                Synopsis
              </h2>
              <p className="text-sm sm:text-base text-[#D4D4D4] leading-relaxed">
                {movie.description_full || movie.summary || movie.description_intro || 'No extended synopsis has been recorded for this film.'}
              </p>
            </div>

            {/* Download Options Section */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Download</span>
              </h2>
              <DownloadOptions movieTitle={movie.title} torrents={movie.torrents} />
            </div>
          </div>
        </div>
      </div>

      {/* Directors */}
      {directors.length > 0 && (
        <section className="space-y-3">
          <div className="border-b border-[#262626] pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E50914]" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              {directors.length > 1 ? 'Directors' : 'Director'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {directors.map((name) => (
              <Link
                key={name}
                to={personUrl(name)}
                className="px-3 py-1.5 rounded-full bg-[#181818] border border-[#262626] text-sm text-white hover:border-[#E50914] hover:text-[#E50914] transition-colors"
              >
                {name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cast & Crew Section */}
      {movie.cast && movie.cast.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-[#262626] pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E50914]" />
            <h2 className="text-xl font-bold tracking-tight text-white">Top Cast</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {movie.cast.map((actor, idx) => (
              <Link
                key={actor.name + idx}
                to={personUrl(actor.name)}
                title={`See all movies with ${actor.name}`}
                className="p-3 rounded-lg bg-[#181818] border border-[#262626] flex flex-col items-center text-center space-y-2 hover:border-[#E50914] transition-colors"
              >
                {actor.url_small_image ? (
                  <img
                    src={actor.url_small_image}
                    alt={actor.name}
                    className="w-16 h-16 rounded-full object-cover border border-[#333333]"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#242424] border border-[#333333] flex items-center justify-center text-xs font-mono text-[#888888]">
                    {actor.name.charAt(0)}
                  </div>
                )}
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-white line-clamp-1">{actor.name}</h4>
                  <p className="text-[11px] text-[#888888] line-clamp-1">{actor.character_name || 'Actor'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Media Gallery: the trailer is the first item, using a screenshot as its thumbnail */}
      {galleryItems.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-[#262626] pb-3">
            <h2 className="text-xl font-bold tracking-tight text-white">Media Gallery</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {galleryItems.map((item, idx) =>
              item.kind === 'trailer' ? (
                <button
                  key="trailer"
                  type="button"
                  onClick={() => setShowTrailer(true)}
                  aria-label={`Play ${movie.title} trailer`}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-[#262626] bg-[#181818] hover:border-[#E50914]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]"
                >
                  {item.src && (
                    <img
                      src={item.src}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors" />
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-black/40 group-hover:bg-[#E50914] group-hover:border-[#E50914] transition-colors">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </span>
                    <span className="text-sm font-semibold drop-shadow">Trailer</span>
                  </span>
                </button>
              ) : (
                <div
                  key={item.src}
                  className="aspect-video rounded-lg overflow-hidden border border-[#262626] bg-[#181818] hover:border-[#E50914]/50 transition-colors"
                >
                  <img
                    src={item.src}
                    alt={`${movie.title} screenshot ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )
            )}
          </div>
        </section>
      )}

      {showTrailer && movie.yt_trailer_code && (
        <TrailerModal youtubeCode={movie.yt_trailer_code} title={movie.title} onClose={() => setShowTrailer(false)} />
      )}

      {/* Parental Guides if available */}
      {parentalGuides.length > 0 && (
        <section className="space-y-3 p-5 rounded-lg bg-[#181818] border border-[#262626]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Shield className="w-4 h-4 text-[#E50914]" />
            <span>Parental Advisory &amp; Content Guides</span>
          </div>
          <div className="space-y-2 text-xs text-[#AAAAAA]">
            {parentalGuides.map((guide, idx) => (
              <div key={idx} className="p-3 rounded-md bg-[#202020] border border-[#2F2F2F]">
                <strong className="text-white uppercase block mb-1">{guide.type}</strong>
                <p>{guide.parental_guide_text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested / Related Movies */}
      {suggestions.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-[#262626] pb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">More Like This</h2>
            <Link to="/movies" className="text-xs text-[#E50914] hover:underline font-semibold">
              Browse More
            </Link>
          </div>
          <MovieGrid movies={suggestions} />
        </section>
      )}
    </div>
  );
}