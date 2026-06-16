'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import type { CharacterBrief, SimulationResult } from '@/types';

const STRATEGIES = [
  { value: 'influence',        label: 'INFLUENCE' },
  { value: 'manipulation',     label: 'MANIPULATION' },
  { value: 'alliance',         label: 'ALLIANCE' },
  { value: 'observation',      label: 'OBSERVATION' },
  { value: 'direct_influence', label: 'DIRECT INFLUENCE' },
];

interface Props { characters: CharacterBrief[]; }

export function StrategySimulationPanel({ characters }: Props) {
  const [sourceId,   setSourceId]   = useState('');
  const [targetIds,  setTargetIds]  = useState<string[]>([]);
  const [strategy,   setStrategy]   = useState('influence');
  const [iterations, setIterations] = useState(15);
  const [result,     setResult]     = useState<SimulationResult | null>(null);
  const [running,    setRunning]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const toggleTarget = (id: string) =>
    setTargetIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const execute = async () => {
    if (!sourceId || targetIds.length === 0) {
      setError('Select a source agent and at least one target.');
      return;
    }
    setError(null);
    setRunning(true);
    try {
      const res = await api.runSimulation({
        source_character_id: sourceId,
        target_character_ids: targetIds,
        strategy,
        iterations,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed.');
    } finally {
      setRunning(false);
    }
  };

  const topInfluenced = result
    ? Object.entries(result.influence_scores)
        .filter(([id]) => id !== sourceId)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-5 space-y-5">
        <div>
          <label className="text-xs text-zinc-600 font-mono tracking-[0.25em] block mb-2">SOURCE AGENT</label>
          <select
            value={sourceId}
            onChange={(e) => { setSourceId(e.target.value); setTargetIds([]); }}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-500"
          >
            <option value="">— SELECT AGENT —</option>
            {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-600 font-mono tracking-[0.25em] block mb-2">
            TARGET AGENTS <span className="text-zinc-700">({targetIds.length} selected)</span>
          </label>
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {characters
              .filter((c) => c.id !== sourceId)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleTarget(c.id)}
                  className={`w-full text-left px-3 py-1.5 rounded text-xs font-mono transition-all ${
                    targetIds.includes(c.id)
                      ? 'bg-blue-950/50 text-blue-300 border border-blue-700/50'
                      : 'bg-zinc-800/40 text-zinc-500 border border-transparent hover:border-zinc-700/60 hover:text-zinc-400'
                  }`}
                >
                  {targetIds.includes(c.id) ? '✓ ' : '  '}{c.name}
                </button>
              ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-600 font-mono tracking-[0.25em] block mb-2">STRATEGY</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-500"
          >
            {STRATEGIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-600 font-mono tracking-[0.25em] block mb-2">
            ITERATIONS <span className="text-blue-400">{iterations}</span>
          </label>
          <input
            type="range" min={5} max={50} value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs font-mono text-zinc-700 mt-1">
            <span>5</span><span>50</span>
          </div>
        </div>

        {error && <div className="text-red-400 font-mono text-xs">{error}</div>}

        <button
          onClick={() => void execute()}
          disabled={running}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs tracking-[0.3em] rounded transition-colors"
        >
          {running ? 'COMPUTING...' : 'EXECUTE SIMULATION'}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-5 space-y-5"
          >
            <div className="text-xs text-zinc-600 font-mono tracking-[0.25em]">
              SIMULATION RESULTS · <span className="text-zinc-700">{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>

            <div>
              <div className="text-xs text-zinc-700 font-mono mb-3">INFLUENCE PROPAGATION</div>
              {topInfluenced.map(([id, score]) => (
                <div key={id} className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score * 100}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="h-full bg-blue-500/80 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-500 w-32 truncate">{id}</span>
                  <span className="text-xs font-mono text-zinc-700 w-10 text-right">{(score * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>

            {result.manipulation_chains.length > 0 && (
              <div>
                <div className="text-xs text-zinc-700 font-mono mb-2">MANIPULATION CHAINS</div>
                {result.manipulation_chains.slice(0, 4).map((chain, i) => (
                  <div key={i} className="text-xs font-mono text-zinc-500 mb-1.5">
                    {chain.join(' → ')}
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="text-xs text-zinc-700 font-mono mb-2">RECOMMENDED ACTIONS</div>
              {result.recommended_actions.map((r, i) => (
                <div key={i} className="flex gap-2 text-xs text-zinc-400 mb-2">
                  <span className="text-blue-500 shrink-0">▸</span>
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
