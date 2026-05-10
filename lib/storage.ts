"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEYS = {
  tasks: "mc.tasks.v1",
  crons: "mc.crons.v1",
  projects: "mc.projects.v1",
  hydrated: "mc.hydrated.v1",
} as const;

export const STORAGE = STORAGE_KEYS;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return safeParse<T>(window.localStorage.getItem(key), fallback);
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

/**
 * useLocalCollection — hydration-safe localStorage-backed state.
 * Initial render uses `seed` so SSR markup matches. After mount we
 * read localStorage (seeding it if empty) and re-render with real data.
 */
export function useLocalCollection<T>(key: string, seed: T) {
  const [value, setValue] = useState<T>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      window.localStorage.setItem(key, JSON.stringify(seed));
      setValue(seed);
    } else {
      setValue(safeParse<T>(raw, seed));
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (p: T) => T)(prev)
            : updater;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(next));
        }
        return next;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
