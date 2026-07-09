import React, { useState } from "react";
import "./_group.css";

const ORBITS = [
  "Vibe",
  "Moments",
  "Memories",
  "Events",
  "Friends",
  "Learning",
  "Geo Pulse",
];

const POSTS = [
  {
    id: 1,
    kind: "Note",
    author: "@stellarwave",
    text: "The universe speaks in patterns. Learn to listen.",
    stat: "2.4k sync",
    color: "#7C3AED",
  },
  {
    id: 2,
    kind: "Destiny",
    author: "@aurelia",
    text: "Three signs pointed me here today. Alignment confirmed. ✦",
    stat: "891 spark",
    color: "#14B8A6",
  },
  {
    id: 3,
    kind: "Voice",
    author: "@noxveil",
    text: "Recorded my first ambient soundscape — posting tonight 🎙",
    stat: "432 depth",
    color: "#F59E0B",
  },
  {
    id: 4,
    kind: "Project",
    author: "@cosmos.arc",
    text: "Building a resonance tracker. Progress: ███░░░ 60%",
    stat: "1.2k sync",
    color: "#3B82F6",
  },
  {
    id: 5,
    kind: "Poll",
    author: "@voidwalker",
    text: "Morning meditation: Silence or Music?",
    stat: "5.1k spark",
    color: "#EC4899",
  },
  {
    id: 6,
    kind: "Question",
    author: "@stellarwave",
    text: "Does anyone else feel time moving differently lately?",
    stat: "3.3k depth",
    color: "#8B5CF6",
  },
];

export function FrequencyBoard() {
  const [activeOrbit, setActiveOrbit] = useState("Vibe");

  return (
    <div className="w-[390px] h-[844px] bg-[#0A0A10] text-gray-200 font-sans overflow-hidden flex flex-col relative cosmic-bg">
      {/* Header */}
      <div className="pt-12 pb-4 px-4 flex flex-col items-center border-b border-white/5 relative z-10 glass-panel">
        <div className="flex items-center gap-2 text-xs font-mono text-[#7C3AED] mb-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="uppercase tracking-widest">Live Signal</span>
        </div>
        <h1 className="text-lg font-bold tracking-wide">
          Broadcasting on {activeOrbit}
        </h1>
      </div>

      {/* Tuner Bar */}
      <div className="relative py-6 border-b border-white/10 z-10 bg-black/40">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent opacity-50"></div>

        {/* Animated Scan Line */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div
            className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[freq-scan_3s_linear_infinite]"
            style={{ animation: "freq-scan 3s linear infinite" }}
          ></div>
        </div>

        <div
          className="flex overflow-x-auto tuner-scroll px-1/2 snap-x snap-mandatory relative items-center"
          style={{ paddingLeft: "50%", paddingRight: "50%" }}
        >
          <div className="flex items-end h-8 gap-8">
            {ORBITS.map((orbit) => {
              const isActive = orbit === activeOrbit;
              return (
                <button
                  key={orbit}
                  onClick={() => setActiveOrbit(orbit)}
                  className={`flex flex-col items-center gap-2 snap-center transition-all duration-300 ${isActive ? "scale-110" : "scale-90 opacity-40"}`}
                >
                  <span
                    className={`text-[10px] uppercase font-mono tracking-wider ${isActive ? "text-[#7C3AED] glow-text font-bold" : "text-gray-400"}`}
                  >
                    {orbit}
                  </span>
                  <div
                    className={`w-[2px] rounded-full transition-all duration-300 ${isActive ? "h-6 bg-[#7C3AED] shadow-[0_0_8px_#7C3AED]" : "h-3 bg-gray-600"}`}
                  ></div>
                </button>
              );
            })}
          </div>

          {/* Center line indicator */}
          <div className="absolute left-1/2 bottom-0 w-[2px] h-4 bg-white/50 -translate-x-1/2 pointer-events-none rounded-t-full"></div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-y-auto tuner-scroll p-4 z-10">
        <div className="columns-2 gap-3 space-y-3">
          {POSTS.map((post) => (
            <div
              key={post.id}
              className="break-inside-avoid relative rounded-xl p-3 bg-black/60 border border-white/5 backdrop-blur-md overflow-hidden group"
              style={{ boxShadow: `inset 0 0 20px -10px ${post.color}40` }}
            >
              {/* Kind Glow Edge */}
              <div
                className="absolute top-0 left-0 w-[2px] h-full"
                style={{
                  backgroundColor: post.color,
                  boxShadow: `0 0 10px ${post.color}`,
                }}
              ></div>

              {/* Signal Dot */}
              <div
                className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: post.color,
                  animation: "signal-pulse 2s ease-in-out infinite",
                }}
              ></div>

              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10"
                  style={{ color: post.color }}
                >
                  {post.kind}
                </span>
              </div>

              <div className="text-[10px] font-mono text-gray-500 mb-1">
                {post.author}
              </div>
              <p className="text-sm text-gray-200 leading-snug mb-3 line-clamp-3">
                {post.text}
              </p>

              <div className="flex items-center gap-1 text-[10px] font-mono opacity-60">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {post.stat}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#0A0A10] to-transparent pointer-events-none z-20"></div>
    </div>
  );
}
