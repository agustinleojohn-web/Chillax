import React from 'react';
import { Film, Search, BookmarkCheck } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  type?: 'search' | 'watchlist' | 'movies' | 'default';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  type = 'default',
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  let defaultIcon = <Film className="w-10 h-10 text-[#888888]" />;
  let defaultTitle = 'No titles found';
  let defaultDesc = 'Try tweaking your search terms, removing filters, or browsing other categories.';

  if (type === 'search') {
    defaultIcon = <Search className="w-10 h-10 text-[#888888]" />;
    defaultTitle = 'No matching titles found';
    defaultDesc = 'We could not find any titles matching your query. Check spelling or try a broader term.';
  } else if (type === 'watchlist') {
    defaultIcon = <BookmarkCheck className="w-10 h-10 text-[#E50914]" />;
    defaultTitle = 'Your List is empty';
    defaultDesc = 'Save movies while browsing to easily find them later and access torrent details anytime.';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-10 my-8 rounded-lg border border-[#262626] bg-[#181818]">
      <div className="p-3.5 bg-[#202020] rounded-lg border border-[#333333] mb-4">
        {defaultIcon}
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title || defaultTitle}</h3>
      <p className="text-sm text-[#AAAAAA] max-w-md mb-6">{description || defaultDesc}</p>
      {actionText && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
