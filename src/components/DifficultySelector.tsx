import type { Difficulty } from '../api/types';
import { DIFFICULTY_LABELS } from '../api/types';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'master'];

export function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-600" role="radiogroup" aria-label="Difficulty">
      {DIFFICULTIES.map((d) => (
        <button
          key={d}
          role="radio"
          aria-checked={d === value}
          onClick={() => onChange(d)}
          className={`px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
            d === value
              ? 'bg-amber-500 text-gray-900'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {DIFFICULTY_LABELS[d]}
        </button>
      ))}
    </div>
  );
}
