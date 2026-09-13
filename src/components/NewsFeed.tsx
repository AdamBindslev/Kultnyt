'use client';

import React, { useState, useEffect } from 'react';
import { NewsItem } from '@/types';
import { ExternalLink, Bookmark, Sparkles, MapPin, Disc } from 'lucide-react';

interface NewsFeedProps {
  items: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ items }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kultnyt_bookmarks');
      if (saved) setBookmarkedIds(JSON.parse(saved));
    } catch {
      // Ignore local storage read errors
    }
  }, []);

  const toggleBookmark = (id: string) => {
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((item) => item !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    try {
      localStorage.setItem('kultnyt_bookmarks', JSON.stringify(updated));
    } catch {
      // Ignore write errors
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('da-DK', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
        <p className="text-zinc-400 font-medium">Ingen nyheder matcher de valgte filtre.</p>
        <p className="text-xs text-zinc-600 mt-1">Prøv at nulstille søgningen eller vælge et andet genretag.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((item) => {
        const isBookmarked = bookmarkedIds.includes(item.id);
        const hasDkConcert = item.denmark_concert;

        return (
          <article
            key={item.id}
            className="group flex flex-col justify-between bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 transition duration-200 shadow-sm hover:shadow-md hover:shadow-black/40 relative overflow-hidden"
          >
            {/* Top row: Source badge & Date & Bookmark */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${item.badge_color}`}
                  >
                    {item.source_name}
                  </span>
                  {item.category === 'danish' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40">
                      🇩🇰 DK
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-zinc-500">
                  <span className="text-[11px] font-mono">{formatDate(item.pub_date)}</span>
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    title={isBookmarked ? 'Fjern bogmærke' : 'Gem artikel'}
                    className={`p-1 rounded hover:bg-zinc-800 transition ${
                      isBookmarked ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-base font-semibold text-zinc-100 group-hover:text-white leading-snug mb-2.5">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-start justify-between gap-1"
                >
                  <span>{item.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0 mt-1 transition" />
                </a>
              </h2>

              {/* Danish AI Resumé Box */}
              {item.summary_da && (
                <div className="my-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/70 text-xs text-zinc-300 leading-relaxed relative">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-rose-400 font-semibold uppercase tracking-wider mb-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span>Kultnyt Resumé</span>
                  </div>
                  <p>{item.summary_da}</p>
                </div>
              )}

              {/* DK Concert Alert Badge if detected */}
              {hasDkConcert && (
                <div className="mb-3 px-2.5 py-1.5 rounded-md bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center space-x-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Koncert i Danmark:</strong> {hasDkConcert.venue} ({hasDkConcert.city})
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Row: Genre Tags & Release badge */}
            <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2 mt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {item.genres &&
                  item.genres
                    .filter((g) => g && g !== 'none')
                    .slice(0, 3)
                    .map((g) => (
                      <span
                        key={g}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-400 border border-zinc-700/50 capitalize"
                      >
                        {g}
                      </span>
                    ))}
              </div>

              {item.release_type && item.release_type !== 'none' && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/50 uppercase font-semibold flex items-center space-x-1">
                  <Disc className="h-3 w-3" />
                  <span>{item.release_type}</span>
                </span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};
