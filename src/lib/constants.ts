export const APP_NAME = 'Chillax';
export const APP_TAGLINE = 'Cinematic Movie Discovery & Torrent Catalog';

export const API_BASE_URL = 'https://movies-api.accel.li/api/v2';

export const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Film-Noir',
  'Game-Show',
  'History',
  'Horror',
  'Music',
  'Musical',
  'Mystery',
  'News',
  'Reality-TV',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Talk-Show',
  'Thriller',
  'War',
  'Western',
] as const;

export const QUALITIES = ['all', '480p', '720p', '1080p', '1080p.x265', '2160p', '3D'] as const;

export const SORT_OPTIONS = [
  { value: 'date_added', label: 'Latest Added' },
  { value: 'year', label: 'Latest Year' },
  { value: 'download_count', label: 'Most Popular' },
  { value: 'rating', label: 'IMDb Rating' },
  { value: 'seeds', label: 'Most Seeders' },
  { value: 'peers', label: 'Most Peers' },
  { value: 'like_count', label: 'Most Liked' },
  { value: 'title', label: 'Alphabetical' },
] as const;

export const RATING_OPTIONS = [
  { value: 0, label: 'All Ratings' },
  { value: 9, label: '9+ Rating' },
  { value: 8, label: '8+ Rating' },
  { value: 7, label: '7+ Rating' },
  { value: 6, label: '6+ Rating' },
  { value: 5, label: '5+ Rating' },
  { value: 4, label: '4+ Rating' },
  { value: 3, label: '3+ Rating' },
  { value: 2, label: '2+ Rating' },
  { value: 1, label: '1+ Rating' },
] as const;

/** Values are what the website's year segment accepts: a single year or a start-end range. */
export const YEAR_OPTIONS = [
  { value: 'all', label: 'All Years' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021' },
  { value: '2020', label: '2020' },
  { value: '2010-2019', label: '2010-2019' },
  { value: '2000-2009', label: '2000-2009' },
  { value: '1990-1999', label: '1990-1999' },
  { value: '1980-1989', label: '1980-1989' },
  { value: '1970-1979', label: '1970-1979' },
  { value: '1950-1969', label: '1950-1969' },
  { value: '1900-1949', label: '1900-1949' },
] as const;

/**
 * Language filter options, mirroring the YTS website dropdown.
 *
 * The YTS API has no language parameter and no endpoint that lists languages, so this list is
 * hardcoded. `count` is a snapshot of the number of titles the website reported per language
 * (used only for display); it will drift as the catalog grows and can be refreshed from the
 * website's dropdown. Rarer codes (under 9 titles) and duplicate 3-letter codes (eng, fra...) are omitted.
 */
export const LANGUAGE_OPTIONS = [
  { value: 'all', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'foreign', label: 'Foreign (non-English)' },
  { value: 'fr', label: 'French', count: 3696 },
  { value: 'ja', label: 'Japanese', count: 3002 },
  { value: 'es', label: 'Spanish', count: 2086 },
  { value: 'it', label: 'Italian', count: 1696 },
  { value: 'de', label: 'German', count: 1387 },
  { value: 'zh', label: 'Chinese (Mandarin)', count: 1226 },
  { value: 'ko', label: 'Korean', count: 1044 },
  { value: 'hi', label: 'Hindi', count: 973 },
  { value: 'cn', label: 'Cantonese', count: 894 },
  { value: 'tr', label: 'Turkish', count: 707 },
  { value: 'pt', label: 'Portuguese', count: 515 },
  { value: 'sv', label: 'Swedish', count: 510 },
  { value: 'ro', label: 'Romanian', count: 492 },
  { value: 'ru', label: 'Russian', count: 450 },
  { value: 'pl', label: 'Polish', count: 418 },
  { value: 'nl', label: 'Dutch', count: 382 },
  { value: 'da', label: 'Danish', count: 306 },
  { value: 'th', label: 'Thai', count: 283 },
  { value: 'id', label: 'Indonesian', count: 267 },
  { value: 'ta', label: 'Tamil', count: 263 },
  { value: 'te', label: 'Telugu', count: 255 },
  { value: 'no', label: 'Norwegian', count: 233 },
  { value: 'ar', label: 'Arabic', count: 209 },
  { value: 'tl', label: 'Tagalog', count: 182 },
  { value: 'fi', label: 'Finnish', count: 173 },
  { value: 'cs', label: 'Czech', count: 171 },
  { value: 'hu', label: 'Hungarian', count: 162 },
  { value: 'vi', label: 'Vietnamese', count: 140 },
  { value: 'ml', label: 'Malayalam', count: 139 },
  { value: 'fa', label: 'Persian', count: 125 },
  { value: 'pa', label: 'Punjabi', count: 104 },
  { value: 'he', label: 'Hebrew', count: 103 },
  { value: 'uk', label: 'Ukrainian', count: 92 },
  { value: 'et', label: 'Estonian', count: 91 },
  { value: 'el', label: 'Greek', count: 77 },
  { value: 'ms', label: 'Malay', count: 60 },
  { value: 'bn', label: 'Bangla', count: 52 },
  { value: 'kn', label: 'Kannada', count: 50 },
  { value: 'ca', label: 'Catalan', count: 46 },
  { value: 'is', label: 'Icelandic', count: 41 },
  { value: 'sk', label: 'Slovak', count: 36 },
  { value: 'sr', label: 'Serbian', count: 35 },
  { value: 'lt', label: 'Lithuanian', count: 35 },
  { value: 'mr', label: 'Marathi', count: 28 },
  { value: 'ur', label: 'Urdu', count: 25 },
  { value: 'hr', label: 'Croatian', count: 24 },
  { value: 'lv', label: 'Latvian', count: 20 },
  { value: 'ka', label: 'Georgian', count: 20 },
  { value: 'af', label: 'Afrikaans', count: 17 },
  { value: 'bg', label: 'Bulgarian', count: 17 },
  { value: 'ku', label: 'Kurdish', count: 13 },
  { value: 'zu', label: 'Zulu', count: 12 },
  { value: 'eu', label: 'Basque', count: 10 },
  { value: 'ga', label: 'Irish', count: 10 },
  { value: 'mk', label: 'Macedonian', count: 10 },
  { value: 'yo', label: 'Yoruba', count: 10 },
  { value: 'sw', label: 'Swahili', count: 9 },
  { value: 'sq', label: 'Albanian', count: 9 },
] as const;

export const LANGUAGE_COUNTS: Record<string, number> = Object.fromEntries(
  LANGUAGE_OPTIONS.filter((l): l is Extract<typeof l, { count: number }> => 'count' in l).map((l) => [l.value, l.count])
);

/**
 * Standard public tier-1 high-availability BitTorrent trackers
 */
export const DEFAULT_TRACKERS = [
  'udp://open.demonii.com:1337/announce',
  'udp://tracker.openbittorrent.com:80',
  'udp://tracker.coppersurfer.tk:6969',
  'udp://glotorrents.pw:6969/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://torrent.gresille.org:80/announce',
  'udp://p4p.arenabg.ch:1337',
  'udp://tracker.internetwarriors.net:1337',
] as const;