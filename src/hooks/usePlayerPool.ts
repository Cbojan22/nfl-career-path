import { useState, useEffect, useCallback, useRef } from 'react';
import { loadPlayerPool } from '../api/playerService';
import type { RosterPlayer, Difficulty } from '../api/types';

export function usePlayerPool(difficulty: Difficulty) {
  const [pool, setPool] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recentlyShown = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    // Reset state when difficulty changes
    setLoading(true);
    setError(null);
    setPool([]);
    recentlyShown.current.clear();

    loadPlayerPool(difficulty)
      .then((players) => {
        if (!cancelled) {
          setPool(players);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load players');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [difficulty]);

  const pickRandomPlayer = useCallback((): RosterPlayer | null => {
    if (pool.length === 0) return null;

    // Filter out recently shown, but reset if we've shown most
    const available = pool.filter((p) => !recentlyShown.current.has(p.id));
    const candidates = available.length > 0 ? available : pool;

    if (available.length === 0) {
      recentlyShown.current.clear();
    }

    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    recentlyShown.current.add(pick.id);

    // Keep recently shown list manageable
    if (recentlyShown.current.size > 50) {
      const arr = Array.from(recentlyShown.current);
      recentlyShown.current = new Set(arr.slice(-25));
    }

    return pick;
  }, [pool]);

  return { pool, loading, error, pickRandomPlayer };
}
