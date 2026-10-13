import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from '../ui/Skeleton';

interface MovieRowProps {
  title: string;
  categoryTag?: string;
  movies?: Movie[];
  isLoading?: boolean;
  viewAllLink?: string;
}

export function MovieRow({
  title,
  categoryTag = 'FEATURED',
  movies = [],
  isLoading = false,
  viewAllLink,
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse Drag State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const draggedDistance = useRef(0);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [movies]);

  // Smooth button scrolling
  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  // Mouse Dragging Handlers (Desktop drag & swipe)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!rowRef.current) return;
    isDragging.current = true;
    draggedDistance.current = 0;
    startX.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftStart.current = rowRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !rowRef.current) return;
    e.preventDefault();
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    draggedDistance.current = Math.abs(x - startX.current);
    rowRef.current.scrollLeft = scrollLeftStart.current - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Prevent accidental card click if user was dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (draggedDistance.current > 8) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="space-y-3.5 select-none">
      {/* Row Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          {/* Vertical Red Bar + Kicker */}
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-3.5 bg-[#E50914] rounded-xs inline-block" />
            <span className="text-[11px] uppercase font-bold text-[#E50914] tracking-wider">
              {categoryTag}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <h2 className="font-bebas text-2xl sm:text-3xl tracking-wide uppercase text-white">
              {title}
            </h2>
            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="text-xs font-semibold text-[#E50914] hover:text-[#F40612] hover:underline transition-colors ml-1"
              >
                All
              </Link>
            )}
          </div>
        </div>

        {/* Carousel Drag Indicator & Controls */}
        <div className="flex items-center gap-2">
          
          <button
            type="button"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-all touch-manipulation shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-all touch-manipulation shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Swipable & Draggable Horizontal Row of Movie Cards */}
      {isLoading ? (
        <div className="flex gap-3 sm:gap-4 overflow-hidden py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[140px] sm:w-[175px] md:w-[195px] shrink-0">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={rowRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClickCapture={handleClickCapture}
          className="flex gap-3.5 sm:gap-4.5 overflow-x-auto scrollbar-none py-1.5 touch-pan-x cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie, idx) => (
            <div
              key={movie.id}
              className="w-[145px] sm:w-[175px] md:w-[195px] lg:w-[215px] shrink-0 transition-transform"
            >
              <MovieCard movie={movie} priority={idx < 4} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
