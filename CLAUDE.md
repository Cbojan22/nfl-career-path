# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server (served at `/nfl-career-path/` base path)
- `npm run build` — TypeScript check (`tsc -b`) then Vite production build to `dist/`
- `npm run lint` — ESLint across the project
- `npm run preview` — Preview the production build locally

## Architecture

NFL Career Path is a browser-based guessing game where players identify NFL athletes from their career timeline (college → NFL teams). React + Vite + TypeScript + Tailwind CSS v4.

**Three-layer architecture designed for future React Native migration:**

- **`src/api/`** — Pure TypeScript, zero React imports. ESPN public API clients, data transformation, and caching. Ports directly to React Native without changes.
- **`src/hooks/`** — React hooks with no DOM APIs. Game state machine, player pool management, autocomplete, streak tracking. Ports directly to React Native.
- **`src/components/`** — Web-specific JSX. The only layer that would be rewritten for React Native.

**Key data flow:**
`GameContainer` is the orchestrator. It owns difficulty state and wires three hooks: `usePlayerPool(difficulty)` loads players from ESPN depth charts (Easy/Medium/Hard) or full rosters (Master), `useGame()` manages the loading→guessing→correct/incorrect state machine, and `useStreak(difficulty)` tracks per-difficulty streaks in localStorage.

**ESPN API endpoints** (no auth required, CORS-friendly):
- Teams/rosters: `site.api.espn.com/apis/site/v2/sports/football/nfl/teams/...`
- Depth charts: `.../teams/{id}/depthcharts` — `depthchart[]` array, each with `positions` map where `athletes[0]` is the starter
- Athlete detail: `.../athletes/{id}` — college info under `athlete.college`
- Athlete bio: `site.web.api.espn.com/.../athletes/{id}/bio` — `teamHistory[]` at top level (reverse-chronological), `logo` is a string (not array)

**Caching:** In-memory + localStorage with TTL. Player pools cached 12h per difficulty key (`player-pool-easy`, etc.), individual players cached 24h.

## Deployment

GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). Pushes to `main` trigger build and deploy. The Vite `base` is set to `/nfl-career-path/`. Live at `https://cbojan22.github.io/nfl-career-path/`.

## Gotchas

- ESPN API response structures vary by endpoint — always verify with a real call before assuming field paths. The depth chart athlete data is flat (no nested `.athlete` wrapper), while the athlete detail endpoint nests under `.athlete`.
- College logos aren't returned by the athlete endpoint — they're constructed from the college ID: `https://a.espncdn.com/i/teamlogos/ncaa/500/{collegeId}.png`.
- `loadPlayerPool` rejects players with 0 years experience (Master mode) and `buildGamePlayer` rejects players without NFL team history, so the game retries up to 5 different players per round.
