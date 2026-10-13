import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { FourKPage } from '../pages/FourKPage';
import { MoviesPage } from '../pages/MoviesPage';
import { SearchPage } from '../pages/SearchPage';
import { MovieDetailsPage } from '../pages/MovieDetailsPage';
import { TrendingPage } from '../pages/TrendingPage';
import { TopRatedPage } from '../pages/TopRatedPage';
import { GenrePage } from '../pages/GenrePage';
import { WatchlistPage } from '../pages/WatchlistPage';
import { AboutPage } from '../pages/AboutPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { DmcaPage } from '../pages/DmcaPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '4k',
        element: <FourKPage />,
      },
      {
        path: 'movies',
        element: <MoviesPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'movie/:slug',
        element: <MovieDetailsPage />,
      },
      {
        path: 'trending',
        element: <TrendingPage />,
      },
      {
        path: 'top-rated',
        element: <TopRatedPage />,
      },
      {
        path: 'genres/:genre',
        element: <GenrePage />,
      },
      {
        path: 'watchlist',
        element: <WatchlistPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
      {
        path: 'dmca',
        element: <DmcaPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
