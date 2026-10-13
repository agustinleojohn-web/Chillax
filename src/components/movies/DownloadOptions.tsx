import React from 'react';
import { Download, Info } from 'lucide-react';
import { Torrent } from '../../types/movie';
import { buildMagnetUri, isValidTorrentHash, torrentFileUrl, torrentLabel } from '../../lib/torrent-utils';
import { toast } from 'sonner';

interface DownloadOptionsProps {
  movieTitle: string;
  torrents?: Torrent[];
}

const BUTTON_CLASS =
  'inline-flex items-center gap-1.5 rounded-md border border-[#333333] bg-[#202020] px-3.5 py-2 text-sm font-semibold text-white ' +
  'transition-colors hover:border-[#E50914] hover:bg-[#E50914] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]';

/** One button per available encode, labelled by quality (e.g. "1080p.WEB"). Clicking downloads the .torrent file. */
export function DownloadOptions({ movieTitle, torrents = [] }: DownloadOptionsProps) {
  if (!torrents || torrents.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[#181818] border border-[#2F2F2F] text-center">
        <Info className="w-5 h-5 mx-auto mb-2 text-[#737373]" />
        <p className="text-sm text-[#AAAAAA]">No downloads are currently available for this title.</p>
      </div>
    );
  }

  // Rare fallback: a torrent without a file URL can still be opened through its magnet link.
  const openMagnet = (torrent: Torrent) => {
    const magnet = isValidTorrentHash(torrent.hash) ? buildMagnetUri(torrent.hash, movieTitle) : null;
    if (!magnet) {
      toast.error('This download is unavailable.');
      return;
    }
    window.location.href = magnet;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {torrents.map((torrent, idx) => {
        const label = torrentLabel(torrent);
        const fileUrl = torrentFileUrl(torrent);
        const details = [torrent.size, torrent.seeds != null ? `${torrent.seeds} seeds` : null].filter(Boolean).join(' · ');
        const key = torrent.hash || `${label}-${idx}`;

        return fileUrl ? (
          <a
            key={key}
            href={fileUrl}
            rel="noopener noreferrer"
            title={`Download ${label} .torrent${details ? ` (${details})` : ''}`}
            className={BUTTON_CLASS}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </a>
        ) : (
          <button
            key={key}
            type="button"
            onClick={() => openMagnet(torrent)}
            title={`Open ${label} in your torrent client${details ? ` (${details})` : ''}`}
            className={BUTTON_CLASS}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}