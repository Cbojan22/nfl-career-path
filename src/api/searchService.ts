// Debounced player search — pure TypeScript

import { searchPlayers } from './espnApi';
import type { SearchResult } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSearchResult(item: any): SearchResult | null {
  if (typeof item !== 'object' || item === null || !item.id) return null;

  // Team info is in teamRelationships array
  const teamRel = item.teamRelationships?.[0];
  const teamName = teamRel?.displayName || '';

  // Position is in label like "NFL - Kansas City Chiefs"
  // or can extract from jersey/other fields — we'll use label parsing
  const position = item.position?.abbreviation || '';

  return {
    id: String(item.id),
    fullName: item.displayName || 'Unknown',
    position,
    teamName,
    headshotUrl:
      item.headshot?.href ||
      `https://a.espncdn.com/i/headshots/nfl/players/full/${item.id}.png`,
  };
}

export async function searchNflPlayers(query: string): Promise<SearchResult[]> {
  if (query.trim().length < 2) return [];

  const items = await searchPlayers(query);
  return items
    .map(mapSearchResult)
    .filter((r): r is SearchResult => r !== null);
}
