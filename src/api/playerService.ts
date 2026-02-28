// Transforms ESPN API data into GamePlayer — pure TypeScript

import { fetchAthleteDetail, fetchAthleteBio, fetchAllTeams, fetchTeamRoster } from './espnApi';
import { getCached, setCache } from './cache';
import type { GamePlayer, CareerStop, RosterPlayer } from './types';

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
    // College logos aren't in this endpoint; construct from ESPN CDN using college ID
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
    const nflStops: CareerStop[] = teamHistory
      .map((entry: { displayName: string; logo: string; seasons: string }) => ({
        type: 'nfl' as const,
        teamName: entry.displayName || 'Unknown Team',
        logoUrl: entry.logo || '',
        seasons: entry.seasons || '',
      }))
      .reverse();
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

export async function loadPlayerPool(): Promise<RosterPlayer[]> {
  const cached = getCached<RosterPlayer[]>('player-pool');
  if (cached) return cached;

  const teams = await fetchAllTeams();

  // Pick 8 random teams
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const selectedTeams = shuffled.slice(0, 8);

  // Fetch rosters in parallel
  const rosterPromises = selectedTeams.map((team) =>
    fetchTeamRoster(String(team.id)).catch(() => [])
  );
  const rosters = await Promise.all(rosterPromises);

  const pool: RosterPlayer[] = rosters.flatMap((roster) =>
    roster
      // Filter to players with at least 1 year of NFL experience
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

  setCache('player-pool', pool, 12 * 60 * 60 * 1000);
  return pool;
}
