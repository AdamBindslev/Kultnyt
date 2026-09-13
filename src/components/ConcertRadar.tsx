'use client';

import React, { useState } from 'react';
import { ConcertItem } from '@/types';
import { Calendar, MapPin, ExternalLink, Ticket } from 'lucide-react';

interface ConcertRadarProps {
  items: ConcertItem[];
}

export const ConcertRadar: React.FC<ConcertRadarProps> = ({ items }) => {
  const [selectedCity, setSelectedCity] = useState<string>('alle');

  const cities = ['alle', 'København', 'Aarhus', 'Odense', 'Aalborg', 'Danmark'];

  const filteredConcerts = items.filter((item) => {
    if (selectedCity === 'alle') return true;
    return (
      (item.city && item.city.toLowerCase() === selectedCity.toLowerCase()) ||
      (item.venue && item.venue.toLowerCase().includes(selectedCity.toLowerCase()))
    );
  });

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
        <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-400 font-medium">Ingen danske koncerter registreret endnu.</p>
        <p className="text-xs text-zinc-600 mt-1">
          Når turnéer og festivaler i Danmark annonceres i feeds, opsamles de automatisk her.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <span>Turné- & Koncertradar Danmark</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kommende koncerter og festival-optrædener i Danmark for alternative artister.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs self-start">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-md transition font-medium capitalize ${
                selectedCity === city
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConcerts.map((cct) => {
          return (
            <div
              key={cct.id}
              className="flex flex-col justify-between bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-emerald-700/60 rounded-xl p-5 transition duration-200 group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 uppercase font-semibold flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{cct.venue}</span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-medium">
                    {cct.city}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-100 group-hover:text-white leading-snug mb-1">
                  {cct.artist}
                </h3>

                <p className="text-xs font-mono text-zinc-400 mb-3 flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{cct.date_str}</span>
                </p>

                {cct.summary_da && (
                  <p className="text-xs text-zinc-300 bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/60 my-2 leading-relaxed">
                    {cct.summary_da}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 my-2">
                  {cct.genres &&
                    cct.genres
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

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Kilde: {cct.source_name}
                </span>

                <a
                  href={cct.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-[11px] font-mono"
                >
                  <Ticket className="h-3 w-3 text-emerald-400" />
                  <span>Info & Billetter</span>
                  <ExternalLink className="h-3 w-3 ml-0.5 text-zinc-500" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
