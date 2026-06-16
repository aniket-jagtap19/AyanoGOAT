'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserStrategyPanel } from '@/components/UserStrategyPanel';

export default function StrategistPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800/80 px-5 py-2.5 flex items-center gap-3">
        <Link href="/dashboard" className="text-zinc-600 font-mono text-xs hover:text-zinc-400 transition-colors">← NETWORK</Link>
        <span className="text-zinc-700 font-mono text-xs">/</span>
        <span className="text-zinc-400 font-mono text-xs">STRATEGIST CLASSIFICATION</span>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-xs text-zinc-700 font-mono tracking-[0.4em] mb-2">BEHAVIORAL ANALYSIS PROTOCOL</div>
          <h1 className="text-xl font-bold text-zinc-100 font-mono tracking-wider mb-8">STRATEGIST PROFILING</h1>
          <UserStrategyPanel />
        </motion.div>
      </div>
    </div>
  );
}
