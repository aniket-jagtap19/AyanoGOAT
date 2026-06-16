'use client';

import { motion } from 'framer-motion';

const REL_COLORS: Record<string, string> = {
  MANIPULATES: '#f87171',
  ALLIES_WITH:  '#34d399',
  RIVALS:       '#fb923c',
  PROTECTS:     '#60a5fa',
  DECEIVES:     '#e879f9',
  DISTRUSTS:    '#94a3b8',
  INFLUENCES:   '#fbbf24',
};

interface Props {
  sourceLabel: string;
  targetLabel: string;
  relType: string;
  weight: number;
  trust: number;
}

export function AnimatedRelationshipPath({ sourceLabel, targetLabel, relType, weight, trust }: Props) {
  const color = REL_COLORS[relType] ?? '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-zinc-300 font-mono shrink-0">{sourceLabel}</span>

        <div className="flex-1 relative" style={{ height: 20 }}>
          <svg className="w-full h-full" viewBox="0 0 200 20" preserveAspectRatio="none">
            <motion.line
              x1="0" y1="10" x2="182" y2="10"
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray="5 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'linear' }}
            />
            <polygon points="182,5 200,10 182,15" fill={color} />
          </svg>
        </div>

        <span className="text-xs text-zinc-300 font-mono shrink-0">{targetLabel}</span>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <span style={{ color }}>{relType}</span>
        <span className="text-zinc-700">·</span>
        <span className="text-zinc-600">WEIGHT {(weight * 100).toFixed(0)}%</span>
        <span className="text-zinc-700">·</span>
        <span className="text-zinc-600">TRUST {(trust * 100).toFixed(0)}%</span>
      </div>
    </motion.div>
  );
}
