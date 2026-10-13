import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Clapperboard, Flame, Award, Tv, Bookmark } from 'lucide-react';
import { APP_NAME, GENRES } from '../../lib/constants';

const BROWSE_LINKS = [
  { to: '/movies', label: 'All Movies', Icon: Clapperboard },
  { to: '/trending', label: 'Trending', Icon: Flame },
  { to: '/top-rated', label: 'Top Rated', Icon: Award },
  { to: '/4k', label: '4K Ultra HD', Icon: Tv },
  { to: '/watchlist', label: 'My List', Icon: Bookmark },
];

const LEGAL_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/dmca', label: 'DMCA' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

const FOOTER_GENRES = GENRES.filter((g) => g !== 'All').slice(0, 14);

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    // Bottom padding on mobile clears the fixed bottom navigation (h-16) plus the iOS home indicator,
    // so the whole footer can be scrolled into view above it.
    <footer className="relative mt-20 border-t border-[#222222] bg-[#0E0E0E] text-sm text-[#8A8A8A] pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Accent hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E50914] to-transparent opacity-70" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 md:grid-cols-12 md:py-14">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="inline-block" aria-label={`${APP_NAME} home`}>
              <span className="font-bebas text-4xl tracking-wider text-[#E50914] uppercase">{APP_NAME}</span>
            </Link>
            <p className="max-w-sm leading-relaxed text-[#7A7A7A]">
              Discover films by quality, genre, rating, year, language and the people who made them. Browse the
              catalog, watch trailers and grab the release that suits you.
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] px-4 py-2 text-xs font-semibold text-[#CCCCCC] transition-colors hover:border-[#E50914] hover:text-white"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              Back to top
            </button>
          </div>

          {/* Browse */}
          <nav className="md:col-span-3" aria-label="Browse">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white">Browse</h4>
            <ul className="space-y-3">
              {BROWSE_LINKS.map(({ to, label, Icon }) => (
                <li key={to}>
                  <Link to={to} className="group inline-flex items-center gap-2.5 transition-colors hover:text-white">
                    <Icon className="h-4 w-4 text-[#555555] transition-colors group-hover:text-[#E50914]" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Genres */}
          <nav className="md:col-span-4" aria-label="Genres">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {FOOTER_GENRES.map((genre) => (
                <Link
                  key={genre}
                  to={`/genres/${genre.toLowerCase()}`}
                  className="rounded-lg border border-[#262626] bg-[#151515] px-3 py-1.5 text-xs text-[#BBBBBB] transition-colors hover:border-[#E50914] hover:text-white"
                >
                  {genre}
                </Link>
              ))}
              <Link
                to="/movies"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#E50914] transition-colors hover:text-white"
              >
                All genres →
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-[#202020] py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[#666666]">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="text-[#7A7A7A] transition-colors hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}