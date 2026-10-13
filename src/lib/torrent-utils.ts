import { DEFAULT_TRACKERS } from './constants';
import { Torrent } from '../types/movie';

/**
 * Validates a torrent hash (standard SHA-1 hex 40 chars or base32 32 chars).
 */
export function isValidTorrentHash(hash: string | undefined | null): boolean {
  if (!hash || typeof hash !== 'string') return false;
  const clean = hash.trim();
  const hexPattern = /^[a-fA-F0-9]{40}$/;
  const base32Pattern = /^[2-7a-zA-Z]{32}$/;
  return hexPattern.test(clean) || base32Pattern.test(clean);
}

/**
 * Normalizes a torrent hash (trimmed, uppercase).
 */
export function normalizeTorrentHash(hash: string): string {
  return hash.trim().toUpperCase();
}

/**
 * Builds a compliant magnet URI from a validated hash, movie title, and trackers.
 */
export function buildMagnetUri(
  hash: string,
  movieTitle: string,
  extraTrackers?: string[]
): string | null {
  if (!isValidTorrentHash(hash)) {
    return null;
  }

  const cleanHash = normalizeTorrentHash(hash);
  const cleanTitle = movieTitle.trim() || 'Movie';
  const trackers = extraTrackers && extraTrackers.length > 0 ? extraTrackers : DEFAULT_TRACKERS;

  const trackerParams = trackers
    .map((tr) => `&tr=${encodeURIComponent(tr)}`)
    .join('');

  return `magnet:?xt=urn:btih:${cleanHash}&dn=${encodeURIComponent(cleanTitle)}${trackerParams}`;
}

/**
 * Formats bytes to human-readable size if raw bytes are provided
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Checks if a torrent object is valid for download
 */
export function isTorrentDownloadable(torrent: Torrent): boolean {
  return Boolean(torrent && isValidTorrentHash(torrent.hash));
}

const TYPE_LABELS: Record<string, string> = { bluray: 'BLU', web: 'WEB' };

/** Button label in the YTS style: "720p.BLU", "1080p.WEB", with " x265" for x265 encodes. */
export function torrentLabel(torrent: Pick<Torrent, 'quality' | 'type' | 'video_codec'>): string {
  const type = (torrent.type || '').trim().toLowerCase();
  const base = type ? `${torrent.quality}.${TYPE_LABELS[type] ?? type.toUpperCase()}` : torrent.quality;
  return /x265|hevc/i.test(torrent.video_codec || '') ? `${base} x265` : base;
}

/** The .torrent file URL, upgraded to https so browsers don't block it as mixed content. */
export function torrentFileUrl(torrent: Pick<Torrent, 'url'>): string | null {
  const url = (torrent.url || '').trim();
  if (!/^https?:\/\//i.test(url)) return null;
  return url.replace(/^http:\/\//i, 'https://');
}