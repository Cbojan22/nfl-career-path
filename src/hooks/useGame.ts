import { useState, useCallback } from 'react';
import { buildGamePlayer } from '../api/playerService';
import type { GamePlayer, GamePhase, RosterPlayer } from '../api/types';

export function useGame() {
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [guessedPlayerId, setGuessedPlayerId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const startRound = useCallback(async (rosterPlayer: RosterPlayer) => {
    setPhase('loading');
    setGuessedPlayerId(null);
    setLoadError(null);

    try {
      const player = await buildGamePlayer(rosterPlayer.id);

      // Skip players with no career path data
      if (player.careerPath.length === 0) {
        throw new Error('No career data');
      }

      setCurrentPlayer(player);
      setPhase('guessing');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load player');
      setPhase('loading');
      throw err; // Let caller handle retry with different player
    }
  }, []);

  const submitGuess = useCallback(
    (guessId: string): boolean => {
      setGuessedPlayerId(guessId);
      const isCorrect = guessId === currentPlayer?.id;
      setPhase(isCorrect ? 'correct' : 'incorrect');
      return isCorrect;
    },
    [currentPlayer]
  );

  const skipPlayer = useCallback(() => {
    setGuessedPlayerId(null);
    setPhase('incorrect');
  }, []);

  return {
    phase,
    currentPlayer,
    guessedPlayerId,
    loadError,
    startRound,
    submitGuess,
    skipPlayer,
  };
}
