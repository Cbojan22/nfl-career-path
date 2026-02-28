import { useState, useCallback, useEffect } from 'react';
import type { StreakData, Difficulty } from '../api/types';

function getStreakKey(difficulty: Difficulty): string {
  return `nfl-game-streak-${difficulty}`;
}

function loadStreak(difficulty: Difficulty): StreakData {
  try {
    const raw = localStorage.getItem(getStreakKey(difficulty));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { current: 0, best: 0 };
}

function saveStreak(difficulty: Difficulty, data: StreakData) {
  try {
    localStorage.setItem(getStreakKey(difficulty), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useStreak(difficulty: Difficulty) {
  const [streak, setStreak] = useState<StreakData>(() => loadStreak(difficulty));

  useEffect(() => {
    setStreak(loadStreak(difficulty));
  }, [difficulty]);

  const recordCorrect = useCallback(() => {
    setStreak((prev) => {
      const next = {
        current: prev.current + 1,
        best: Math.max(prev.best, prev.current + 1),
      };
      saveStreak(difficulty, next);
      return next;
    });
  }, [difficulty]);

  const recordIncorrect = useCallback(() => {
    setStreak((prev) => {
      const next = { ...prev, current: 0 };
      saveStreak(difficulty, next);
      return next;
    });
  }, [difficulty]);

  return { streak, recordCorrect, recordIncorrect };
}
