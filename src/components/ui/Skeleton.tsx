import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-[#171717] border border-[#1E1E1E] rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative aspect-[2/3] w-full rounded-lg bg-[#171717] border border-[#1E1E1E] overflow-hidden animate-pulse">
        <div className="absolute top-2.5 right-2.5 w-7 h-7 bg-[#202020] rounded-md" />
        <div className="absolute bottom-2.5 left-2.5 w-12 h-5 bg-[#202020] rounded-md" />
      </div>
      <div className="space-y-1.5 px-0.5">
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
