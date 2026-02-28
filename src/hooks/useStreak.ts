import { useState, useCallback } from 'react';
import type { StreakData } from '../api/types';

const STREAK_KEY = 'nfl-game-streak';

function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { current: 0, best: 0 };
}

function saveStreak(data: StreakData) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(loadStreak);

  const recordCorrect = useCallback(() => {
    setStreak((prev) => {
      const next = {
        current: prev.current + 1,
        best: Math.max(prev.best, prev.current + 1),
      };
      saveStreak(next);
      return next;
    });
  }, []);

  const recordIncorrect = useCallback(() => {
    setStreak((prev) => {
      const next = { ...prev, current: 0 };
      saveStreak(next);
      return next;
    });
  }, []);

  return { streak, recordCorrect, recordIncorrect };
}
