import { FilterState } from './movie-filters';

/**
 * The YTS API cannot filter by language (its list_movies endpoint ignores a `language`
 * parameter), but the YTS website can. The website's browse pages are therefore used as the
 * source of *which* movies match, and the API is used to load each movie's full record.
 *
 * Website URL shape (verified against the live site):
 *   /browse-movies/{query}/{quality}/{genre}/{rating}/{order}/{year}/{language}?page=N
 *   e.g. /browse-movies/0/all/all/0/latest/0/tl            (Tagalog, newest first)
 *        /browse-movies/0/1080p/action/7/seeds/2024/tl      (all filters together)
 *        /browse-movies/0/all/all/0/oldest/2010-2019/tl     (year range)
 * `query` also matches actor and director names, which the API cannot do. The site only orders
 * "alphabetical" A-Z and everything else descending (date also supports "oldest").
 */

/** Same-origin prefix that is proxied to the website (vite dev proxy / vercel.json rewrite). */
export const SITE_PROXY_PREFIX = '/yts-site';

const ORDER_SEGMENTS: Record<FilterState['sort_by'], { desc: string; asc: string }> = {
  date_added: { desc: 'latest', asc: 'oldest' },
  year: { desc: 'year', asc: 'year' },
  download_count: { desc: 'downloads', asc: 'downloads' },
  rating: { desc: 'rating', asc: 'rating' },
  seeds: { desc: 'seeds', asc: 'seeds' },
  peers: { desc: 'peers', asc: 'peers' },
  like_count: { desc: 'likes', asc: 'likes' },
  title: { desc: 'alphabetical', asc: 'alphabetical' },
};

export function buildBrowsePath(f: FilterState, page: number): string {
  const seg = (v: string | number) => encodeURIComponent(String(v));
  const query = f.query_term.trim() || '0';
  const quality = f.quality !== 'all' ? f.quality : 'all';
  const genre = f.genre !== 'All' ? f.genre.toLowerCase() : 'all';
  const order = ORDER_SEGMENTS[f.sort_by][f.order_by];
  const year = f.year !== 'all' ? f.year : '0';
  const language = f.language !== 'all' ? f.language : 'all';
  const path = `/browse-movies/${seg(query)}/${seg(quality)}/${seg(genre)}/${seg(f.minimum_rating || 0)}/${seg(order)}/${seg(year)}/${seg(language)}`;
  return page > 1 ? `${path}?page=${page}` : path;
}

export interface BrowseEntry {
  slug: string;
  /** Best-effort exact title as printed on the card, used to look the movie up in the API. */
  title?: string;
}

export interface BrowsePage {
  entries: BrowseEntry[];
  hasNext: boolean;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function textOf(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/** "[TL] I'mPerfect" -> "I'mPerfect" (the badge shows the movie's language). */
function stripLanguageBadge(s: string): string {
  return s.replace(/^\s*\[[A-Za-z]{2,3}\]\s*/, '').trim();
}

const MOVIE_HREF = /\/movies\/([a-z0-9][a-z0-9-]*)\/?(?:[?#].*)?$/i;

/**
 * Extracts the movies listed on a website browse page. Every link to /movies/{slug} is collected
 * (each card has two: poster and title), de-duplicated in page order, and the title is taken from
 * the shortest link text that isn't the poster's "download / View Details" overlay.
 */
export function parseBrowseHtml(html: string): BrowsePage {
  const bySlug = new Map<string, BrowseEntry & { candidates: string[] }>();
  const anchor = /<a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const m of html.matchAll(anchor)) {
    const hit = MOVIE_HREF.exec(decodeEntities(m[1]));
    if (!hit) continue;
    const slug = hit[1].toLowerCase();
    const entry = bySlug.get(slug) ?? { slug, candidates: [] };
    const text = stripLanguageBadge(textOf(m[2]));
    if (text && !/view details|download/i.test(text)) entry.candidates.push(text);
    bySlug.set(slug, entry);
  }

  const entries: BrowseEntry[] = [...bySlug.values()].map(({ slug, candidates }) => ({
    slug,
    title: candidates.sort((a, b) => a.length - b.length)[0],
  }));

  const hasNext = /<a\b[^>]*href\s*=\s*["'][^"']*[?&]page=\d+[^"']*["'][^>]*>\s*(?:Next|&raquo;|»)/i.test(html) ||
    /<a\b[^>]*href\s*=\s*["'][^"']*[?&]page=\d+[^"']*["'][^>]*>[^<]*Next/i.test(html);

  return { entries, hasNext };
}

/** The dev server / host returned our own SPA shell instead of the proxied website page. */
export function looksLikeSpaShell(html: string): boolean {
  return /<div\s+id=["']root["']/i.test(html) && !/browse-movie/i.test(html);
}

/** Slug "ganito-ganyan-ganoon-2026" -> "ganito ganyan ganoon" (fallback search text). */
export function slugToSearchText(slug: string): string {
  return slug.replace(/-\d{4}(?:-\d+)?$/, '').replace(/-/g, ' ').trim();
}

/** Runs `fn` over items with at most `limit` in flight, keeping result order. */
export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export interface MoviePeople {
  directors: string[];
  cast: string[];
}

const PERSON_HREF = /\/browse-movies\/([^/?#]+)\/?(?:[?#].*)?$/i;

/**
 * Reads director and cast names from a website movie page. Their names link to
 * /browse-movies/{Name}; links after a "Director" label (and before the cast label) are directors.
 */
export function parseMoviePeople(html: string): MoviePeople {
  const directorAt = html.search(/\bdirectors?\b/i);
  const castAt = html.search(/top\s*cast|\bcast\b/i);
  const out: MoviePeople = { directors: [], cast: [] };
  const anchor = /<a\b[^>]*?href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const m of html.matchAll(anchor)) {
    const hit = PERSON_HREF.exec(decodeEntities(m[1]));
    if (!hit) continue;
    const name = textOf(m[2]);
    if (!name) continue; // image-only link
    const at = m.index ?? 0;
    const isDirector = directorAt !== -1 && at > directorAt && (castAt === -1 || castAt < directorAt || at < castAt);
    const bucket = isDirector ? out.directors : out.cast;
    if (!bucket.includes(name) && !out.directors.includes(name)) bucket.push(name);
  }
  return out;
}

/** In-app URL listing every movie for a person (actor or director). */
export function personUrl(name: string): string {
  return `/movies?${new URLSearchParams({ q: name, person: '1' }).toString()}`;
}