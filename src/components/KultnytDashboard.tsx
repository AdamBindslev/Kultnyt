'use client';

import React, { useState, useMemo } from 'react';
import { NewsItem, ReleaseItem, ConcertItem, HarvestMeta } from '@/types';
import { Header } from './Header';
import { LiveTicker } from './LiveTicker';
import { GenreFilter } from './GenreFilter';
import { NewsFeed } from './NewsFeed';
import { ReleaseRadar } from './ReleaseRadar';
import { ConcertRadar } from './ConcertRadar';

interface KultnytDashboardProps {
  initialNews: NewsItem[];
  initialReleases: ReleaseItem[];
  initialConcerts: ConcertItem[];
  initialMeta: HarvestMeta | null;
}

export const KultnytDashboard: React.FC<KultnytDashboardProps> = ({
  initialNews,
  initialReleases,
  initialConcerts,
  initialMeta,
}) => {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [releases, setReleases] = useState<ReleaseItem[]>(initialReleases);
  const [concerts, setConcerts] = useState<ConcertItem[]>(initialConcerts);
  const [meta, setMeta] = useState<HarvestMeta | null>(initialMeta);

  const [activeTab, setActiveTab] = useState<'news' | 'releases' | 'concerts'>('news');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('alle');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isHarvesting, setIsHarvesting] = useState<boolean>(false);

  // Extract all genres dynamically
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    news.forEach((item) => {
      item.genres?.forEach((g) => {
        if (g && g !== 'none') genreSet.add(g.toLowerCase());
      });
    });
    return Array.from(genreSet);
  }, [news]);

  // Filter news
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Category / Origin filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Genre filter
      if (selectedGenre !== 'alle') {
        const itemGenres = (item.genres || []).map((g) => g.toLowerCase());
        if (!itemGenres.includes(selectedGenre.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchSummary = item.summary_da?.toLowerCase().includes(q);
        const matchArtist = item.artist?.toLowerCase().includes(q);
        const matchSource = item.source_name?.toLowerCase().includes(q);
        const matchGenres = item.genres?.some((g) => g.toLowerCase().includes(q));
        const matchVenue = item.denmark_concert?.venue?.toLowerCase().includes(q);
        return matchTitle || matchSummary || matchArtist || matchSource || matchGenres || matchVenue;
      }

      return true;
    });
  }, [news, selectedCategory, selectedGenre, searchQuery]);

  // Filter releases
  const filteredReleases = useMemo(() => {
    return releases.filter((item) => {
      if (selectedGenre !== 'alle') {
        const itemGenres = (item.genres || []).map((g) => g.toLowerCase());
        if (!itemGenres.includes(selectedGenre.toLowerCase())) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchArtist = item.artist?.toLowerCase().includes(q);
        const matchSummary = item.summary_da?.toLowerCase().includes(q);
        return matchTitle || matchArtist || matchSummary;
      }
      return true;
    });
  }, [releases, selectedGenre, searchQuery]);

  // Filter concerts
  const filteredConcerts = useMemo(() => {
    return concerts.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchArtist = item.artist?.toLowerCase().includes(q);
        const matchVenue = item.venue?.toLowerCase().includes(q);
        const matchCity = item.city?.toLowerCase().includes(q);
        const matchSummary = item.summary_da?.toLowerCase().includes(q);
        return matchArtist || matchVenue || matchCity || matchSummary;
      }
      return true;
    });
  }, [concerts, searchQuery]);

  // Handle manual harvest button
  const handleHarvest = async () => {
    setIsHarvesting(true);
    try {
      const res = await fetch('/api/harvest');
      if (res.ok) {
        const data = await res.json();
        if (data.news) setNews(data.news);
        if (data.releases) setReleases(data.releases);
        if (data.concerts) setConcerts(data.concerts);
        if (data.meta) setMeta(data.meta);
      }
    } catch (err) {
      console.error('Failed to run harvest:', err);
    } finally {
      setIsHarvesting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        meta={meta}
        isHarvesting={isHarvesting}
        onHarvest={handleHarvest}
        newsCount={filteredNews.length}
        releasesCount={filteredReleases.length}
        concertsCount={filteredConcerts.length}
      />

      {/* Top Ticker */}
      <LiveTicker items={news} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Genre & Category Bar (visible on News & Releases tabs) */}
        {activeTab !== 'concerts' && (
          <GenreFilter
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            availableGenres={availableGenres}
          />
        )}

        {/* Tab Views */}
        <div className="mt-4">
          {activeTab === 'news' && <NewsFeed items={filteredNews} />}
          {activeTab === 'releases' && <ReleaseRadar items={filteredReleases} />}
          {activeTab === 'concerts' && <ConcertRadar items={filteredConcerts} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 text-xs text-zinc-500 font-mono mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="text-zinc-400 font-semibold uppercase tracking-wider">
              Kultnyt // Alternativ Musik & Koncerter
            </p>
            <p className="mt-1 text-zinc-600">
              Aggregerer Stereogum, The Quietus, BrooklynVegan, Pitchfork, Bandcamp Daily, GAFFA & Soundvenue.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-zinc-600">
            <span>Powered by Next.js & Local Ollama AI</span>
            <span>•</span>
            <span>Headless Mac Mini Server</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
