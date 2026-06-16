'use client';

import { useState, useRef, useEffect } from 'react';
import type { CharacterBrief } from '@/types';

interface Props {
  characters: CharacterBrief[];
  onSelect: (id: string) => void;
}

export function SearchBar({ characters, onSelect }: Props) {
  const [query,  setQuery]  = useState('');
  const [open,   setOpen]   = useState(false);
  const wrapRef  = useRef<HTMLDivElement>(null);

  const hits = query.trim()
    ? characters
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 7)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search agents..."
        className="w-44 focus:w-60 bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-1.5 text-xs text-zinc-300 font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-all duration-200"
      />
      {open && hits.length > 0 && (
        <div className="absolute top-full mt-1 right-0 w-64 bg-zinc-900 border border-zinc-700/70 rounded shadow-2xl z-50">
          {hits.map((c) => (
            <button
              key={c.id}
              onMouseDown={() => { onSelect(c.id); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 hover:bg-zinc-800 transition-colors border-b border-zinc-800/60 last:border-0"
            >
              <div className="text-xs text-zinc-300 font-mono">{c.name}</div>
              <div className="text-xs text-zinc-700 font-mono">CLASS {c.class_name} · {c.faction}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
