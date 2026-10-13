export interface Torrent {
  url: string;
  hash: string;
  quality: string;
  type: string;
  is_repack?: string;
  video_codec?: string;
  bit_depth?: string;
  audio_channels?: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded?: string;
  date_uploaded_unix?: number;
}

export interface CastMember {
  name: string;
  character_name: string;
  url_small_image?: string;
  imdb_code?: string;
}

export interface ParentalGuide {
  type: string;
  parental_guide_text: string;
}

export interface Movie {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  slug: string;
  year: number;
  rating: number;
  runtime: number;
  genres?: string[];
  summary?: string;
  description_intro?: string;
  description_full?: string;
  synopsis?: string;
  yt_trailer_code?: string;
  language: string;
  mpa_rating?: string;
  background_image?: string;
  background_image_original?: string;
  small_cover_image?: string;
  medium_cover_image?: string;
  large_cover_image?: string;
  medium_screenshot_image1?: string;
  medium_screenshot_image2?: string;
  medium_screenshot_image3?: string;
  large_screenshot_image1?: string;
  large_screenshot_image2?: string;
  large_screenshot_image3?: string;
  state?: string;
  torrents?: Torrent[];
  cast?: CastMember[];
  download_count?: number;
  like_count?: number;
  date_uploaded?: string;
  date_uploaded_unix?: number;
}

export interface WatchlistMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  medium_cover_image?: string;
  genres?: string[];
  slug: string;
  runtime?: number;
  addedAt: number;
}
