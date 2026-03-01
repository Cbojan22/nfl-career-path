import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './Header';
import { Timeline, TimelineSkeleton } from './Timeline/Timeline';
import { GuessInput } from './GuessInput/GuessInput';
import { PlayerReveal } from './PlayerReveal/PlayerReveal';
import { LoadingState } from './LoadingState';
import { usePlayerPool } from '../hooks/usePlayerPool';
import { useGame } from '../hooks/useGame';
import { useStreak } from '../hooks/useStreak';
import type { Difficulty } from '../api/types';

const DIFFICULTY_STORAGE_KEY = 'nfl-game-difficulty';
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'master'] as const;

function loadSavedDifficulty(): Difficulty {
  try {
    const saved = localStorage.getItem(DIFFICULTY_STORAGE_KEY);
    if (saved && (VALID_DIFFICULTIES as readonly string[]).includes(saved)) {
      return saved as Difficulty;
    }
  } catch {
    // localStorage unavailable
  }
  return 'easy';
}

export function GameContainer() {
  const [difficulty, setDifficulty] = useState<Difficulty>(loadSavedDifficulty);
  const [allPlayersFailed, setAllPlayersFailed] = useState(false);

  const { pool, loading: poolLoading, error: poolError, pickRandomPlayer } = usePlayerPool(difficulty);
  const { phase, currentPlayer, loadError, startRound, submitGuess, skipPlayer } = useGame();
  const { streak, recordCorrect, recordIncorrect } = useStreak(difficulty);
  const roundId = useRef(0);

  const startNewRound = useCallback(async () => {
    const thisRound = ++roundId.current;
    setAllPlayersFailed(false);

    // Try up to 5 players if some fail to load career data
    for (let attempt = 0; attempt < 5; attempt++) {
      if (roundId.current !== thisRound) return; // Cancelled by newer round
      const player = pickRandomPlayer();
      if (!player) break;
      try {
        await startRound(player);
        return; // Success
      } catch {
        // Try another player
      }
    }

    // All attempts failed — show error
    if (roundId.current === thisRound) {
      setAllPlayersFailed(true);
    }
  }, [pickRandomPlayer, startRound]);

  // Start first round when pool is ready
  useEffect(() => {
    if (!poolLoading && pool.length > 0) {
      startNewRound();
    }
  }, [poolLoading, pool.length, startNewRound]);

  const handleDifficultyChange = useCallback((newDifficulty: Difficulty) => {
    if (newDifficulty === difficulty) return;
    setDifficulty(newDifficulty);
    try {
      localStorage.setItem(DIFFICULTY_STORAGE_KEY, newDifficulty);
    } catch {
      // localStorage unavailable
    }
  }, [difficulty]);

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

  const headerProps = {
    streak,
    difficulty,
    onDifficultyChange: handleDifficultyChange,
  };

  // Pool loading
  if (poolLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header {...headerProps} />
        <LoadingState message="Building player pool..." />
      </div>
    );
  }

  // Pool error
  if (poolError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header {...headerProps} />
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
      <Header {...headerProps} />

      <main className="max-w-3xl mx-auto py-6 flex flex-col gap-6">
        {/* Timeline */}
        <section className="bg-gray-800/50 rounded-xl border border-gray-700 mx-4">
          {allPlayersFailed ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <p className="text-red-400 text-sm">Could not load any players. ESPN may be unavailable.</p>
              <button
                onClick={handleNext}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Try again
              </button>
            </div>
          ) : phase === 'loading' ? (
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

        {/* Position Hint */}
        {currentPlayer?.position && phase !== 'loading' && (
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-300 font-medium">
              Position: {currentPlayer.position}
            </span>
          </div>
        )}

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
