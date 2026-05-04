"use client";

import { useCallback, useEffect, useState } from "react";

const PREFIX = "cos-os:v1:";

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("cos-os:storage", { detail: { key } }));
  } catch {}
}

export function clearStorage(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFIX + key);
  window.dispatchEvent(new CustomEvent("cos-os:storage", { detail: { key } }));
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStorage(key, initial));
    setHydrated(true);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string } | undefined;
      if (!detail || detail.key === key) {
        setValue(readStorage(key, initial));
      }
    };
    window.addEventListener("cos-os:storage", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("cos-os:storage", handler);
      window.removeEventListener("storage", handler);
    };
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated] as const;
}
