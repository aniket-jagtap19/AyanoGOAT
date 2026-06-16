'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import type { StrategistProfile } from '@/types';

const SCENARIOS = [
  {
    id: 'S1',
    q: 'A rival offers critical intelligence in exchange for your visible public support. You:',
    opts: [
      'Accept immediately — information is the only currency that matters.',
      'Accept, but plan to withdraw support once the information is secured.',
      'Decline and instead observe how they respond to rejection.',
      'Counter-offer with lesser support while extracting a higher price.',
    ],
  },
  {
    id: 'S2',
    q: 'Your faction requires points but the optimal strategy demands someone take visible risk. You:',
    opts: [
      'Lead from the front — visibility constructs loyalty.',
      'Designate another as the visible actor while you orchestrate from behind.',
      'Present multiple options and let the group decide. Plausible deniability.',
      'Propose a safer alternative that yields fewer points but less exposure.',
    ],
  },
  {
    id: 'S3',
    q: 'Someone has identified your concealed capability. You:',
    opts: [
      'Confront directly. Ambiguity is more dangerous than acknowledgment.',
      'Manipulate their perception until they doubt what they observed.',
      'Buy their silence with something they value more than this information.',
      'Preemptively neutralize their capacity to act on this knowledge.',
    ],
  },
];

type Step = 'scenarios' | 'calibration' | 'result';

export function UserStrategyPanel() {
  const [step,      setStep]      = useState<Step>('scenarios');
  const [answers,   setAnswers]   = useState<Record<string, string>>({});
  const [alliance,  setAlliance]  = useState(0.5);
  const [manip,     setManip]     = useState(0.5);
  const [profile,   setProfile]   = useState<StrategistProfile | null>(null);
  const [busy,      setBusy]      = useState(false);

  const allAnswered = SCENARIOS.every((s) => Boolean(answers[s.id]));

  const generate = async () => {
    setBusy(true);
    try {
      const res = await api.createProfile({
        user_id: `analyst_${Date.now()}`,
        scenario_responses: SCENARIOS.map((s) => answers[s.id] ?? ''),
        strategic_choices:  SCENARIOS.map((s) => answers[s.id] ?? ''),
        alliance_preference:   alliance,
        manipulation_tendency: manip,
      });
      setProfile(res);
      setStep('result');
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-6 min-h-96">
      <AnimatePresence mode="wait">
        {step === 'scenarios' && (
          <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-8 mb-8">
              {SCENARIOS.map((s, si) => (
                <div key={s.id}>
                  <div className="text-xs text-zinc-600 font-mono mb-2">SCENARIO {si + 1} / {SCENARIOS.length}</div>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">{s.q}</p>
                  <div className="space-y-2">
                    {s.opts.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers((p) => ({ ...p, [s.id]: opt }))}
                        className={`w-full text-left px-4 py-3 rounded text-xs font-mono leading-relaxed transition-all ${
                          answers[s.id] === opt
                            ? 'bg-blue-950/50 border border-blue-700/60 text-blue-300'
                            : 'bg-zinc-800/40 border border-zinc-800/60 text-zinc-500 hover:border-zinc-600/60 hover:text-zinc-400'
                        }`}
                      >
                        <span className="text-zinc-700 mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('calibration')}
              disabled={!allAnswered}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 border border-zinc-700/60 text-zinc-400 font-mono text-xs tracking-[0.3em] rounded transition-colors"
            >
              CONTINUE TO CALIBRATION →
            </button>
          </motion.div>
        )}

        {step === 'calibration' && (
          <motion.div key="calibration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-8 mb-8">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-600 tracking-[0.25em]">ALLIANCE PREFERENCE</span>
                  <span className="text-blue-400">{(alliance * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={alliance}
                  onChange={(e) => setAlliance(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-zinc-700 font-mono mt-1">
                  <span>SOVEREIGN</span><span>DIPLOMAT</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-600 tracking-[0.25em]">MANIPULATION TENDENCY</span>
                  <span className="text-red-400">{(manip * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={manip}
                  onChange={(e) => setManip(parseFloat(e.target.value))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-xs text-zinc-700 font-mono mt-1">
                  <span>DIRECT</span><span>PHANTOM</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('scenarios')}
                className="px-5 py-3 border border-zinc-700/60 text-zinc-600 font-mono text-xs rounded hover:border-zinc-600 transition-colors">
                ← BACK
              </button>
              <button onClick={() => void generate()} disabled={busy}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs tracking-[0.3em] rounded transition-colors">
                {busy ? 'ANALYZING...' : 'GENERATE ARCHETYPE'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'result' && profile && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-xs text-zinc-600 font-mono tracking-[0.4em] mb-3">CLASSIFICATION COMPLETE</div>
            <div className="text-3xl font-bold text-zinc-100 font-mono tracking-wider mb-8">{profile.archetype.toUpperCase()}</div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'TRUST',        val: profile.trust_tendency,        color: 'text-blue-400' },
                { label: 'MANIPULATION', val: profile.manipulation_tendency, color: 'text-red-400' },
                { label: 'ALLIANCE',     val: profile.alliance_tendency,     color: 'text-emerald-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="bg-zinc-800/50 rounded p-3">
                  <div className="text-xs text-zinc-600 font-mono mb-1">{label}</div>
                  <div className={`text-xl font-bold font-mono ${color}`}>{(val * 100).toFixed(0)}</div>
                </div>
              ))}
            </div>

            {profile.similar_characters.length > 0 && (
              <div className="text-left mb-6">
                <div className="text-xs text-zinc-600 font-mono tracking-[0.25em] mb-3">CLOSEST ARCHETYPES</div>
                {profile.similar_characters.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800/50 last:border-0">
                    <span className="text-sm text-zinc-300 font-mono">{String(c.name ?? c.id)}</span>
                    <span className="text-xs text-zinc-600 font-mono">{(Number(c.similarity) * 100).toFixed(1)}% MATCH</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => { setStep('scenarios'); setProfile(null); setAnswers({}); setAlliance(0.5); setManip(0.5); }}
              className="px-6 py-2.5 border border-zinc-700/60 text-zinc-600 font-mono text-xs rounded hover:border-zinc-500 hover:text-zinc-400 transition-colors"
            >
              RE-ANALYZE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
