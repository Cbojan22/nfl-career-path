import { useCallback, useEffect, useRef } from 'react';
import { Header } from './Header';
import { Timeline, TimelineSkeleton } from './Timeline/Timeline';
import { GuessInput } from './GuessInput/GuessInput';
import { PlayerReveal } from './PlayerReveal/PlayerReveal';
import { LoadingState } from './LoadingState';
import { usePlayerPool } from '../hooks/usePlayerPool';
import { useGame } from '../hooks/useGame';
import { useStreak } from '../hooks/useStreak';

export function GameContainer() {
  const { pool, loading: poolLoading, error: poolError, pickRandomPlayer } = usePlayerPool();
  const { phase, currentPlayer, loadError, startRound, submitGuess, skipPlayer } = useGame();
  const { streak, recordCorrect, recordIncorrect } = useStreak();
  const startingRound = useRef(false);

  const startNewRound = useCallback(async () => {
    if (startingRound.current) return;
    startingRound.current = true;

    // Try up to 5 players if some fail to load career data
    for (let attempt = 0; attempt < 5; attempt++) {
      const player = pickRandomPlayer();
      if (!player) break;
      try {
        await startRound(player);
        break;
      } catch {
        // Try another player
      }
    }
    startingRound.current = false;
  }, [pickRandomPlayer, startRound]);

  // Start first round when pool is ready
  useEffect(() => {
    if (!poolLoading && pool.length > 0) {
      startNewRound();
    }
  }, [poolLoading, pool.length, startNewRound]);

  const handleGuess = useCallback(
    (playerId: string) => {
      const isCorrect = submitGuess(playerId);
      if (isCorrect) {
        recordCorrect();
      } else {
        recordIncorrect();
      }
    },
    [submitGuess, recordCorrect, recordIncorrect]
  );

  const handleSkip = useCallback(() => {
    skipPlayer();
    recordIncorrect();
  }, [skipPlayer, recordIncorrect]);

  const handleNext = useCallback(() => {
    startNewRound();
  }, [startNewRound]);

  // Pool loading
  if (poolLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header streak={streak} />
        <LoadingState message="Building player pool..." />
      </div>
    );
  }

  // Pool error
  if (poolError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header streak={streak} />
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-red-400">Failed to load players: {poolError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header streak={streak} />

      <main className="max-w-3xl mx-auto py-6 flex flex-col gap-6">
        {/* Timeline */}
        <section className="bg-gray-800/50 rounded-xl border border-gray-700 mx-4">
          {phase === 'loading' ? (
            loadError ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <p className="text-red-400 text-sm">{loadError}</p>
                <button
                  onClick={handleNext}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Try another player
                </button>
              </div>
            ) : (
              <TimelineSkeleton />
            )
          ) : (
            currentPlayer && <Timeline careerPath={currentPlayer.careerPath} />
          )}
        </section>

        {/* Guess Input or Reveal */}
        <section>
          {phase === 'guessing' && (
            <GuessInput
              onGuess={handleGuess}
              onSkip={handleSkip}
              disabled={false}
            />
          )}
          {(phase === 'correct' || phase === 'incorrect') && currentPlayer && (
            <PlayerReveal
              player={currentPlayer}
              isCorrect={phase === 'correct'}
              onNext={handleNext}
            />
          )}
        </section>
      </main>
    </div>
  );
}
