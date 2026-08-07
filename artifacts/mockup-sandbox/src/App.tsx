import { useEffect, useState, type ComponentType } from "react";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

const PREVIEWS = [
  {
    id: "ConstellationFeed",
    path: "elysium-feed/ConstellationFeed",
    title: "Constellation Feed",
    desc: "Interactive spatial graph with energy connections & modal orbits",
    icon: "✦",
    color: "#B57BFF",
  },
  {
    id: "ResonancePulse",
    path: "elysium-feed/ResonancePulse",
    title: "Resonance Pulse",
    desc: "Mobile cosmic device with ambient particles & resonance dock",
    icon: "⚡",
    color: "#5EEAD4",
  },
  {
    id: "AmbientLayers",
    path: "elysium-feed/AmbientLayers",
    title: "Ambient Layers",
    desc: "Horizon story stack with ambient gradients & live timeline",
    icon: "🪐",
    color: "#FFD56B",
  },
  {
    id: "FrequencyBoard",
    path: "elysium-feed/FrequencyBoard",
    title: "Frequency Board",
    desc: "Live broadcast tuner with frequency scan & masonry tiles",
    icon: "🎙",
    color: "#F472B6",
  },
];

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = componentPath.startsWith("./components/mockups/")
        ? componentPath
        : componentPath.includes("/")
          ? `./components/mockups/${componentPath}.tsx`
          : `./components/mockups/elysium-feed/${componentPath}.tsx`;

      const loader = modules[key] || modules[`./components/mockups/elysium-feed/${componentPath}.tsx`];
      if (!loader) {
        setError(`No component found for path: ${componentPath}`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "#FB7185", padding: "2rem", fontFamily: "monospace", background: "#07021A" }}>
        {error}
      </pre>
    );
  }

  if (!Component) {
    return (
      <div className="min-h-screen bg-[#07021A] flex items-center justify-center text-purple-300 font-mono text-sm animate-pulse">
        ✦ Tuning to resonance frequency...
      </div>
    );
  }

  return <Component />;
}

function getBasePath(): string {
  return (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const initialPreview = getPreviewPath() || "elysium-feed/ConstellationFeed";
  const [activeTab, setActiveTab] = useState<string>(initialPreview);

  const activeDef = PREVIEWS.find(
    (p) => p.path === activeTab || p.id === activeTab || activeTab.endsWith(p.id)
  ) || PREVIEWS[0];

  return (
    <div className="min-h-screen bg-[#07021A] text-slate-100 flex flex-col font-sans">
      {/* Top Elysium Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0E0524]/90 backdrop-blur-md border-b border-purple-900/30 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_12px_rgba(181,123,255,0.6)] font-bold text-white text-sm">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">ELYSIUM</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Live UI Preview
              </span>
            </div>
            <p className="text-[11px] text-purple-300/70 hidden sm:block">
              Original spatial & dynamic social UI components
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#170A2E] p-1 rounded-full border border-purple-900/40">
          {PREVIEWS.map((p) => {
            const isActive =
              activeTab === p.path ||
              activeTab === p.id ||
              activeTab.endsWith(p.id);
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActiveTab(p.path);
                  const basePath = getBasePath();
                  window.history.replaceState(null, "", `${basePath}/preview/${p.path}`);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(181,123,255,0.4)]"
                    : "text-purple-200/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{p.icon}</span>
                <span className="hidden md:inline">{p.title}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Preview Frame */}
      <main className="flex-1 relative flex items-center justify-center p-0 md:p-6 overflow-auto">
        <div className="w-full h-full max-w-6xl flex items-center justify-center">
          <PreviewRenderer
            componentPath={activeDef.path}
            modules={discoveredModules}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

