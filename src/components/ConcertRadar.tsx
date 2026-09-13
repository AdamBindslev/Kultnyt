'use client';

import React, { useState, useMemo } from 'react';
import { ConcertItem } from '@/types';
import { Calendar, MapPin, ExternalLink, Ticket, Filter } from 'lucide-react';

interface ConcertRadarProps {
  items: ConcertItem[];
}

export const ConcertRadar: React.FC<ConcertRadarProps> = ({ items }) => {
  const [selectedCity, setSelectedCity] = useState<string>('alle');
  const [selectedVenue, setSelectedVenue] = useState<string>('alle');

  const venues = useMemo(() => {
    const vSet = new Set<string>();
    items.forEach((c) => {
      if (c.venue) vSet.add(c.venue);
    });
    return ['alle', ...Array.from(vSet)];
  }, [items]);

  const filteredConcerts = useMemo(() => {
    return items.filter((item) => {
      // City filter
      if (selectedCity !== 'alle') {
        const matchCity = item.city?.toLowerCase() === selectedCity.toLowerCase();
        const matchVenue = item.venue?.toLowerCase().includes(selectedCity.toLowerCase());
        if (!matchCity && !matchVenue) return false;
      }

      // Venue filter
      if (selectedVenue !== 'alle') {
        if (item.venue !== selectedVenue) return false;
      }

      return true;
    });
  }, [items, selectedCity, selectedVenue]);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
        <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-400 font-medium">Ingen koncerter fundet.</p>
        <p className="text-xs text-zinc-600 mt-1">
          Kør en høst for at hente aktuelle kalendere fra Loppen, VEGA og Radar Aarhus.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Turné- & Koncertradar Danmark
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
              {filteredConcerts.length} koncerter
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Kommende koncerter og turnédatoer direkte fra Loppen, VEGA, Radar Aarhus m.fl.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs self-start">
          {['alle', 'København', 'Aarhus'].map((city) => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city);
                setSelectedVenue('alle');
              }}
              className={`px-3 py-1 rounded-md transition font-medium capitalize ${
                selectedCity === city
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {city === 'alle' ? 'Hele Danmark' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Venue Pills */}
      {venues.length > 2 && (
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-500 font-mono flex items-center space-x-1 text-[11px] mr-1 shrink-0">
            <Filter className="h-3 w-3" />
            <span>Spillested:</span>
          </span>
          {venues.map((venue) => (
            <button
              key={venue}
              onClick={() => setSelectedVenue(venue)}
              className={`px-2.5 py-1 rounded-full font-mono text-[11px] transition whitespace-nowrap ${
                selectedVenue === venue
                  ? 'bg-zinc-700 text-white font-semibold'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {venue === 'alle' ? 'Alle spillesteder' : venue}
            </button>
          ))}
        </div>
      )}

      {/* Concert Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConcerts.map((cct) => {
          return (
            <div
              key={cct.id}
              className="flex flex-col justify-between bg-zinc-900/60 hover:bg-zinc-900/95 border border-zinc-800/80 hover:border-emerald-600/60 rounded-xl p-5 transition duration-200 group shadow-sm hover:shadow-lg hover:shadow-black/50"
            >
              <div>
                {/* Top Row: Venue & City */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-700/50 uppercase font-semibold flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{cct.venue}</span>
                  </span>

                  <span className="text-xs font-mono text-zinc-400 font-medium">
                    {cct.city}
                  </span>
                </div>

                {/* Artist Name */}
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-white leading-snug mb-2">
                  {cct.artist}
                </h3>

                {/* Prominent Date Box */}
                <div className="my-2.5 px-3 py-2 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 flex items-center space-x-2.5 text-xs font-mono">
                  <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-[13px]">{cct.date_str}</span>
                </div>

                {/* Short Description */}
                {cct.summary_da && (
                  <p className="text-xs text-zinc-400 my-2.5 leading-relaxed line-clamp-3">
                    {cct.summary_da}
                  </p>
                )}

                {/* Genres */}
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

              {/* Bottom Row: Source & Ticket Link */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {cct.source_name}
                </span>

                <a
                  href={cct.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition text-xs font-mono font-medium shadow-sm shadow-emerald-950/40"
                >
                  <Ticket className="h-3.5 w-3.5" />
                  <span>Billet & Info</span>
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
