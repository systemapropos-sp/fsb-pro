// ============================================
// FSB Pro - Sports API Client
// APIs: The Odds API (odds/lines) + API-SPORTS (scores)
// API Key: 2e8540ac64be25785e2e664858da7807
// ============================================

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_ODDS_API_KEY = '2e8540ac64be25785e2e664858da7807';
const THE_ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

export interface GameResult {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'LIVE' | 'FT' | 'NS' | 'HT' | 'POST';
  time: string;
  date: string;
  period?: string;
  sport: string;
}

export interface ApiBettingLine {
  id: string;
  sportKey: string;
  sportTitle: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmaker: string;
  markets: {
    key: 'h2h' | 'spreads' | 'totals';
    outcomes: { name: string; price: number; point?: number }[];
  }[];
}

// ── The Odds API — Betting Lines ───────────────────────────

export const THE_ODDS_SPORTS = [
  { key: 'basketball_nba', label: 'NBA', group: 'Baloncesto' },
  { key: 'basketball_wnba', label: 'WNBA', group: 'Baloncesto' },
  { key: 'basketball_ncaab', label: 'NCAA Basketball', group: 'Baloncesto' },
  { key: 'baseball_mlb', label: 'MLB', group: 'Baseball' },
  { key: 'americanfootball_nfl', label: 'NFL', group: 'Football' },
  { key: 'americanfootball_ncaaf', label: 'NCAA Football', group: 'Football' },
  { key: 'icehockey_nhl', label: 'NHL', group: 'Hockey' },
  { key: 'soccer_usa_mls', label: 'MLS', group: 'Soccer' },
  { key: 'soccer_epl', label: 'Premier League', group: 'Soccer' },
  { key: 'soccer_laliga', label: 'La Liga', group: 'Soccer' },
  { key: 'mma_mixed_martial_arts', label: 'MMA / UFC', group: 'MMA' },
  { key: 'boxing_boxing', label: 'Boxeo', group: 'Boxeo' },
];

function getOddsApiKey(): string {
  try {
    const settings = JSON.parse(localStorage.getItem('fsb_settings_v2') || '{}');
    return settings.odds_api_key || DEFAULT_ODDS_API_KEY;
  } catch { return DEFAULT_ODDS_API_KEY; }
}

/** Fetch betting lines from The Odds API */
export async function fetchOddsLines(
  sportKey: string,
  markets: string = 'h2h,spreads,totals'
): Promise<ApiBettingLine[] | null> {
  const key = getOddsApiKey();
  try {
    const res = await fetch(
      `${THE_ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${key}&regions=us&markets=${markets}&oddsFormat=american`
    );
    if (!res.ok) {
      if (res.status === 401) throw new Error('API key invalid');
      if (res.status === 429) throw new Error('API quota exceeded');
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    return data.map((game: any) => {
      const bookmaker = game.bookmakers?.[0];
      return {
        id: game.id,
        sportKey: game.sport_key,
        sportTitle: game.sport_title,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commenceTime: game.commence_time,
        bookmaker: bookmaker?.title || 'Unknown',
        markets: (bookmaker?.markets || []).map((m: any) => ({
          key: m.key,
          outcomes: m.outcomes.map((o: any) => ({
            name: o.name,
            price: o.price,
            point: o.point,
          })),
        })),
      };
    });
  } catch (err) {
    console.warn('TheOddsAPI error:', err);
    return null;
  }
}

/** React hook for live odds */
export function useOddsLines(sportKey: string, refreshInterval = 300) {
  const [lines, setLines] = useState<ApiBettingLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOddsLines(sportKey);
      if (data) {
        setLines(data);
      } else {
        setError('No odds data available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [sportKey]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { lines, loading, error, refresh };
}

// ── Live Scores — The Odds API (scores endpoint) ───────────

export interface LiveScore {
  id: string;
  sportKey: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string;
  awayScore: string;
  status: string;
  period: string;
  time: string;
}

export async function fetchLiveScoresFromOddsApi(sportKey: string): Promise<LiveScore[] | null> {
  const key = getOddsApiKey();
  try {
    const res = await fetch(
      `${THE_ODDS_API_BASE}/sports/${sportKey}/scores/?apiKey=${key}&daysFrom=3`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    return data.map((g: any) => ({
      id: g.id,
      sportKey: g.sport_key,
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      homeScore: g.scores?.find((s: any) => s.name === g.home_team)?.score?.toString() || '-',
      awayScore: g.scores?.find((s: any) => s.name === g.away_team)?.score?.toString() || '-',
      status: g.completed ? 'Finalizado' : g.commence_time ? 'Programado' : 'En vivo',
      period: '',
      time: new Date(g.commence_time).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    }));
  } catch (err) {
    console.warn('Scores API error:', err);
    return null;
  }
}

// ── Mock Data (fallback) ───────────────────────────────────

function generateMockScores(sport: string): GameResult[] {
  const today = new Date().toISOString().split('T')[0];
  const games: Record<string, GameResult[]> = {
    basketball: [
      { id: 1, league: 'NBA', homeTeam: 'Boston Celtics', awayTeam: 'Los Angeles Lakers', homeScore: 108, awayScore: 104, status: 'FT', time: '19:30', date: today, period: 'F', sport: 'basketball' },
      { id: 2, league: 'NBA', homeTeam: 'Golden State Warriors', awayTeam: 'Dallas Mavericks', homeScore: 112, awayScore: 105, status: 'LIVE', time: '22:00', date: today, period: 'Q3 6:42', sport: 'basketball' },
      { id: 3, league: 'NBA', homeTeam: 'Miami Heat', awayTeam: 'Chicago Bulls', homeScore: 0, awayScore: 0, status: 'NS', time: '20:00', date: today, sport: 'basketball' },
      { id: 4, league: 'NBA', homeTeam: 'Phoenix Suns', awayTeam: 'Denver Nuggets', homeScore: 98, awayScore: 102, status: 'FT', time: '21:00', date: today, period: 'F', sport: 'basketball' },
      { id: 5, league: 'NBA', homeTeam: 'Milwaukee Bucks', awayTeam: 'Cleveland Cavaliers', homeScore: 88, awayScore: 92, status: 'LIVE', time: '19:00', date: today, period: 'Q4 3:15', sport: 'basketball' },
      { id: 6, league: 'NBA', homeTeam: 'Memphis Grizzlies', awayTeam: 'Houston Rockets', homeScore: 0, awayScore: 0, status: 'NS', time: '20:30', date: today, sport: 'basketball' },
      { id: 7, league: 'NBA', homeTeam: 'New York Knicks', awayTeam: 'Philadelphia 76ers', homeScore: 0, awayScore: 0, status: 'NS', time: '19:00', date: today, sport: 'basketball' },
      { id: 8, league: 'NBA', homeTeam: 'LA Clippers', awayTeam: 'Sacramento Kings', homeScore: 0, awayScore: 0, status: 'NS', time: '22:30', date: today, sport: 'basketball' },
      { id: 9, league: 'NBA', homeTeam: 'Atlanta Hawks', awayTeam: 'Toronto Raptors', homeScore: 105, awayScore: 98, status: 'FT', time: '18:00', date: today, period: 'F', sport: 'basketball' },
      { id: 10, league: 'NBA', homeTeam: 'Indiana Pacers', awayTeam: 'Oklahoma City Thunder', homeScore: 0, awayScore: 0, status: 'NS', time: '19:00', date: today, sport: 'basketball' },
    ],
    baseball: [
      { id: 11, league: 'MLB', homeTeam: 'NY Yankees', awayTeam: 'Boston Red Sox', homeScore: 5, awayScore: 3, status: 'FT', time: '13:05', date: today, period: '9', sport: 'baseball' },
      { id: 12, league: 'MLB', homeTeam: 'LA Dodgers', awayTeam: 'San Francisco Giants', homeScore: 2, awayScore: 4, status: 'FT', time: '16:10', date: today, period: '9', sport: 'baseball' },
      { id: 13, league: 'MLB', homeTeam: 'Houston Astros', awayTeam: 'Texas Rangers', homeScore: 0, awayScore: 0, status: 'NS', time: '20:10', date: today, sport: 'baseball' },
      { id: 14, league: 'MLB', homeTeam: 'Chicago Cubs', awayTeam: 'St. Louis Cardinals', homeScore: 7, awayScore: 1, status: 'FT', time: '14:20', date: today, period: '9', sport: 'baseball' },
      { id: 15, league: 'MLB', homeTeam: 'Atlanta Braves', awayTeam: 'NY Mets', homeScore: 3, awayScore: 2, status: 'LIVE', time: '19:20', date: today, period: '7th', sport: 'baseball' },
      { id: 16, league: 'MLB', homeTeam: 'Seattle Mariners', awayTeam: 'Oakland Athletics', homeScore: 0, awayScore: 0, status: 'NS', time: '22:10', date: today, sport: 'baseball' },
    ],
    'american-football': [
      { id: 17, league: 'NFL', homeTeam: 'Kansas City Chiefs', awayTeam: 'Buffalo Bills', homeScore: 27, awayScore: 24, status: 'FT', time: '13:00', date: today, period: 'F', sport: 'american-football' },
      { id: 18, league: 'NFL', homeTeam: 'Dallas Cowboys', awayTeam: 'Philadelphia Eagles', homeScore: 14, awayScore: 17, status: 'FT', time: '16:25', date: today, period: 'F', sport: 'american-football' },
      { id: 19, league: 'NFL', homeTeam: 'San Francisco 49ers', awayTeam: 'Seattle Seahawks', homeScore: 31, awayScore: 28, status: 'FT', time: '20:20', date: today, period: 'F', sport: 'american-football' },
      { id: 20, league: 'NFL', homeTeam: 'Green Bay Packers', awayTeam: 'Chicago Bears', homeScore: 0, awayScore: 0, status: 'NS', time: '13:00', date: today, sport: 'american-football' },
      { id: 21, league: 'NFL', homeTeam: 'Baltimore Ravens', awayTeam: 'Cincinnati Bengals', homeScore: 21, awayScore: 10, status: 'FT', time: '13:00', date: today, period: 'F', sport: 'american-football' },
      { id: 22, league: 'NFL', homeTeam: 'LA Rams', awayTeam: 'Arizona Cardinals', homeScore: 0, awayScore: 0, status: 'NS', time: '16:05', date: today, sport: 'american-football' },
    ],
    football: [
      { id: 23, league: 'Premier League', homeTeam: 'Man City', awayTeam: 'Liverpool', homeScore: 2, awayScore: 1, status: 'FT', time: '12:30', date: today, period: 'FT', sport: 'football' },
      { id: 24, league: 'La Liga', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: 1, awayScore: 1, status: 'FT', time: '15:00', date: today, period: 'FT', sport: 'football' },
      { id: 25, league: 'MLS', homeTeam: 'LA Galaxy', awayTeam: 'Inter Miami', homeScore: 0, awayScore: 0, status: 'NS', time: '19:30', date: today, sport: 'football' },
    ],
  };

  if (sport === 'all') return Object.values(games).flat();
  return games[sport] || games.basketball;
}

// ── Public fetch function — tries API first, falls back to mock ──

export async function fetchLiveScores(sport: string): Promise<GameResult[]> {
  // Try The Odds API first
  const sportKeyMap: Record<string, string> = {
    basketball: 'basketball_nba',
    baseball: 'baseball_mlb',
    'american-football': 'americanfootball_nfl',
    football: 'soccer_epl',
  };

  if (sport !== 'all') {
    const sk = sportKeyMap[sport];
    if (sk) {
      const real = await fetchLiveScoresFromOddsApi(sk);
      if (real && real.length > 0) {
        return real.map((r) => ({
          id: parseInt(r.id.replace(/\D/g, '').slice(0, 8)) || Math.random() * 1000000,
          league: r.sportKey.includes('basketball') ? 'NBA' : r.sportKey.includes('baseball') ? 'MLB' : r.sportKey.includes('football') ? 'NFL' : 'Soccer',
          homeTeam: r.homeTeam,
          awayTeam: r.awayTeam,
          homeScore: parseInt(r.homeScore) || 0,
          awayScore: parseInt(r.awayScore) || 0,
          status: r.status === 'Finalizado' ? 'FT' : r.status === 'En vivo' ? 'LIVE' : 'NS',
          time: r.time,
          date: new Date().toISOString().split('T')[0],
          period: r.period,
          sport,
        }));
      }
    }
  }

  // Fallback to mock
  return generateMockScores(sport);
}

// ── React Hook for live scores ─────────────────────────────

export function useLiveScores(sport: string = 'all', refreshInterval = 60) {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [usingRealData, setUsingRealData] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLiveScores(sport);
      setGames(data);
      setLastUpdated(new Date());
      setUsingRealData(data.length > 0 && data[0].id < 1000000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [sport]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  return { games, loading, error, lastUpdated, refresh, usingRealData };
}

// ── Settings helpers ───────────────────────────────────────

export function saveOddsApiKey(key: string): void {
  try {
    const settings = JSON.parse(localStorage.getItem('fsb_settings_v2') || '{}');
    settings.odds_api_key = key;
    localStorage.setItem('fsb_settings_v2', JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function getSavedOddsApiKey(): string {
  try {
    const settings = JSON.parse(localStorage.getItem('fsb_settings_v2') || '{}');
    return settings.odds_api_key || DEFAULT_ODDS_API_KEY;
  } catch { return DEFAULT_ODDS_API_KEY; }
}

export function saveApiKey(key: string): void {
  try {
    const settings = JSON.parse(localStorage.getItem('fsb_settings_v2') || '{}');
    settings.sports_api_key = key;
    localStorage.setItem('fsb_settings_v2', JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function getSavedApiKey(): string | null {
  try {
    const settings = JSON.parse(localStorage.getItem('fsb_settings_v2') || '{}');
    return settings.sports_api_key || null;
  } catch { return null; }
}
