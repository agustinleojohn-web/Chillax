import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Catalog Service Error',
  message = 'There was a problem communicating with the movie catalog API. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 my-8 rounded-lg border border-[#EF4444]/20 bg-[#121212]/80">
      <div className="p-3 bg-[#EF4444]/10 rounded-lg border border-[#EF4444]/30 mb-4 text-[#EF4444]">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">{title}</h3>
      <p className="text-sm text-[#A3A3A3] max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry Request
        </Button>
      )}
    </div>
  );
}
