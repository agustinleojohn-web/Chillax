import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, Bookmark, Menu, X, User, Star, Film, ChevronRight } from 'lucide-react';
import { movieApi } from '../../lib/api-client';
import { movieKeys } from '../../lib/query-client';
import { useWatchlist } from '../../hooks/useWatchlist';
import { APP_NAME } from '../../lib/constants';
import { QualityBadge } from '../movies/QualityBadge';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const { count } = useWatchlist();
  const navigate = useNavigate();

  // Scroll listener for glass navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      if (searchQuery.trim().length >= 2) {
        setShowPreview(true);
      } else {
        setShowPreview(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener to close search preview
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowPreview(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search previews
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: movieKeys.list({ nav_preview: debouncedQuery }),
    queryFn: ({ signal }) =>
      movieApi.searchMovies({ query_term: debouncedQuery, limit: 5 }, signal),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 2,
  });

  const previewMovies = searchResults?.movies || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowPreview(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectMovie = (slug: string) => {
    setShowPreview(false);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileMenuOpen(false);
    navigate(`/movie/${slug}`);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 hover:text-white ${
      isActive ? 'text-white font-bold' : 'text-[#B3B3B3]'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg border-b border-[#222222]'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Left Zone: Brand & Navlinks */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] rounded-md tracking-tight"
            aria-label={`${APP_NAME} Home`}
          >
            <span className="font-bebas text-3xl sm:text-4xl text-[#E50914] tracking-wider leading-none drop-shadow-sm select-none">
              {APP_NAME}
            </span>
          </Link>

          {/* Requested Order: Home | 4k | Trending | Browse Movies | MyList */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/4k" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <span>4K</span>
                <span className="px-1 py-0.2 bg-[#E50914] text-white text-[9px] font-extrabold rounded-xs leading-none">
                  2160P
                </span>
              </span>
            </NavLink>
            <NavLink to="/trending" className={navLinkClass}>
              Trending
            </NavLink>
            <NavLink to="/movies" className={navLinkClass}>
              Browse Movies
            </NavLink>
            <NavLink to="/watchlist" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <span>My List</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#E50914] text-white text-[10px] font-bold">
                    {count}
                  </span>
                )}
              </span>
            </NavLink>
          </nav>
        </div>

        {/* Right Zone: Search with Live Previews, Bell, Avatar */}
        <div className="flex items-center gap-4">
          {/* Interactive Search Bar with Live Preview Dropdown */}
          <div ref={searchContainerRef} className="relative flex items-center">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Titles, actors, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setShowPreview(true);
                  }}
                  autoFocus
                  className="w-52 sm:w-72 bg-black/90 border border-[#444444] focus:border-white rounded-md py-1.5 pl-8 pr-7 text-xs text-white placeholder-[#888888] focus:outline-none transition-all shadow-xl"
                />
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchOpen(false);
                    setShowPreview(false);
                  }}
                  className="absolute right-2 text-[#888888] hover:text-white"
                  aria-label="Close search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 text-white hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded-md"
                aria-label="Open search input"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Live Search Preview Dropdown Under Desktop Searchbar */}
            {searchOpen && showPreview && debouncedQuery.length >= 2 && (
              <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#181818] border border-[#2F2F2F] rounded-lg shadow-2xl overflow-hidden z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#262626] flex items-center justify-between text-[11px] text-[#888888]">
                  <span className="font-semibold uppercase tracking-wider">Preview Results</span>
                  {isSearchLoading && <span className="animate-pulse text-[#E50914]">Searching...</span>}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#222222]">
                  {isSearchLoading && previewMovies.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#888888]">
                      Loading titles...
                    </div>
                  ) : previewMovies.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#888888]">
                      No movies found matching &ldquo;{debouncedQuery}&rdquo;
                    </div>
                  ) : (
                    previewMovies.map((movie) => {
                      const movieSlug = movie.slug ? `${movie.id}-${movie.slug}` : `${movie.id}`;
                      const poster = movie.small_cover_image || movie.medium_cover_image;

                      return (
                        <div
                          key={movie.id}
                          onClick={() => handleSelectMovie(movieSlug)}
                          className="p-2.5 flex items-center gap-3 hover:bg-[#222222] cursor-pointer transition-colors group"
                        >
                          {/* Thumbnail */}
                          <div className="w-10 h-14 rounded bg-[#101010] overflow-hidden shrink-0 border border-[#333333]">
                            {poster ? (
                              <img
                                src={poster}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#555555]">
                                <Film className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h4 className="text-xs font-semibold text-white group-hover:text-[#E50914] truncate transition-colors">
                              {movie.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-[#888888]">
                              <span>{movie.year || 'N/A'}</span>
                              {movie.rating > 0 && (
                                <span className="flex items-center gap-0.5 text-white/90">
                                  <Star className="w-2.5 h-2.5 text-[#E50914] fill-[#E50914]" />
                                  <span>{movie.rating.toFixed(1)}</span>
                                </span>
                              )}
                              {movie.genres?.[0] && (
                                <span className="truncate max-w-[80px] text-[#777777]">
                                  {movie.genres[0]}
                                </span>
                              )}
                            </div>

                            {/* Torrents badge */}
                            {movie.torrents && movie.torrents.length > 0 && (
                              <div className="flex items-center gap-1 pt-0.5">
                                {Array.from(new Set(movie.torrents.map((t) => t.quality)))
                                  .slice(0, 2)
                                  .map((q) => (
                                    <QualityBadge key={q} quality={q} size="sm" />
                                  ))}
                              </div>
                            )}
                          </div>

                          <ChevronRight className="w-4 h-4 text-[#555555] group-hover:text-white transition-colors shrink-0" />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* View all search results link */}
                <div className="p-2 bg-[#121212] border-t border-[#262626] text-center">
                  <Link
                    to={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                    onClick={() => {
                      setShowPreview(false);
                      setSearchOpen(false);
                    }}
                    className="text-xs font-semibold text-[#E50914] hover:underline block py-1"
                  >
                    View all results for &ldquo;{debouncedQuery}&rdquo; →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <Link
            to="/trending"
            className="p-1.5 text-white hover:text-white/80 transition-colors relative"
            title="Fresh Catalog Releases"
            aria-label="Fresh Catalog Releases"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E50914]" />
          </Link>

          {/* Watchlist Quick Bookmark (Mobile) */}
          <Link
            to="/watchlist"
            className="md:hidden relative p-1.5 text-white hover:text-white/80 transition-colors"
            aria-label="My List"
          >
            <Bookmark className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E50914] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                {count}
              </span>
            )}
          </Link>

          {/* Netflix Red Profile Avatar */}
          <Link
            to="/watchlist"
            className="w-8 h-8 rounded-md bg-[#E50914] flex items-center justify-center text-white hover:opacity-90 transition-opacity border border-white/20"
            title="My Profile & Saved List"
            aria-label="My Profile and Watchlist"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-white hover:text-white/80 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#222222] bg-[#141414]/98 px-5 pt-4 pb-6 space-y-4">
          <div ref={mobileSearchRef} className="relative w-full">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search movies, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowPreview(true);
                }}
                className="w-full bg-[#202020] border border-[#333333] focus:border-[#E50914] rounded-md py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#888888] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-3 pointer-events-none" />
            </form>

            {/* Mobile Search Preview Dropdown */}
            {showPreview && debouncedQuery.length >= 2 && (
              <div className="mt-2 w-full bg-[#181818] border border-[#2F2F2F] rounded-lg shadow-2xl overflow-hidden z-50">
                <div className="max-h-64 overflow-y-auto divide-y divide-[#222222]">
                  {previewMovies.map((movie) => {
                    const movieSlug = movie.slug ? `${movie.id}-${movie.slug}` : `${movie.id}`;
                    return (
                      <div
                        key={movie.id}
                        onClick={() => handleSelectMovie(movieSlug)}
                        className="p-2.5 flex items-center gap-3 hover:bg-[#222222] active:bg-[#292929] cursor-pointer"
                      >
                        <div className="w-9 h-12 rounded bg-[#101010] overflow-hidden shrink-0">
                          {movie.small_cover_image ? (
                            <img src={movie.small_cover_image} alt="" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{movie.title}</p>
                          <p className="text-[10px] text-[#888888]">{movie.year} · ★ {movie.rating}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive ? 'bg-[#222222] text-[#E50914] font-bold' : 'text-[#B3B3B3] hover:bg-[#1E1E1E]'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/4k"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-sm font-medium flex items-center justify-between ${
                  isActive ? 'bg-[#222222] text-[#E50914] font-bold' : 'text-[#B3B3B3] hover:bg-[#1E1E1E]'
                }`
              }
            >
              <span>4K (2160p Ultra HD)</span>
              <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[10px] font-bold">2160P</span>
            </NavLink>
            <NavLink
              to="/trending"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive ? 'bg-[#222222] text-[#E50914] font-bold' : 'text-[#B3B3B3] hover:bg-[#1E1E1E]'
                }`
              }
            >
              Trending (24h)
            </NavLink>
            <NavLink
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive ? 'bg-[#222222] text-[#E50914] font-bold' : 'text-[#B3B3B3] hover:bg-[#1E1E1E]'
                }`
              }
            >
              Browse Movies
            </NavLink>
            <NavLink
              to="/watchlist"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-md text-sm font-medium flex items-center justify-between ${
                  isActive ? 'bg-[#222222] text-[#E50914] font-bold' : 'text-[#B3B3B3] hover:bg-[#1E1E1E]'
                }`
              }
            >
              <span>My List</span>
              {count > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E50914] text-white text-xs font-bold">
                  {count} saved
                </span>
              )}
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}