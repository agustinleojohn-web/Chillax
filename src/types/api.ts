import { Movie, ParentalGuide } from './movie';

export interface ApiResponse<T> {
  status: 'ok' | 'error';
  status_message: string;
  data: T;
  '@meta'?: {
    server_time: number;
    server_timezone: string;
    api_version: number;
    execution_time: string;
  };
}

export interface ListMoviesData {
  movie_count: number;
  limit: number;
  page_number: number;
  movies?: Movie[];
}

export interface MovieDetailsData {
  movie: Movie;
}

export interface MovieSuggestionsData {
  movie_count: number;
  movies?: Movie[];
}

export interface ParentalGuidesData {
  parental_guide_count?: number;
  parental_guides?: ParentalGuide[];
}

export interface ListMoviesParams {
  limit?: number;
  page?: number;
  quality?: string;
  minimum_rating?: number;
  query_term?: string;
  genre?: string;
  sort_by?: 'title' | 'year' | 'rating' | 'peers' | 'seeds' | 'download_count' | 'like_count' | 'date_added';
  order_by?: 'desc' | 'asc';
  with_rt_ratings?: boolean;
  
}
