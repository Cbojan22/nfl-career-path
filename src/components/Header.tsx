import type { StreakData } from '../api/types';

interface HeaderProps {
  streak: StreakData;
}

export function Header({ streak }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
      <h1 className="text-xl font-bold text-white tracking-tight">
        NFL Career Path
      </h1>
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
    </header>
  );
}
