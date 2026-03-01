import type { StreakData, Difficulty } from '../api/types';
import { DifficultySelector } from './DifficultySelector';

interface HeaderProps {
  streak: StreakData;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function Header({ streak, difficulty, onDifficultyChange }: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-700">
      <h1 className="text-xl font-bold text-white tracking-tight">
        Turf Trails
      </h1>
      <div className="flex items-center gap-4">
        <DifficultySelector value={difficulty} onChange={onDifficultyChange} />
        <div className="flex gap-4 text-sm">
          <div className="text-gray-300">
            Streak:{' '}
            <span className="font-bold text-amber-400">{streak.current}</span>
          </div>
          <div className="text-gray-400">
            Best:{' '}
            <span className="font-bold text-amber-500">{streak.best}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
