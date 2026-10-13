import React from 'react';

interface QualityBadgeProps {
  quality: string;
  size?: 'sm' | 'md';
  highlight?: boolean;
}

export function QualityBadge({ quality, size = 'sm', highlight = false }: QualityBadgeProps) {
  const is4k = quality === '2160p' || quality.toLowerCase().includes('4k');
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`font-mono font-bold tracking-tight rounded border uppercase inline-flex items-center justify-center ${
        highlight || is4k
          ? 'bg-[#E50914]/20 text-[#FF4D4D] border-[#E50914]/40'
          : 'bg-[#222222] text-[#CCCCCC] border-[#333333]'
      } ${sizeClasses}`}
    >
      {quality}
    </span>
  );
}
