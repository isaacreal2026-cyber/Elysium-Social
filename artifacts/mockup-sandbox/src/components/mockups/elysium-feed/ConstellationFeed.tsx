import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Disc, Star, Zap, Activity } from 'lucide-react';
import './_group.css';

interface NodeData {
  id: string;
  author: string;
  content: string;
  energy: number;
  kind: string;
  x: number;
  y: number;
}

const NODES: NodeData[] = [
  { id: 'center', author: '@aurelia', content: 'The alignment is undeniable now.', energy: 95, kind: 'Destiny', x: 50, y: 50 },
  { id: 'n1', author: '@stellarwave', content: 'Patterns everywhere.', energy: 78, kind: 'Note', x: 25, y: 30 },
  { id: 'n2', author: '@noxveil', content: 'New sound uploaded 🎙', energy: 65, kind: 'Voice', x: 75, y: 30 },
  { id: 'n3', author: '@cosmos.arc', content: 'Phase 2 launches soon.', energy: 88, kind: 'Project', x: 85, y: 65 },
  { id: 'n4', author: '@voidwalker', content: 'Silence or Music?', energy: 45, kind: 'Poll', x: 50, y: 85 },
  { id: 'n5', author: '@mirra', content: 'Why does this feel like memory?', energy: 72, kind: 'Question', x: 15, y: 65 },
  { id: 'n6', author: '@stellarwave', content: 'Present. Grounded. Alive.', energy: 55, kind: 'Note', x: 35, y: 70 },
];

const CONNECTIONS = [
  ['center', 'n1'],
  ['center', 'n2'],
  ['center', 'n3'],
  ['center', 'n4'],
  ['center', 'n5'],
  ['center', 'n6'],
  ['n1', 'n2'],
  ['n3', 'n4'],
  ['n5', 'n6'],
  ['n1', 'n5'],
];

export function ConstellationFeed() {
  const [activeNode, setActiveNode] = useState<string>('center');
  const [filter, setFilter] = useState('Local Cluster');

  const filters = ['Local Cluster', 'Deep Space', 'Following', 'Trending Signals'];

  return (
    <div className="relative w-full h-[100dvh] bg-[#080815] constellation-starfield overflow-hidden text-slate-200 font-sans">
      {/* Orbit Filters */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-center gap-6 bg-gradient-to-b from-[#080815] to-transparent">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm tracking-widest uppercase transition-all duration-300 ${
              filter === f
                ? 'text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                : 'text-slate-500 hover:text-purple-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.4))' }}>
        {CONNECTIONS.map(([id1, id2], i) => {
          const n1 = NODES.find(n => n.id === id1)!;
          const n2 = NODES.find(n => n.id === id2)!;
          return (
            <line
              key={i}
              x1={`${n1.x}%`}
              y1={`${n1.y}%`}
              x2={`${n2.x}%`}
              y2={`${n2.y}%`}
              stroke="url(#line-grad)"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          );
        })}
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>

      {/* Nodes Container */}
      <div className="absolute inset-0 z-10 animate-float-node">
        {NODES.map((node) => {
          const isActive = activeNode === node.id;
          const size = Math.max(30, node.energy * 0.8);
          
          return (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {/* The Glowing Orb */}
              <button
                onClick={() => setActiveNode(isActive ? '' : node.id)}
                className={`relative rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 ${isActive ? 'scale-125 z-50' : 'z-40'}`}
                style={{
                  width: size,
                  height: size,
                  background: 'radial-gradient(circle at center, #a855f7 0%, #1e1b4b 70%, #000000 100%)',
                  boxShadow: isActive 
                    ? '0 0 30px rgba(168, 85, 247, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.3)' 
                    : '0 0 15px rgba(168, 85, 247, 0.4), inset 0 0 8px rgba(255, 255, 255, 0.1)',
                  border: isActive ? '2px solid rgba(168, 85, 247, 0.8)' : '1px solid rgba(168, 85, 247, 0.3)'
                }}
              >
                {/* Core Spark */}
                <div className="absolute w-2 h-2 rounded-full bg-white opacity-80" style={{ boxShadow: '0 0 10px #fff' }} />
                
                {/* Pulse ring for active */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border border-purple-400 animate-ping opacity-20" />
                )}
              </button>

              {/* Node Card / Tooltip */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-64 p-5 rounded-2xl z-50 backdrop-blur-xl border border-white/10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(8, 8, 21, 0.95) 100%)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(168, 85, 247, 0.2) inset'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-300 font-mono text-xs">{node.author}</span>
                      <span className="flex items-center text-teal-300 text-xs font-semibold gap-1">
                        <Activity size={12} /> {node.energy}
                      </span>
                    </div>
                    
                    <p className="text-slate-100 text-base leading-relaxed mb-4">
                      {node.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <span className="text-xs uppercase tracking-wider text-slate-500">{node.kind}</span>
                      <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5">
                        <Star size={14} className="text-amber-400" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Bottom Nav Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none opacity-50 text-xs tracking-widest text-purple-200">
        <div className="flex items-center gap-2"><Disc size={14} className="animate-spin-slow" /> SCANNING</div>
      </div>
    </div>
  );
}
