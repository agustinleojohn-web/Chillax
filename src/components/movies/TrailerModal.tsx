import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface TrailerModalProps {
  youtubeCode: string;
  title: string;
  onClose: () => void;
}

/** Pop-out YouTube player. Closes on Esc, backdrop click or the close button. */
export function TrailerModal({ youtubeCode, title, onClose }: TrailerModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close trailer"
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#E50914]"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-[#333333] bg-black shadow-2xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeCode)}?autoplay=1&rel=0`}
            title={`${title} trailer`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
