'use client';

import React from 'react';
import { ReleaseItem } from '@/types';
import { Disc, ExternalLink, Music2, Radio } from 'lucide-react';

interface ReleaseRadarProps {
  items: ReleaseItem[];
}

export const ReleaseRadar: React.FC<ReleaseRadarProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
        <Disc className="h-8 w-8 text-zinc-600 mx-auto mb-2 animate-spin-slow" />
        <p className="text-zinc-400 font-medium">Ingen udgivelser fundet endnu.</p>
        <p className="text-xs text-zinc-600 mt-1">Kør en høst for at hente de seneste alternative album- og single-drops.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <Disc className="h-5 w-5 text-indigo-400" />
            <span>Nye & Kommende Udgivelser (Release Radar)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kurateret oversigt over vigtige albums, EP&apos;er og singler fra den alternative scene.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((rel) => {
          const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(
            `${rel.artist} ${rel.title}`
          )}`;
          const bandcampSearchUrl = `https://bandcamp.com/search?q=${encodeURIComponent(
            `${rel.artist} ${rel.title}`
          )}`;

          return (
            <div
              key={rel.id}
              className="flex flex-col justify-between bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-indigo-700/60 rounded-xl p-5 transition duration-200 group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 uppercase font-semibold">
                    {rel.type || 'Album'}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">{rel.date}</span>
                </div>

                <div className="mb-2">
                  <h3 className="text-sm font-mono text-indigo-400 font-medium tracking-wide uppercase">
                    {rel.artist}
                  </h3>
                  <h4 className="text-base font-bold text-zinc-100 group-hover:text-white leading-snug">
                    {rel.title}
                  </h4>
                </div>

                {rel.summary_da && (
                  <p className="text-xs text-zinc-300 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/60 my-3 leading-relaxed">
                    {rel.summary_da}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 my-2">
                  {rel.genres &&
                    rel.genres
                      .filter((g) => g && g !== 'none')
                      .slice(0, 3)
                      .map((g) => (
                        <span
                          key={g}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/40 capitalize"
                        >
                          {g}
                        </span>
                      ))}
                </div>
              </div>

              {/* Streaming Links */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs mt-3">
                <div className="flex items-center space-x-2">
                  <a
                    href={bandcampSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-800/40 transition text-[11px] font-mono"
                  >
                    <Radio className="h-3 w-3" />
                    <span>Bandcamp</span>
                  </a>

                  <a
                    href={spotifySearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 transition text-[11px] font-mono"
                  >
                    <Music2 className="h-3 w-3" />
                    <span>Spotify</span>
                  </a>
                </div>

                <a
                  href={rel.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 flex items-center space-x-1 text-[11px]"
                  title="Gå til kildeartikel"
                >
                  <span>Kilde</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
