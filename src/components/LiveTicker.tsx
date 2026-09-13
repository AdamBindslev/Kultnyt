'use client';

import React from 'react';
import { NewsItem } from '@/types';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface LiveTickerProps {
  items: NewsItem[];
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const tickerItems = items.slice(0, 10);
  // Duplicate array to enable seamless infinite scroll loop
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="border-b border-zinc-800/60 bg-zinc-950/60 overflow-hidden py-1.5 flex items-center">
      <div className="flex items-center px-3 pl-4 border-r border-zinc-800 bg-zinc-950 z-10 shrink-0 space-x-1.5 text-xs font-mono text-rose-400 font-semibold tracking-wider">
        <Sparkles className="h-3 w-3 animate-pulse" />
        <span>LIVE RADAR:</span>
      </div>

      <div className="overflow-hidden whitespace-nowrap flex-1 relative">
        <div className="animate-ticker flex items-center space-x-8 text-xs">
          {displayItems.map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-zinc-300 hover:text-rose-300 transition group"
            >
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40">
                {item.source_name}
              </span>
              <span className="group-hover:underline font-medium">{item.title}</span>
              <ArrowUpRight className="h-3 w-3 text-zinc-600 group-hover:text-rose-400 transition" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
