'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { InteractiveGraph } from '@/components/InteractiveGraph';
import { SearchBar } from '@/components/SearchBar';
import { api } from '@/lib/api';
import type { GraphData, CharacterBrief, AnalyticsData } from '@/types';

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500/70 rounded-full" style={{ width: `${value * 100}%` }} />
      </div>
      <span className="text-zinc-500 font-mono text-xs w-28 truncate">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const router   = useRouter();
  const ctnRef   = useRef<HTMLDivElement>(null);
  const [graphData,   setGraphData]   = useState<GraphData | null>(null);
  const [characters,  setCharacters]  = useState<CharacterBrief[]>([]);
  const [analytics,   setAnalytics]   = useState<AnalyticsData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [dims,        setDims]        = useState({ w: 800, h: 600 });

  useEffect(() => {
    Promise.all([api.getGraph(), api.getCharacters(), api.getAnalytics()])
      .then(([g, c, a]) => { setGraphData(g); setCharacters(c); setAnalytics(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = ctnRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      if (entry) setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (nodeId: string) => { router.push(`/character/${nodeId}`); },
    [router]
  );

  const topPageRank = analytics
    ? Object.entries(analytics.page_rank)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <div className="flex flex-col h-screen bg-zinc-950 overflow-hidden">
      {/* Nav */}
      <nav className="shrink-0 border-b border-zinc-800/80 px-5 py-2.5 flex items-center gap-5">
        <Link href="/" className="text-zinc-400 font-mono text-xs tracking-[0.3em] hover:text-zinc-200 transition-colors">
          AYANOKOJI PROTOCOL
        </Link>
        <span className="text-zinc-800 select-none">|</span>
        <Link href="/simulation" className="text-zinc-600 font-mono text-xs tracking-widest hover:text-zinc-300 transition-colors">SIMULATION</Link>
        <Link href="/strategist" className="text-zinc-600 font-mono text-xs tracking-widest hover:text-zinc-300 transition-colors">STRATEGIST</Link>
        <div className="ml-auto">
          <SearchBar characters={characters} onSelect={(id) => router.push(`/character/${id}`)} />
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph canvas */}
        <div ref={ctnRef} className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-zinc-600 font-mono text-xs tracking-[0.4em]"
              >
                MAPPING NETWORK...
              </motion.span>
            </div>
          )}
          {!loading && graphData && (
            <InteractiveGraph
              data={graphData}
              onNodeClick={handleNodeClick}
              width={dims.w}
              height={dims.h}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-68 shrink-0 border-l border-zinc-800/80 flex flex-col overflow-hidden" style={{ width: 272 }}>
          <div className="shrink-0 px-4 py-3 border-b border-zinc-800/80">
            <div className="text-xs text-zinc-600 font-mono tracking-[0.3em]">AGENT REGISTRY</div>
            <div className="text-xs text-zinc-700 font-mono mt-0.5">{characters.length} IDENTIFIED</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/character/${c.id}`)}
                className="w-full text-left px-4 py-2.5 border-b border-zinc-800/40 hover:bg-zinc-900/60 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors truncate">{c.name}</span>
                  <span className="text-xs font-mono text-zinc-600 ml-2 shrink-0">{(c.influence_score * 100).toFixed(0)}</span>
                </div>
                <div className="text-xs text-zinc-700 font-mono mt-0.5 truncate">
                  {c.class_name} · {c.faction}
                </div>
              </button>
            ))}
          </div>

          {analytics && (
            <div className="shrink-0 p-4 border-t border-zinc-800/80 space-y-3">
              <div className="text-xs text-zinc-600 font-mono tracking-widest">INFLUENCE RANK</div>
              {topPageRank.map(([id, score]) => (
                <StatBar key={id} label={id} value={score} />
              ))}
              <div className="flex gap-4 text-xs font-mono text-zinc-700 pt-1">
                <span>{analytics.communities.length} FACTIONS</span>
                <span>{analytics.hidden_influencers.length} HIDDEN</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
