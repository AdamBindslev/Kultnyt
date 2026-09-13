'use client';

import React from 'react';

interface GenreFilterProps {
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  availableGenres: string[];
}

export const GenreFilter: React.FC<GenreFilterProps> = ({
  selectedGenre,
  setSelectedGenre,
  selectedCategory,
  setSelectedCategory,
  availableGenres,
}) => {
  const defaultGenres = [
    'alle',
    'post-punk',
    'shoegaze',
    'indie rock',
    'electronic',
    'ambient',
    'experimental',
    'alt-folk',
    'metal / heavy',
  ];

  // Merge defaults with any unique genres present in the feed
  const displayGenres = Array.from(new Set([...defaultGenres, ...availableGenres])).filter(
    (g) => g && g.toLowerCase() !== 'none'
  );

  return (
    <div className="py-4 space-y-3">
      {/* Category Pills & Genre Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Origin Selector */}
        <div className="flex items-center space-x-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800/80 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              selectedCategory === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Alle Kilder
          </button>
          <button
            onClick={() => setSelectedCategory('international')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              selectedCategory === 'international'
                ? 'bg-zinc-800 text-indigo-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Internationalt
          </button>
          <button
            onClick={() => setSelectedCategory('danish')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              selectedCategory === 'danish'
                ? 'bg-zinc-800 text-rose-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🇩🇰 Dansk Scene
          </button>
        </div>

        {/* Subgenre Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          {displayGenres.slice(0, 10).map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded-full text-xs font-mono transition capitalize whitespace-nowrap ${
                  isSelected
                    ? 'bg-rose-600 text-white font-semibold shadow-sm shadow-rose-900/30'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
