import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  RefreshCw,
  Layers,
  Sparkles,
  Filter,
  ChevronUp,
} from "lucide-react";
import "./_group.css";

const POSTS = [
  {
    id: "1",
    author: { name: "Astromancer", username: "astro", avatar: "A" },
    type: "Destiny",
    content:
      "Following the pull of a new frequency. The stars align when you stop searching. ✦",
    time: "2h ago",
    metrics: { spark: 128, sync: 42, depth: 12 },
    color: "from-purple-500/20 to-indigo-900/40",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/50",
  },
  {
    id: "2",
    author: { name: "Aurelia", username: "aurelia", avatar: "Au" },
    type: "Voice",
    content:
      "late-night voice note dropped — my thoughts on the simulation hypothesis 🎙",
    time: "4h ago",
    metrics: { spark: 342, sync: 89, depth: 56 },
    color: "from-blue-500/20 to-cyan-900/40",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  },
  {
    id: "3",
    author: { name: "Zenith", username: "zen", avatar: "Z" },
    type: "Note",
    content:
      "Sometimes the most cosmic thing you can do is be fully present on Earth.",
    time: "5h ago",
    metrics: { spark: 890, sync: 124, depth: 88 },
    color: "from-fuchsia-500/20 to-pink-900/40",
    badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50",
  },
  {
    id: "4",
    author: { name: "Noxveil", username: "noxveil", avatar: "N" },
    type: "Project",
    content:
      "Building something wild. Phase 1 complete. Who wants early access?",
    time: "8h ago",
    metrics: { spark: 56, sync: 12, depth: 4 },
    color: "from-emerald-500/20 to-teal-900/40",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  },
  {
    id: "5",
    author: { name: "Oracle", username: "oracle", avatar: "O" },
    type: "Poll",
    content: "What resonates more — Depth or Sync? Vote below.",
    time: "12h ago",
    metrics: { spark: 234, sync: 444, depth: 333 },
    color: "from-orange-500/20 to-amber-900/40",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  },
];

export function ResonancePulse() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Background particles
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 3 + 2}s`,
  }));

  return (
    <div className="w-full h-screen bg-[#05010a] overflow-hidden flex items-center justify-center relative font-sans">
      {/* Ambient Background */}
      <div className="absolute inset-0 cosmic-bg opacity-60"></div>

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}

      {/* Main Device Frame */}
      <div className="relative w-[390px] h-[844px] bg-black rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Top Status Bar Area */}
        <div className="absolute top-0 w-full h-12 z-50 flex justify-between items-center px-6 pointer-events-none">
          <div className="text-white/70 text-xs font-medium">9:41</div>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-full border border-white/30"></div>
            <div className="w-4 h-4 rounded-full border border-white/30"></div>
          </div>
        </div>

        {/* Orbit Filter Drawer Hint */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 glass-panel py-4 px-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
          <div className="w-2 h-2 rounded-full bg-white/20"></div>
          <Filter className="w-4 h-4 text-white/50 mt-2" />
        </div>

        {/* Posts Pager */}
        <div className="flex-1 relative w-full h-full">
          {/* Current Post */}
          <div
            className={`absolute inset-0 w-full h-full flex flex-col justify-between p-6 pt-16 pb-24 bg-gradient-to-b ${POSTS[activeIndex].color}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white/10">
                  <AvatarFallback className="bg-zinc-800 text-white">
                    {POSTS[activeIndex].author.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium text-sm">
                    {POSTS[activeIndex].author.name}
                  </div>
                  <div className="text-white/50 text-xs">
                    @{POSTS[activeIndex].author.username} •{" "}
                    {POSTS[activeIndex].time}
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`rounded-full px-3 py-1 text-xs ${POSTS[activeIndex].badgeColor}`}
              >
                {POSTS[activeIndex].type}
              </Badge>
            </div>

            <div className="flex-1 flex items-center justify-center px-2">
              <h2 className="text-3xl text-white font-semibold tracking-tight text-center leading-snug glow-text">
                {POSTS[activeIndex].content}
              </h2>
            </div>

            {/* Metrics Dock */}
            <div className="glass-panel rounded-2xl p-4 flex justify-around items-center mb-8">
              <button className="flex flex-col items-center gap-1 group">
                <Sparkles className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span className="text-white/70 text-xs font-medium">
                  {POSTS[activeIndex].metrics.spark}
                </span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <RefreshCw className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="text-white/70 text-xs font-medium">
                  {POSTS[activeIndex].metrics.sync}
                </span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <Layers className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <span className="text-white/70 text-xs font-medium">
                  {POSTS[activeIndex].metrics.depth}
                </span>
              </button>
            </div>
          </div>

          {/* Next Post Peeking */}
          <div
            className={`absolute -bottom-[85%] left-0 w-full h-full bg-gradient-to-b ${POSTS[(activeIndex + 1) % POSTS.length].color} opacity-40 rounded-t-[3rem] blur-sm transition-transform`}
          ></div>

          {/* Swipe Up Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-50">
            <ChevronUp className="w-6 h-6 text-white" />
            <span className="text-white text-[10px] tracking-widest uppercase">
              Pulse
            </span>
          </div>

          {/* Scroll Progress Indicator */}
          <div className="absolute right-2 top-1/4 bottom-1/4 w-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="w-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ height: `${((activeIndex + 1) / POSTS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
