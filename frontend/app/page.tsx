'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: 'easeOut' },
});

export default function HomePage() {
  return (
    <main
      className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#60a5fa 1px, transparent 1px), linear-gradient(90deg, #60a5fa 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl w-full">
        {/* System label */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-zinc-600 font-mono text-xs tracking-[0.5em] mb-10 uppercase"
        >
          White Room Intelligence Terminal · Classification A-Zero
        </motion.p>

        {/* Title */}
        <motion.h1
          {...fadeUp(0.5)}
          className="font-mono font-bold tracking-[0.18em] text-zinc-100 mb-3"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
        >
          AYANOKOJI
        </motion.h1>
        <motion.h2
          {...fadeUp(0.75)}
          className="font-mono tracking-[0.7em] text-blue-400 mb-14"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}
        >
          PROTOCOL
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(1.1)}
          className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-14"
        >
          Strategic influence mapping. Alliance instability analysis.
          Manipulation chain detection. Behavioral archetype classification.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(1.5)}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/dashboard"
            className="px-9 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm tracking-[0.2em] rounded transition-colors"
          >
            ENTER THE NETWORK
          </Link>
          <Link
            href="/strategist"
            className="px-9 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-zinc-100 font-mono text-sm tracking-[0.2em] rounded transition-colors"
          >
            CREATE PROFILE
          </Link>
        </motion.div>
      </div>

      {/* Footer status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 text-zinc-700 font-mono text-xs tracking-[0.3em]"
      >
        25 AGENTS · 115 RELATIONSHIPS · 3 ACTIVE FACTIONS
      </motion.div>
    </main>
  );
}
