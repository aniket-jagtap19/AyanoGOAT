'use client';

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { GraphData } from '@/types';

/* Local types matching force-graph's internal NodeObject / LinkObject */
interface FGNode extends Record<string, unknown> {
  id: string;
  name: string;
  color: string;
  val: number;
  influence_score: number;
  faction: string;
  class_name: string;
  x?: number;
  y?: number;
}

interface FGLink extends Record<string, unknown> {
  source: string | FGNode;
  target: string | FGNode;
  color: string;
  weight: number;
  rel_type: string;
}

interface FGProps {
  graphData: { nodes: FGNode[]; links: FGLink[] };
  width: number;
  height: number;
  backgroundColor: string;
  nodeId: string;
  nodeLabel: string;
  nodeColor: (n: FGNode) => string;
  nodeVal: (n: FGNode) => number;
  linkColor: (l: FGLink) => string;
  linkWidth: (l: FGLink) => number;
  onNodeClick: (n: FGNode) => void;
  nodeCanvasObjectMode: () => string;
  nodeCanvasObject: (n: FGNode, ctx: CanvasRenderingContext2D, gs: number) => void;
  linkDirectionalArrowLength?: number;
  linkDirectionalArrowRelPos?: number;
  d3VelocityDecay?: number;
  cooldownTicks?: number;
}

const ForceGraph2D = dynamic<FGProps>(
  () => import('react-force-graph-2d').then((m) => m.default as ComponentType<FGProps>),
  { ssr: false }
);

interface Props {
  data: GraphData;
  onNodeClick?: (nodeId: string, nodeName: string) => void;
  width?: number;
  height?: number;
}

export function InteractiveGraph({ data, onNodeClick, width = 900, height = 600 }: Props) {
  const handleClick = useCallback(
    (n: FGNode) => { onNodeClick?.(String(n.id), String(n.name)); },
    [onNodeClick]
  );

  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-zinc-700 font-mono text-xs tracking-[0.4em]">NO NODES</span>
      </div>
    );
  }

  const fgData = {
    nodes: data.nodes as unknown as FGNode[],
    links: data.links as unknown as FGLink[],
  };

  return (
    <ForceGraph2D
      graphData={fgData}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      nodeId="id"
      nodeLabel="name"
      nodeColor={(n: FGNode) => String(n.color ?? '#60a5fa')}
      nodeVal={(n: FGNode) => Number(n.val ?? 5)}
      linkColor={(l: FGLink) => String(l.color ?? '#27272a')}
      linkWidth={(l: FGLink) => Math.max(0.5, Number(l.weight ?? 0.5) * 2.5)}
      onNodeClick={handleClick}
      nodeCanvasObjectMode={() => 'after'}
      nodeCanvasObject={(n: FGNode, ctx: CanvasRenderingContext2D, gs: number) => {
        if (n.x === undefined || n.y === undefined) return;
        const fontSize = Math.max(7, 10 / gs);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = 'rgba(244,244,245,0.65)';
        ctx.textAlign = 'center';
        ctx.fillText(String(n.name), n.x, n.y + Number(n.val ?? 5) / gs + fontSize + 1);
      }}
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      d3VelocityDecay={0.28}
      cooldownTicks={150}
    />
  );
}
