'use client';

import { motion } from 'framer-motion';
import type { Character } from '@/types';

const CLASS_COLOR: Record<string, string> = {
  A: 'text-yellow-400 border-yellow-500/40',
  B: 'text-emerald-400 border-emerald-500/40',
  C: 'text-red-400 border-red-500/40',
  D: 'text-blue-400 border-blue-500/40',
  Teacher: 'text-violet-400 border-violet-500/40',
  Council: 'text-fuchsia-400 border-fuchsia-500/40',
};

interface Props { character: Character; }

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export function CharacterProfilePanel({ character }: Props) {
  const classStyle = CLASS_COLOR[character.class_name] ?? 'text-zinc-400 border-zinc-600/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 font-mono tracking-wide">{character.name}</h2>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 border rounded font-mono ${classStyle}`}>
              CLASS {character.class_name}
            </span>
            <span className="text-xs px-2 py-0.5 border border-zinc-700/60 rounded text-zinc-500 font-mono">
              {character.faction}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-xs text-zinc-600 font-mono">INFLUENCE</div>
          <div className="text-2xl font-bold text-blue-400 font-mono leading-none mt-0.5">
            {(character.influence_score * 100).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-4">{character.description}</p>

      {/* Tendencies */}
      <div className="mb-4">
        <div className="text-xs text-zinc-600 font-mono tracking-[0.25em] mb-2">STRATEGIC TENDENCIES</div>
        <div className="flex flex-wrap gap-1.5">
          {character.strategic_tendencies.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 bg-zinc-800/80 text-zinc-400 rounded font-mono">
              {t.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-zinc-600 font-mono mb-1.5">TRUST INDEX · {(character.trust_level * 100).toFixed(0)}%</div>
          <Bar value={character.trust_level} color="bg-blue-500" />
        </div>
        <div>
          <div className="text-xs text-zinc-600 font-mono mb-1.5">INFLUENCE · {(character.influence_score * 100).toFixed(0)}%</div>
          <Bar value={character.influence_score} color="bg-red-500" />
        </div>
      </div>

      {/* Summary */}
      <div className="border-t border-zinc-800/60 pt-4">
        <div className="text-xs text-zinc-600 font-mono tracking-[0.25em] mb-1.5">PROFILE ANALYSIS</div>
        <p className="text-xs text-zinc-500 italic leading-relaxed">{character.personality_summary}</p>
      </div>
    </motion.div>
  );
}
