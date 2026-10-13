import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSeo } from '../lib/seo';

export function NotFoundPage() {
  useSeo({
    title: '404 — Title Not Found',
    description: 'The requested page or movie record could not be found on Chillax.',
    noindex: true,
  });

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#E50914]">
        <Film className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-white">Title or Page Not Found</h2>
        <p className="text-xs text-[#AAAAAA] leading-relaxed">
          The movie or link you were trying to access does not exist in our catalog or might have been removed.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link to="/">
          <Button variant="primary" size="md">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <Link to="/movies">
          <Button variant="secondary" size="md">
            <Search className="w-4 h-4 mr-2" />
            Browse Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}
