'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterProfilePanel } from '@/components/CharacterProfilePanel';
import { api } from '@/lib/api';
import type { Character, CharacterRelationship } from '@/types';

interface Message { role: 'user' | 'agent'; text: string; }

const REL_COLORS: Record<string, string> = {
  MANIPULATES: 'text-red-400',
  ALLIES_WITH:  'text-emerald-400',
  RIVALS:       'text-orange-400',
  PROTECTS:     'text-blue-400',
  DECEIVES:     'text-fuchsia-400',
  DISTRUSTS:    'text-zinc-500',
  INFLUENCES:   'text-yellow-400',
};

export default function CharacterDetailPage() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const id       = params?.id ?? '';
  const msgEnd   = useRef<HTMLDivElement>(null);

  const [character,      setCharacter]      = useState<Character | null>(null);
  const [relationships,  setRelationships]  = useState<CharacterRelationship[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [input,          setInput]          = useState('');
  const [trust,          setTrust]          = useState(0.5);
  const [sending,        setSending]        = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.getCharacter(id), api.getRelationships(id)])
      .then(([char, rels]) => { setCharacter(char); setRelationships(rels); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    msgEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !id || sending) return;
    setInput('');
    setSending(true);
    setMessages((p) => [...p, { role: 'user', text }]);
    try {
      const res = await api.interact(id, text, trust);
      setMessages((p) => [...p, { role: 'agent', text: res.response }]);
    } catch {
      setMessages((p) => [...p, { role: 'agent', text: '[SIGNAL LOST — RETRY]' }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-700 font-mono text-xs tracking-[0.4em] animate-pulse">RETRIEVING PROFILE...</span>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center flex-col gap-4">
        <div className="text-red-500 font-mono text-sm">AGENT NOT FOUND</div>
        <Link href="/dashboard" className="text-zinc-600 font-mono text-xs hover:text-zinc-400">← RETURN TO NETWORK</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800/80 px-5 py-2.5 flex items-center gap-3">
        <Link href="/dashboard" className="text-zinc-600 font-mono text-xs hover:text-zinc-400 transition-colors">← NETWORK</Link>
        <span className="text-zinc-700 font-mono text-xs">/</span>
        <span className="text-zinc-400 font-mono text-xs">{character.name.toUpperCase()}</span>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-5">
          <CharacterProfilePanel character={character} />

          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-5">
            <div className="text-xs text-zinc-600 font-mono tracking-[0.3em] mb-4">RELATIONSHIP MATRIX</div>
            <div className="space-y-0">
              {relationships.slice(0, 12).map((r, i) => (
                <motion.div
                  key={`${r.target_id}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between py-2 border-b border-zinc-800/40 last:border-0"
                >
                  <button
                    onClick={() => router.push(`/character/${r.target_id}`)}
                    className="text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
                  >
                    {r.target_name}
                  </button>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${REL_COLORS[r.rel_type] ?? 'text-zinc-500'}`}>{r.rel_type}</span>
                    <span className="text-xs font-mono text-zinc-700">{(r.weight * 100).toFixed(0)}%</span>
                  </div>
                </motion.div>
              ))}
              {relationships.length === 0 && (
                <div className="text-xs text-zinc-700 font-mono py-4">NO RELATIONSHIPS MAPPED</div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Interaction terminal */}
        <div
          className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg flex flex-col"
          style={{ height: 580 }}
        >
          <div className="shrink-0 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-600 tracking-[0.3em]">INTERACTION TERMINAL</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-700">TRUST</span>
              <input
                type="range" min="0" max="1" step="0.05" value={trust}
                onChange={(e) => setTrust(parseFloat(e.target.value))}
                className="w-20 h-1 accent-blue-500"
              />
              <span className="text-xs font-mono text-zinc-400 w-8">{(trust * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-700 font-mono text-xs text-center mt-10"
                >
                  Initiate contact. Responses vary by trust level and graph state.
                </motion.div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={m.role === 'user' ? 'text-right' : 'text-left'}
                >
                  <span className={`inline-block px-3 py-2 rounded text-xs font-mono max-w-xs break-words ${
                    m.role === 'user'
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                      : 'bg-zinc-800/80 text-zinc-300'
                  }`}>
                    {m.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {sending && (
              <div className="text-zinc-700 font-mono text-xs animate-pulse">processing...</div>
            )}
            <div ref={msgEnd} />
          </div>

          <div className="shrink-0 px-4 py-3 border-t border-zinc-800/80 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void sendMessage(); }}
              placeholder="Transmit message..."
              className="flex-1 bg-zinc-800/60 border border-zinc-700/60 rounded px-3 py-2 text-xs text-zinc-300 font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={sending || !input.trim()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-500 hover:text-zinc-300 font-mono text-xs rounded transition-colors disabled:opacity-40"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
