import type { GamePlayer } from '../../api/types';

interface PlayerRevealProps {
  player: GamePlayer;
  isCorrect: boolean;
  onNext: () => void;
}

export function PlayerReveal({ player, isCorrect, onNext }: PlayerRevealProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 animate-fade-in">
      <div
        className={`text-lg font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
      >
        {isCorrect ? 'Correct!' : 'Wrong!'}
      </div>
      <div className="flex items-center gap-4">
        <img
          src={player.headshotUrl}
          alt={player.fullName}
          className="w-20 h-20 rounded-full object-cover bg-gray-700 border-2 border-gray-600"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23374151" width="80" height="80"/><text x="40" y="45" text-anchor="middle" fill="%239CA3AF" font-size="12">?</text></svg>';
          }}
        />
        <div>
          <div className="text-xl font-bold text-white">{player.fullName}</div>
          <div className="text-sm text-gray-400">{player.position}</div>
        </div>
      </div>
      <button
        onClick={onNext}
        className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        autoFocus
      >
        Next Player
      </button>
    </div>
  );
}
