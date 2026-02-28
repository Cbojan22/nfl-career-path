// Raw ESPN API fetch functions — pure TypeScript

const BASE = 'https://site.api.espn.com/apis';
const WEB_BASE = 'https://site.web.api.espn.com/apis';

async function fetchJson<T>(url: string, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error('Unreachable');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAllTeams(): Promise<any[]> {
  const data = await fetchJson<{ sports: { leagues: { teams: { team: unknown }[] }[] }[] }>(
    `${BASE}/site/v2/sports/football/nfl/teams`
  );
  return data.sports[0].leagues[0].teams.map((t) => t.team);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchTeamRoster(teamId: string): Promise<any[]> {
  const data = await fetchJson<{ athletes: { items: unknown[] }[] }>(
    `${BASE}/site/v2/sports/football/nfl/teams/${teamId}/roster`
  );
  // Roster has sections (offense, defense, special teams)
  return data.athletes.flatMap((section) => section.items);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAthleteDetail(athleteId: string): Promise<any> {
  return fetchJson(
    `${BASE}/common/v3/sports/football/nfl/athletes/${athleteId}`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAthleteBio(athleteId: string): Promise<any> {
  return fetchJson(
    `${WEB_BASE}/common/v3/sports/football/nfl/athletes/${athleteId}/bio`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function searchPlayers(query: string): Promise<any[]> {
  if (query.length < 2) return [];
  const data = await fetchJson<{ items: unknown[] }>(
    `${BASE}/common/v3/search?query=${encodeURIComponent(query)}&limit=10&type=player&sport=football&league=nfl`
  );
  return data.items || [];
}
