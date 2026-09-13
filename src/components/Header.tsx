'use client';

import React from 'react';
import { RefreshCw, Search, Radio, Disc3, Calendar, Sparkles } from 'lucide-react';
import { HarvestMeta } from '@/types';

interface HeaderProps {
  activeTab: 'news' | 'releases' | 'concerts';
  setActiveTab: (tab: 'news' | 'releases' | 'concerts') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  meta: HarvestMeta | null;
  isHarvesting: boolean;
  onHarvest: () => void;
  newsCount: number;
  releasesCount: number;
  concertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  meta,
  isHarvesting,
  onHarvest,
  newsCount,
  releasesCount,
  concertsCount,
}) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Ikke kørt endnu';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) + 
        ' d. ' + date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
    } catch {
      return isoString;
    }
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-rose-950/40">
            <div className="h-full w-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Disc3 className="h-5 w-5 text-rose-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-black tracking-wider text-white uppercase">
                KULT<span className="text-rose-500">NYT</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                v1.0 AI
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Alternativ Musik, Nye Udgivelser & Koncertradar DK
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-3 flex-1 max-w-md md:justify-end">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søg i kunstnere, tags, spillesteder..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-zinc-900/90 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onHarvest}
            disabled={isHarvesting}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border transition shadow-sm ${
              isHarvesting
                ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 cursor-not-allowed'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:text-white hover:border-zinc-600'
            }`}
            title="Kør høst & AI-opsummering med lokal Ollama"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isHarvesting ? 'animate-spin text-rose-400' : ''}`} />
            <span>{isHarvesting ? 'Høster...' : 'Høst nu'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Status Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-zinc-900 py-1 text-xs">
        <nav className="flex space-x-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md font-medium text-xs transition ${
              activeTab === 'news'
                ? 'bg-zinc-800/90 text-rose-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Nyhedsfeed</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-700/50 text-zinc-300 font-mono">
              {newsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md font-medium text-xs transition ${
              activeTab === 'releases'
                ? 'bg-zinc-800/90 text-indigo-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Disc3 className="h-3.5 w-3.5" />
            <span>Release Radar</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-700/50 text-zinc-300 font-mono">
              {releasesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('concerts')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md font-medium text-xs transition ${
              activeTab === 'concerts'
                ? 'bg-zinc-800/90 text-emerald-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Koncertradar DK</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-700/50 text-zinc-300 font-mono">
              {concertsCount}
            </span>
          </button>
        </nav>

        <div className="flex items-center space-x-3 text-zinc-500 font-mono text-[11px] py-1">
          <span className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Ollama: Llama 3.2</span>
          </span>
          <span>•</span>
          <span>Sidst opdateret: {formatTime(meta?.last_harvest)}</span>
        </div>
      </div>
    </header>
  );
};
