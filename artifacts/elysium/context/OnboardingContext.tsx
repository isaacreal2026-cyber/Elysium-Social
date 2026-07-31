import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { loadJSON, saveJSON } from "@/lib/storage";
import { useResonance } from "@/context/ResonanceContext";

interface OnboardingCtxValue {
  completed: boolean;
  step: number;           // 0..5
  selfName: string;
  selfBio: string;
  selfCity: string;
  selectedTags: string[];
  selectedDestinations: string[];
  importedFriendIds: string[];
  setStep: (s: number) => void;
  setSelfName: (n: string) => void;
  setSelfBio: (b: string) => void;
  setSelfCity: (c: string) => void;
  toggleTag: (t: string) => void;
  toggleDestination: (d: string) => void;
  importFriend: (id: string) => void;
  removeImportedFriend: (id: string) => void;
  complete: () => void;
  skip: () => void;
}

export const OnboardingCtx = createContext<OnboardingCtxValue | null>(null);

const STORAGE_KEY = "onboarding-completed";

const ALL_TAGS = [
  "builder", "synth-curious", "night-walker", "composer", "introvert",
  "deep-listener", "dev", "minimalist", "collector", "writer", "wanderer",
  "warm", "founder", "empath", "strategist", "audio", "thoughtful",
  "late-bloomer", "filmmaker", "patient", "color-obsessed", "chef", "host",
  "traveler", "curious", "creative",
];

const ALL_DESTINATIONS = [
  "Lisbon", "Berlin", "Seoul", "Beirut", "CDMX", "Edinburgh", "Lagos", "Lyon",
  "Sound", "Healing", "Founders", "Travel", "Dev", "Poetry", "Sleep",
  "StartupLife", "OSS", "Game-dev", "Film", "Food", "Slow", "Nature",
  "Mental-health",
];

export { ALL_TAGS, ALL_DESTINATIONS };

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const resonance = useResonance();
  const [completed, setCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [selfName, setSelfName] = useState("");
  const [selfBio, setSelfBio] = useState("");
  const [selfCity, setSelfCity] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [importedFriendIds, setImportedFriendIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await loadJSON<boolean>(STORAGE_KEY, false);
      if (mounted && stored) setCompleted(true);
      setHydrated(true);
    })();
    return () => { mounted = false; };
  }, []);

  const toggleTag = useCallback((t: string) => {
    setSelectedTags((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
    );
  }, []);

  const toggleDestination = useCallback((d: string) => {
    setSelectedDestinations((cur) =>
      cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d],
    );
  }, []);

  const importFriend = useCallback((id: string) => {
    setImportedFriendIds((cur) => cur.includes(id) ? cur : [...cur, id]);
    resonance.toggleFollow(id);
  }, [resonance]);

  const removeImportedFriend = useCallback((id: string) => {
    setImportedFriendIds((cur) => cur.filter((x) => x !== id));
    resonance.toggleFollow(id);
  }, [resonance]);

  const complete = useCallback(() => {
    // Update the self user profile
    resonance.updateSelfProfile({
      name: selfName || resonance.userById(resonance.selfId)?.name || "You",
      bio: selfBio || resonance.userById(resonance.selfId)?.bio || "",
      city: selfCity || resonance.userById(resonance.selfId)?.city || "",
      tags: selectedTags,
      destinations: selectedDestinations,
    });
    setCompleted(true);
    void saveJSON(STORAGE_KEY, true);
  }, [resonance, selfName, selfBio, selfCity, selectedTags, selectedDestinations]);

  const skip = useCallback(() => {
    setCompleted(true);
    void saveJSON(STORAGE_KEY, true);
  }, []);

  if (!hydrated) return null;

  // If onboarding already done, skip rendering
  if (completed) return <>{children}</>;

  const value: OnboardingCtxValue = {
    completed,
    step,
    selfName,
    selfBio,
    selfCity,
    selectedTags,
    selectedDestinations,
    importedFriendIds,
    setStep,
    setSelfName,
    setSelfBio,
    setSelfCity,
    toggleTag,
    toggleDestination,
    importFriend,
    removeImportedFriend,
    complete,
    skip,
  };

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  // If context is null, onboarding is completed and provider removed
  return ctx;
}
