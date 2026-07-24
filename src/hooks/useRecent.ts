import { useCallback, useEffect, useState } from 'react';

const KEY = 'psc.recent.v1';

export interface RecentEntry {
  slug: string;
  title: string;
  at: number;
}

function read(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentEntry[];
    if (!Array.isArray(arr)) return [];
    return arr.filter((r) => r && typeof r.slug === 'string');
  } catch {
    return [];
  }
}

function write(list: RecentEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 12)));
  } catch {
    /* no-op */
  }
}

export function useRecent() {
  const [recent, setRecent] = useState<RecentEntry[]>(() => read());

  useEffect(() => {
    const onStorage = () => setRecent(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const track = useCallback((slug: string, title: string) => {
    setRecent((prev) => {
      const next = [{ slug, title, at: Date.now() }, ...prev.filter((r) => r.slug !== slug)].slice(0, 12);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    write([]);
  }, []);

  return { recent, track, clear };
}
