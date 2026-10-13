import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Tv, Flame, Clapperboard, Bookmark } from 'lucide-react';
import { useWatchlist } from '../../hooks/useWatchlist';

export function MobileBottomNav() {
  const { count } = useWatchlist();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 transition-colors touch-manipulation ${
      isActive ? 'text-[#E50914]' : 'text-[#888888] hover:text-white'
    }`;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] h-16 flex items-center justify-around px-1 shadow-2xl select-none"
      aria-label="Mobile Navigation"
    >
      <NavLink to="/" end className={navClass}>
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold tracking-tight">Home</span>
      </NavLink>

      <NavLink to="/4k" className={navClass}>
        <div className="relative">
          <Tv className="w-5 h-5 mb-0.5" />
          <span className="absolute -top-1 -right-2 text-[8px] font-extrabold bg-[#E50914] text-white px-1 rounded-xs leading-none">
            4K
          </span>
        </div>
        <span className="text-[10px] font-semibold tracking-tight">4K</span>
      </NavLink>

      <NavLink to="/trending" className={navClass}>
        <Flame className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold tracking-tight">Trending</span>
      </NavLink>

      <NavLink to="/movies" className={navClass}>
        <Clapperboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold tracking-tight">Browse</span>
      </NavLink>

      <NavLink to="/watchlist" className={navClass}>
        <div className="relative">
          <Bookmark className="w-5 h-5 mb-0.5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#E50914] text-white text-[9px] font-bold flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold tracking-tight">My List</span>
      </NavLink>
    </nav>
  );
}
