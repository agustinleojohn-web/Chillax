import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Play, Info, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Zap, Film } from 'lucide-react';
import { movieApi } from '../lib/api-client';
import { movieKeys } from '../lib/query-client';
import { useRankedLatestTorrents } from '../hooks/useRankedLatestTorrents';
import { MovieRow } from '../components/movies/MovieRow';
import { Button } from '../components/ui/Button';
import { MovieQuickModal } from '../components/movies/MovieQuickModal';
import { Movie } from '../types/movie';
import { GENRES } from '../lib/constants';
import { useSeo } from '../lib/seo';

export function HomePage() {
  useSeo({
    title: 'Chillax — Stream Cinema & Verified Torrent Catalog',
    description: 'Explore popular downloads, latest cinema torrents, and upcoming releases on Chillax.',
  });

  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Touch & Drag Tracking for mobile / tablet swiping
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const mouseStartX = useRef<number | null>(null);
  const minSwipeDistance = 45;

  // 1. Hero Query: Latest popular movies (prioritizing 2026/2025/2024 most awaited blockbusters & famous stars)
  const { data: heroData2026 } = useQuery({
    queryKey: movieKeys.list({ query_term: '2026', sort_by: 'download_count', limit: 6 }),
    queryFn: ({ signal }) => movieApi.listMovies({ query_term: '2026', sort_by: 'download_count', limit: 6 }, signal),
  });

  const { data: heroData2025 } = useQuery({
    queryKey: movieKeys.list({ query_term: '2025', sort_by: 'download_count', limit: 6 }),
    queryFn: ({ signal }) => movieApi.listMovies({ query_term: '2025', sort_by: 'download_count', limit: 6 }, signal),
  });

  const { data: heroData2024 } = useQuery({
    queryKey: movieKeys.list({ query_term: '2024', sort_by: 'download_count', limit: 6 }),
    queryFn: ({ signal }) => movieApi.listMovies({ query_term: '2024', sort_by: 'download_count', limit: 6 }, signal),
  });

  // GROUP 1: Popular Chillax Downloads
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: movieKeys.list({ sort_by: 'download_count', limit: 18 }),
    queryFn: ({ signal }) => movieApi.listMovies({ sort_by: 'download_count', limit: 18 }, signal),
  });

  // GROUP 2: Latest Chillax Movies Torrents (ranked using verified recency, popularity, rating & swarm signals)
  const { data: rankedLatestMovies = [], isLoading: latestLoading } = useRankedLatestTorrents();

  // GROUP 3: Upcoming Chillax Movies
  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: movieKeys.list({ sort_by: 'year', order_by: 'desc', limit: 18 }),
    queryFn: ({ signal }) => movieApi.listMovies({ sort_by: 'year', order_by: 'desc', limit: 18 }, signal),
  });

  // Hero Slider items: Prioritizes latest movies ordered by year and popularity with famous actors
  const heroMovies = useMemo<Movie[]>(() => {
    const pool = [
      ...(heroData2026?.movies || []),
      ...(heroData2025?.movies || []),
      ...(heroData2024?.movies || []),
      ...(popularData?.movies || []),
    ];

    const seen = new Set<number>();
    const filtered: Movie[] = [];
    for (const m of pool) {
      if (m && m.year >= 2024 && !seen.has(m.id)) {
        seen.add(m.id);
        filtered.push(m);
      }
    }

    // Sort strictly by latest year first, then by rating & popularity
    filtered.sort((a, b) => b.year - a.year || b.rating - a.rating);

    if (filtered.length >= 5) {
      return filtered.slice(0, 6);
    }
    return (rankedLatestMovies || []).slice(0, 6);
  }, [heroData2026, heroData2025, heroData2024, popularData, rankedLatestMovies]);

  // Group 1: Popular Chillax Downloads - sorted by latest year first then popular actors
  const popularMovies = useMemo(() => {
    const pool = [
      ...(heroData2026?.movies || []),
      ...(heroData2025?.movies || []),
      ...(heroData2024?.movies || []),
      ...(popularData?.movies || []),
    ];
    const seen = new Set<number>();
    const list: Movie[] = [];
    for (const m of pool) {
      if (m && !seen.has(m.id)) {
        seen.add(m.id);
        list.push(m);
      }
    }
    list.sort((a, b) => b.year - a.year || b.rating - a.rating || (b.download_count ?? 0) - (a.download_count ?? 0));
    return list;
  }, [heroData2026, heroData2025, heroData2024, popularData]);

  // Group 3: Upcoming Chillax Movies - sorted by latest year first
  const upcomingMovies = useMemo(() => {
    const list = [...(upcomingData?.movies || [])];
    list.sort((a, b) => b.year - a.year || b.rating - a.rating);
    return list;
  }, [upcomingData]);

  const slideCount = heroMovies.length || 1;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Touch Swipe Handlers (Mobile / Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > minSwipeDistance) {
        nextSlide();
      } else if (distance < -minSwipeDistance) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setIsPaused(false);
  };

  // Mouse Drag Handlers (Desktop / Pointer)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    mouseStartX.current = e.clientX;
    setIsPaused(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging.current && mouseStartX.current !== null) {
      const distance = mouseStartX.current - e.clientX;
      if (distance > minSwipeDistance) {
        nextSlide();
      } else if (distance < -minSwipeDistance) {
        prevSlide();
      }
    }
    isDragging.current = false;
    mouseStartX.current = null;
    setIsPaused(false);
  };

  // Auto-advance hero slider every 6.5s when not paused
  useEffect(() => {
    if (isPaused || slideCount <= 1) return;
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, [isPaused, slideCount, nextSlide]);

  const currentMovie = heroMovies[activeSlide];
  const currentSlug = currentMovie ? `${currentMovie.id}-${currentMovie.slug}` : '';

  return (
    <div className="space-y-10 sm:space-y-14 pb-20 overflow-x-hidden">
      {/* Hero Section: Mobile-First Responsive Slider with Bebas Neue Typography & Drag/Swipe */}
      {currentMovie ? (
        <section
          className="relative w-full min-h-[480px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[700px] flex items-end overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-14 select-none cursor-grab active:cursor-grabbing touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            isDragging.current = false;
          }}
        >
          {/* Backdrop Cross-Fade Carousel for all 5+ latest popular movies */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {heroMovies.map((movie, index) => {
              const bgImg = movie.background_image_original || movie.background_image || movie.large_cover_image;
              const isActive = index === activeSlide;

              return (
                <div
                  key={movie.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-1' : 'opacity-0 z-0'
                  }`}
                >
                  {bgImg ? (
                    <img
                      src={bgImg}
                      alt={movie.title}
                      className="w-full h-full object-cover object-center filter brightness-90 sm:brightness-85 transform scale-100 sm:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#181818]" />
                  )}
                </div>
              );
            })}

            {/* Gradient Scrims: Mobile-Optimized Vignette */}
            <div className="absolute inset-0 z-2 bg-gradient-to-r from-[#141414] via-[#141414]/85 sm:via-[#141414]/70 to-transparent w-full md:w-3/4" />
            <div className="absolute inset-x-0 top-0 z-2 bg-gradient-to-b from-[#141414]/90 via-[#141414]/50 to-transparent h-28" />
            <div className="absolute inset-x-0 bottom-0 z-2 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent h-48 sm:h-56" />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-end">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              {/* Tag Line: [MOVIE] 2026 ★ 8.2 */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium">
                <span className="bg-[#E50914] text-white font-bold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-sm tracking-wider uppercase shadow-sm">
                  LATEST BLOCKBUSTER
                </span>
                <span className="text-white/95 font-bold tabular-nums">{currentMovie.year}</span>
                {currentMovie.rating > 0 && (
                  <span className="flex items-center gap-1 font-bold text-white/95">
                    <Star className="w-3.5 h-3.5 text-[#E50914] fill-[#E50914]" />
                    <span>{currentMovie.rating.toFixed(1)}</span>
                  </span>
                )}
                {currentMovie.genres && currentMovie.genres.length > 0 && (
                  <span className="hidden sm:inline text-white/75 text-xs">
                    · {currentMovie.genres.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>

              {/* Title in BEBAS NEUE */}
              <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-wide uppercase leading-[0.92] drop-shadow-lg line-clamp-2">
                {currentMovie.title}
              </h1>

              {/* Synopsis: Clean & mobile friendly */}
              <p className="text-white/85 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow-sm font-normal max-w-xl">
                {currentMovie.summary ||
                  currentMovie.description_full ||
                  'Experience this acclaimed blockbuster release available with verified BitTorrent magnet links and high-definition formats.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-2 sm:pt-3">
                <Button
                  variant="white"
                  size="md"
                  onClick={() => setModalMovie(currentMovie)}
                  className="shadow-xl px-5 sm:px-6 h-10 sm:h-11 text-xs sm:text-sm"
                >
                  <Play className="w-4 h-4 fill-current mr-2" />
                  Play Trailer
                </Button>

                <Button
                  variant="glass"
                  size="md"
                  onClick={() => navigate(`/movie/${currentSlug}`)}
                  className="px-5 sm:px-6 h-10 sm:h-11 text-xs sm:text-sm"
                >
                  <Info className="w-4 h-4 mr-2" />
                  More Info
                </Button>
              </div>
            </div>

            {/* Slider Controls: Touch Swipe Indicator, Dots & Buttons */}
            <div className="flex items-center justify-between pt-6 sm:pt-8 border-t border-white/10 mt-4 sm:mt-6">
              {/* Slide Indicator Dots (5+ movies) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {heroMovies.map((movie, index) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Slide to ${movie.title}`}
                    className={`h-1.5 rounded-full transition-all duration-300 touch-manipulation ${
                      index === activeSlide
                        ? 'w-7 sm:w-10 bg-[#E50914]'
                        : 'w-2 sm:w-3 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Swipe Helper Tag & Arrow Buttons */}
              <div className="flex items-center gap-3">
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all touch-manipulation shadow-md"
                    aria-label="Previous movie slide"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all touch-manipulation shadow-md"
                    aria-label="Next movie slide"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="w-full h-80 sm:h-96 bg-[#181818] animate-pulse flex items-center justify-center">
          <Film className="w-12 h-12 text-[#333333]" />
        </div>
      )}

      {/* Main Home Groups in EXACT Required Order */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        {/* GROUP 1: Popular Chillax Downloads */}
        <MovieRow
          title="Popular Chillax Downloads"
          categoryTag="POPULAR DOWNLOADS"
          movies={popularMovies}
          isLoading={popularLoading}
          viewAllLink="/movies?sort_by=download_count"
        />

        {/* GROUP 2: Latest Chillax Movies Torrents */}
        <MovieRow
          title="Latest Chillax  Movies Torrents"
          categoryTag="LATEST TORRENTS"
          movies={rankedLatestMovies}
          isLoading={latestLoading}
          viewAllLink="/movies?sort_by=date_added"
        />

        {/* GROUP 3: Upcoming Chillax Movies */}
        <MovieRow
          title="Upcoming Chillax  Movies"
          categoryTag="UPCOMING CINEMA"
          movies={upcomingMovies}
          isLoading={upcomingLoading}
          viewAllLink="/movies?sort_by=year&order_by=desc"
        />

        {/* Categories / Genres Section */}
        <section className="space-y-3.5 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-[#E50914] rounded-xs inline-block" />
            <span className="text-[11px] uppercase font-bold text-[#E50914] tracking-wider">
              CATEGORIES
            </span>
          </div>

          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Browse by Genre
            </h2>
            <Link
              to="/movies"
              className="text-xs font-semibold text-[#E50914] hover:text-[#F40612] hover:underline transition-colors"
            >
              All Genres
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {GENRES.filter((g) => g !== 'All').slice(0, 12).map((genre) => (
              <Link
                key={genre}
                to={`/genres/${genre.toLowerCase()}`}
                className="group p-3.5 sm:p-4 rounded-lg bg-[#181818] border border-[#262626] hover:border-[#E50914]/60 hover:bg-[#222222] transition-all flex items-center justify-between shadow-sm touch-manipulation"
              >
                <span className="text-xs sm:text-sm font-semibold text-white/90 group-hover:text-[#E50914] transition-colors truncate">
                  {genre}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#E50914] group-hover:translate-x-1 transition-all shrink-0 ml-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Platform Architecture & DMCA / Torrent Disclaimer Banner */}
        <section className="p-5 sm:p-7 rounded-lg bg-[#181818] border border-[#262626] grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-[#AAAAAA]">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-md bg-[#242424] border border-[#333333] flex items-center justify-center text-[#E50914]">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Instant Client Handoff</h3>
            <p className="text-xs leading-relaxed">
              Open magnet URIs directly in your desktop BitTorrent client (qBittorrent, Transmission, Deluge) with pre-configured tier-1 trackers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-md bg-[#242424] border border-[#333333] flex items-center justify-center text-[#E50914]">
              <Film className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Full Cinematic Specs</h3>
            <p className="text-xs leading-relaxed">
              View accurate IMDb scores, audio codecs, bit depths, exact file sizes, and streaming trailers before downloading.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-md bg-[#242424] border border-[#333333] flex items-center justify-center text-[#22C55E]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">DMCA &amp; Archival Integrity</h3>
            <p className="text-xs leading-relaxed">
              Index curated for public-domain, educational, and authorized media discovery. Review our <Link to="/dmca" className="text-white hover:text-[#E50914] underline">DMCA Policy</Link>.
            </p>
          </div>
        </section>
      </div>

      {/* Netflix Quick View Trailer Modal */}
      {modalMovie && (
        <MovieQuickModal movie={modalMovie} onClose={() => setModalMovie(null)} />
      )}
    </div>
  );
}
