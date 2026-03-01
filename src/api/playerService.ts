// Transforms ESPN API data into GamePlayer — pure TypeScript

import { fetchAthleteDetail, fetchAthleteBio, fetchAllTeams, fetchTeamRoster, fetchTeamDepthChart } from './espnApi';
import { getCached, setCache } from './cache';
import type { GamePlayer, CareerStop, RosterPlayer, Difficulty } from './types';

/** Depth chart position keys by difficulty tier */
const SKILL_POSITIONS = ['qb', 'rb', 'wr1', 'wr2', 'wr3', 'te'];
const OL_POSITIONS = ['lt', 'lg', 'c', 'rg', 'rt'];
const DEFENSE_POSITIONS = [
  'lde', 'rde', 'ldt', 'rdt',
  'wlb', 'mlb', 'slb',
  'lcb', 'rcb', 'ss', 'fs',
];

function getPositionKeysForDifficulty(difficulty: Difficulty): string[] {
  switch (difficulty) {
    case 'easy':
      return SKILL_POSITIONS;
    case 'medium':
      return [...SKILL_POSITIONS, ...DEFENSE_POSITIONS];
    case 'hard':
      return [...SKILL_POSITIONS, ...DEFENSE_POSITIONS, ...OL_POSITIONS];
    case 'master':
      return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStartersFromDepthChart(depthChartData: any, positionKeys: string[]): RosterPlayer[] {
  const players: RosterPlayer[] = [];
  const seenIds = new Set<string>();

  // Response: { depthchart: [{ name, positions: { [key]: { athletes: [{ id, displayName, ... }] } } }] }
  const charts = depthChartData?.depthchart ?? [];
  for (const chart of charts) {
    const positions = chart.positions ?? {};
    for (const posKey of positionKeys) {
      const posData = positions[posKey];
      if (!posData?.athletes?.length) continue;
      const starter = posData.athletes[0]; // index 0 = starter
      const id = String(starter.id);
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      players.push({
        id,
        fullName: starter.displayName || 'Unknown',
        position: posKey.replace(/\d+$/, '').toUpperCase(), // 'wr1' -> 'WR'
        headshotUrl: `https://a.espncdn.com/i/headshots/nfl/players/full/${id}.png`,
      });
    }
  }

  return players;
}

export async function buildGamePlayer(playerId: string): Promise<GamePlayer> {
  const cached = getCached<GamePlayer>(`player-${playerId}`);
  if (cached) return cached;

  const [detail, bio] = await Promise.all([
    fetchAthleteDetail(playerId),
    fetchAthleteBio(playerId),
  ]);

  const athlete = detail.athlete || detail;
  const careerPath: CareerStop[] = [];

  // College stop from athlete detail
  const college = athlete.college;
  if (college) {
    const collegeName = college.name || college.shortName || 'Unknown College';
    const collegeLogo = college.id
      ? `https://a.espncdn.com/i/teamlogos/ncaa/500/${college.id}.png`
      : '';
    careerPath.push({
      type: 'college',
      teamName: collegeName,
      logoUrl: collegeLogo,
      seasons: '',
    });
  }

  // NFL team history from bio (reverse-chronological at top level, so we reverse)
  const teamHistory = bio?.teamHistory;
  if (teamHistory && Array.isArray(teamHistory)) {
    // Reverse to chronological, then merge consecutive stints with the same team
    // (handles rebrands like Washington Redskins → Washington → Washington Commanders)
    const chronological = [...teamHistory].reverse();
    const merged: { id: string; displayName: string; logo: string; startYear: string; endYear: string }[] = [];

    for (const entry of chronological) {
      const teamId = String(entry.id || '');
      const seasons = entry.seasons || '';
      const [startYear, endYear] = seasons.split('-');
      const prev = merged[merged.length - 1];

      if (prev && prev.id === teamId) {
        // Same team — extend the season range, keep the latest name/logo
        prev.endYear = endYear || prev.endYear;
        prev.displayName = entry.displayName || prev.displayName;
        prev.logo = entry.logo || prev.logo;
      } else {
        merged.push({
          id: teamId,
          displayName: entry.displayName || 'Unknown Team',
          logo: entry.logo || '',
          startYear: startYear || '',
          endYear: endYear || startYear || '',
        });
      }
    }

    const nflStops: CareerStop[] = merged.map((m) => ({
      type: 'nfl' as const,
      teamName: m.displayName,
      logoUrl: m.logo,
      seasons: m.startYear === m.endYear ? m.startYear : `${m.startYear}-${m.endYear}`,
    }));
    careerPath.push(...nflStops);
  }

  // Must have at least one NFL stop — reject college-only players
  const hasNflStop = careerPath.some((s) => s.type === 'nfl');
  if (!hasNflStop) {
    throw new Error('No NFL team history');
  }

  const headshotUrl =
    athlete.headshot?.href ||
    `https://a.espncdn.com/i/headshots/nfl/players/full/${playerId}.png`;

  const player: GamePlayer = {
    id: String(athlete.id),
    fullName: athlete.displayName || athlete.fullName || 'Unknown',
    headshotUrl,
    position: athlete.position?.abbreviation || '',
    careerPath,
  };

  setCache(`player-${playerId}`, player, 24 * 60 * 60 * 1000);
  return player;
}

export async function loadPlayerPool(difficulty: Difficulty = 'easy'): Promise<RosterPlayer[]> {
  const cacheKey = `player-pool-${difficulty}`;
  const cached = getCached<RosterPlayer[]>(cacheKey);
  if (cached) return cached;

  const teams = await fetchAllTeams();

  let pool: RosterPlayer[];

  if (difficulty === 'master') {
    // Master: 8 random teams, full rosters, experience >= 1 year
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const selectedTeams = shuffled.slice(0, 8);

    const rosterPromises = selectedTeams.map((team) =>
      fetchTeamRoster(String(team.id)).catch(() => [])
    );
    const rosters = await Promise.all(rosterPromises);

    pool = rosters.flatMap((roster) =>
      roster
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((p: any) => (p.experience?.years ?? 0) >= 1)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => ({
          id: String(p.id),
          fullName: p.displayName || p.fullName || 'Unknown',
          position: p.position?.abbreviation || '',
          headshotUrl:
            p.headshot?.href ||
            `https://a.espncdn.com/i/headshots/nfl/players/full/${p.id}.png`,
        }))
    );
  } else {
    // Easy/Medium/Hard: all 32 teams, depth chart starters only
    const positionKeys = getPositionKeysForDifficulty(difficulty);

    const depthChartPromises = teams.map((team) =>
      fetchTeamDepthChart(String(team.id)).catch(() => null)
    );
    const depthCharts = await Promise.all(depthChartPromises);

    pool = depthCharts.flatMap((dc) =>
      dc ? extractStartersFromDepthChart(dc, positionKeys) : []
    );
  }

  setCache(cacheKey, pool, 12 * 60 * 60 * 1000);
  return pool;
}
