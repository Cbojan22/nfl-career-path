// Core game types — pure TypeScript, no React dependency

export interface CareerStop {
  type: 'college' | 'nfl';
  teamName: string;
  logoUrl: string;
  seasons: string; // e.g. "2014-2016" or "2017-Present"
}

export interface GamePlayer {
  id: string;
  fullName: string;
  headshotUrl: string;
  position: string;
  careerPath: CareerStop[]; // chronological order
}

export interface RosterPlayer {
  id: string;
  fullName: string;
  position: string;
  headshotUrl: string;
}

export interface SearchResult {
  id: string;
  fullName: string;
  position: string;
  teamName: string;
  headshotUrl: string;
}

export type GamePhase = 'loading' | 'guessing' | 'correct' | 'incorrect';

export interface GameState {
  phase: GamePhase;
  currentPlayer: GamePlayer | null;
  guessedPlayerId: string | null;
}

export interface StreakData {
  current: number;
  best: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'master';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  master: 'Master',
};
