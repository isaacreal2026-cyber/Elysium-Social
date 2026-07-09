import React from "react";
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

const STORIES = [
  {
    id: 1,
    author: "@aurelia",
    content: "The alignment is undeniable",
    bgClass: "bg-gradient-to-br from-purple-900 to-indigo-950",
    ringClass: "story-ring-gold",
    position: -1, // left peek
  },
  {
    id: 2,
    author: "@noxveil",
    content: "New sound in the aether 🎙",
    bgClass: "bg-gradient-to-br from-slate-900 to-teal-950",
    ringClass: "story-ring-cyan",
    position: 0, // center
  },
  {
    id: 3,
    author: "@cosmos.arc",
    content: "Phase 2 is alive",
    bgClass: "bg-gradient-to-br from-blue-950 to-violet-950",
    ringClass: "story-ring-violet",
    position: 1, // right peek
  },
];

const TIMELINE = [
  {
    id: 1,
    icon: "📝",
    author: "@stellarwave",
    content: "Patterns everywhere.",
    sparks: 3,
    time: "2m",
  },
  {
    id: 2,
    icon: "⚡",
    author: "@aurelia",
    content: "Three signs confirmed.",
    sparks: 5,
    time: "5m",
  },
  {
    id: 3,
    icon: "🎙",
    author: "@noxveil",
    content: "Ambient soundscape dropping soon",
    sparks: 2,
    time: "12m",
  },
  {
    id: 4,
    icon: "🔮",
    author: "@voidwalker",
    content: "Silence or Music? Vote.",
    sparks: 3,
    time: "18m",
  },
  {
    id: 5,
    icon: "❓",
    author: "@mirra",
    content: "Does time feel different to you?",
    sparks: 4,
    time: "25m",
  },
  {
    id: 6,
    icon: "📝",
    author: "@stellarwave",
    content: "Present. Grounded.",
    sparks: 2,
    time: "31m",
  },
];

export function AmbientLayers() {
  return (
    <div className="w-full max-w-md mx-auto h-[800px] flex flex-col bg-[#0a0514] text-slate-200 font-sans overflow-hidden relative selection:bg-indigo-500/30">
      {/* HEADER */}
      <div className="pt-12 pb-3 px-6 z-10 flex flex-col gap-4 bg-gradient-to-b from-[#0a0514] to-transparent relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium tracking-wide text-indigo-100 flex items-center gap-2">
              <span className="text-indigo-400 font-light text-xl">∿</span>{" "}
              Ambient Stream
            </h1>
            <div className="flex items-end gap-[2px] h-3 ml-2 opacity-50">
              <div
                className="w-[2px] h-full bg-indigo-400"
                style={{
                  animation: "waveform-pulse 1.2s ease-in-out infinite",
                }}
              ></div>
              <div
                className="w-[2px] h-[60%] bg-indigo-400"
                style={{
                  animation: "waveform-pulse 1.5s ease-in-out infinite 0.2s",
                }}
              ></div>
              <div
                className="w-[2px] h-[80%] bg-indigo-400"
                style={{
                  animation: "waveform-pulse 1s ease-in-out infinite 0.4s",
                }}
              ></div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-indigo-300 transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>

        {/* ORBITS TABS */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 text-sm font-medium">
          {ORBITS.map((orbit, i) => (
            <div
              key={orbit}
              className="relative whitespace-nowrap px-1 cursor-pointer group"
            >
              <span
                className={`transition-colors ${i === 0 ? "text-indigo-200" : "text-slate-500 group-hover:text-slate-300"}`}
              >
                {orbit}
              </span>
              {i === 0 && (
                <div className="absolute -bottom-1 left-0 right-0 h-[1px] bg-indigo-400/50 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ZONE 1 — STORY CANVAS (Top 45%) */}
      <div className="relative h-[40%] w-full flex items-center justify-center overflow-hidden shrink-0 mt-2">
        <div className="relative w-full h-[280px] flex items-center justify-center">
          {STORIES.map((story) => {
            const isCenter = story.position === 0;
            const isLeft = story.position === -1;
            const isRight = story.position === 1;

            return (
              <div
                key={story.id}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  transform: `translateX(${story.position * 75}%) scale(${isCenter ? 1 : 0.85})`,
                  zIndex: isCenter ? 10 : 0,
                  opacity: isCenter ? 1 : 0.5,
                }}
              >
                {/* Aura Ring */}
                {isCenter && (
                  <div
                    className={`absolute -inset-[3px] rounded-3xl ${story.ringClass} blur-[2px]`}
                  ></div>
                )}

                {/* Card Body */}
                <div
                  className={`w-[240px] h-[280px] rounded-3xl ${story.bgClass} border border-white/5 flex flex-col justify-between p-6 relative overflow-hidden shadow-2xl shadow-black/50`}
                >
                  {/* Internal ambient light */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent"></div>

                  <div className="relative z-10 text-xs font-semibold text-white/60 tracking-wider uppercase">
                    {story.author}
                  </div>

                  <div className="relative z-10 text-xl font-light text-white/90 leading-snug">
                    "{story.content}"
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Story Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(129,140,248,0.8)]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
        </div>
      </div>

      {/* ZONE 2 — AMBIENT TIMELINE (Bottom 55%) */}
      <div className="flex-1 overflow-y-auto px-4 pb-12 pt-4 relative">
        {/* Soft fade at top of timeline */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0a0514] to-transparent z-10 pointer-events-none"></div>

        <div className="flex flex-col">
          {TIMELINE.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center py-3.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="w-6 text-center text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                {item.icon}
              </div>

              <div className="flex-1 flex flex-col ml-3 justify-center min-w-0">
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="text-[13px] font-medium text-indigo-200/80 shrink-0">
                    {item.author}
                  </span>
                  <span className="text-[13px] text-slate-400 truncate">
                    · {item.content}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-3 shrink-0">
                {/* Spark dots */}
                <div className="flex gap-[2px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-[3px] h-[3px] rounded-full ${i < item.sparks ? "bg-amber-400/80 shadow-[0_0_4px_rgba(251,191,36,0.5)]" : "bg-white/10"}`}
                    ></div>
                  ))}
                </div>

                <span className="text-[11px] font-medium text-slate-600 w-6 text-right">
                  {item.time}
                </span>
              </div>
            </div>
          ))}

          <div className="py-6 text-center">
            <div className="w-1 h-1 rounded-full bg-indigo-500/30 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
