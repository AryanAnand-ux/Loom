import { useEffect, useState } from "react";

type Mode = "snapshot" | "poll" | null;

type DebugState = {
  uid: string | null;
  closetCount: number;
  closetMode: Mode;
  outfitsCount: number;
  outfitsMode: Mode;
};

const state: DebugState = {
  uid: null,
  closetCount: 0,
  closetMode: null,
  outfitsCount: 0,
  outfitsMode: null,
};

const listeners = new Set<() => void>();

export function setDebug(updates: Partial<DebugState>) {
  Object.assign(state, updates);
  listeners.forEach((l) => l());
}

export function useDebug() {
  const [s, setS] = useState(state);
  useEffect(() => {
    const l = () => setS({ ...state });
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return s;
}

export function getDebug() {
  return { ...state };
}
