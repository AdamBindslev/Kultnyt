export interface NewsItem {
  id: string;
  guid?: string;
  title: string;
  link: string;
  source_id: string;
  source_name: string;
  badge_color: string;
  category: 'international' | 'danish' | string;
  pub_date: string;
  snippet: string;
  summary_da: string;
  artist?: string | null;
  release_title?: string | null;
  release_type?: 'album' | 'ep' | 'single' | 'reissue' | 'none' | string;
  genres: string[];
  is_tour: boolean;
  denmark_concert?: {
    venue: string;
    city: string;
    date_str: string;
  } | null;
  created_at: string;
}

export interface ReleaseItem {
  id: string;
  artist: string;
  title: string;
  type: 'album' | 'ep' | 'single' | 'reissue' | string;
  genres: string[];
  summary_da: string;
  source_name: string;
  source_url: string;
  badge_color: string;
  date: string;
  created_at: string;
}

export interface ConcertItem {
  id: string;
  artist: string;
  venue: string;
  city: string;
  date_str: string;
  summary_da: string;
  genres: string[];
  source_name: string;
  link: string;
  created_at: string;
}

export interface HarvestMeta {
  last_harvest: string;
  total_news: number;
  total_releases: number;
  total_concerts: number;
  new_added: number;
}
