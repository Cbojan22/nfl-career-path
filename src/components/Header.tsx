import type { StreakData, Difficulty } from '../api/types';
import { DifficultySelector } from './DifficultySelector';

interface HeaderProps {
  streak: StreakData;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function Header({ streak, difficulty, onDifficultyChange }: HeaderProps) {
  return (
    <header className="flex flex-col items-center gap-3 px-4 pt-6 pb-4">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">
        Turf Trails
      </h1>
      <DifficultySelector value={difficulty} onChange={onDifficultyChange} />
      <div className="flex gap-6 text-sm">
        <div className="text-gray-300">
          Streak:{' '}
          <span className="font-bold text-amber-400">{streak.current}</span>
        </div>
        <div className="text-gray-400">
          Best:{' '}
          <span className="font-bold text-amber-500">{streak.best}</span>
        </div>
      </div>
    </header>
  );
}
