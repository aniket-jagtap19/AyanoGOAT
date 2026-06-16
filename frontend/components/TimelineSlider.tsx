'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import type { TimelineEvent } from '@/types';

interface Props {
  onSeasonChange?: (season: number) => void;
}

export function TimelineSlider({ onSeasonChange }: Props) {
  const [season,  setSeason]  = useState(1);
  const [events,  setEvents]  = useState<TimelineEvent[]>([]);

  useEffect(() => {
    api.getEvents().then(setEvents).catch(console.error);
  }, []);

  const currentEvents = events.filter((e) => e.season === season);

  const handleChange = (s: number) => {
    setSeason(s);
    onSeasonChange?.(s);
  };

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-zinc-600 font-mono tracking-[0.3em]">TIMELINE</span>
        <span className="text-xs font-mono text-blue-400">SEASON {season}</span>
      </div>

      <input
        type="range" min={1} max={3} step={1} value={season}
        onChange={(e) => handleChange(parseInt(e.target.value))}
        className="w-full accent-blue-500 mb-2"
      />
      <div className="flex justify-between text-xs font-mono text-zinc-700 mb-4">
        {[1, 2, 3].map((s) => (
          <button key={s} onClick={() => handleChange(s)}
            className={`transition-colors ${s === season ? 'text-blue-400' : 'hover:text-zinc-400'}`}>
            S{s}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentEvents.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-zinc-800/40 border border-zinc-800/60 rounded p-2.5"
            >
              <div className="text-xs font-mono text-zinc-300 mb-0.5">{ev.title}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{ev.description}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        {currentEvents.length === 0 && (
          <div className="text-xs text-zinc-700 font-mono py-3">NO EVENTS FOR SEASON {season}</div>
        )}
      </div>
    </div>
  );
}
