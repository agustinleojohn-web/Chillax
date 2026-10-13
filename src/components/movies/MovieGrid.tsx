import React from 'react';
import { Movie, WatchlistMovie } from '../../types/movie';
import { MovieCard } from './MovieCard';
import { MovieCardSkeleton } from '../ui/Skeleton';

interface MovieGridProps {
  movies?: (Movie | WatchlistMovie)[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function MovieGrid({ movies = [], isLoading = false, skeletonCount = 10 }: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
      {movies.map((movie, idx) => (
        <MovieCard key={movie.id} movie={movie} priority={idx < 4} />
      ))}
    </div>
  );
}
