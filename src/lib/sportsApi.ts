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

// ── Mock Data (fallback) — Multi-date generator ────────────

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

function generateMockScores(sport: string): GameResult[] {
  const d0 = getDateStr(0);   // today
  const d_1 = getDateStr(-1);  // yesterday
  const d_2 = getDateStr(-2);  // 2 days ago
  const d1 = getDateStr(1);   // tomorrow

  const allGames: GameResult[] = [
    // ── NBA ──
    // Today
    { id: 1, league: 'NBA', homeTeam: 'Boston Celtics', awayTeam: 'Los Angeles Lakers', homeScore: 108, awayScore: 104, status: 'FT', time: '19:30', date: d0, period: 'F', sport: 'basketball' },
    { id: 2, league: 'NBA', homeTeam: 'Golden State Warriors', awayTeam: 'Dallas Mavericks', homeScore: 112, awayScore: 105, status: 'LIVE', time: '22:00', date: d0, period: 'Q3 6:42', sport: 'basketball' },
    { id: 3, league: 'NBA', homeTeam: 'Miami Heat', awayTeam: 'Chicago Bulls', homeScore: 0, awayScore: 0, status: 'NS', time: '20:00', date: d0, sport: 'basketball' },
    { id: 4, league: 'NBA', homeTeam: 'Phoenix Suns', awayTeam: 'Denver Nuggets', homeScore: 98, awayScore: 102, status: 'FT', time: '21:00', date: d0, period: 'F', sport: 'basketball' },
    { id: 5, league: 'NBA', homeTeam: 'Milwaukee Bucks', awayTeam: 'Cleveland Cavaliers', homeScore: 88, awayScore: 92, status: 'LIVE', time: '19:00', date: d0, period: 'Q4 3:15', sport: 'basketball' },
    { id: 6, league: 'NBA', homeTeam: 'Memphis Grizzlies', awayTeam: 'Houston Rockets', homeScore: 0, awayScore: 0, status: 'NS', time: '20:30', date: d0, sport: 'basketball' },
    { id: 7, league: 'NBA', homeTeam: 'New York Knicks', awayTeam: 'Philadelphia 76ers', homeScore: 0, awayScore: 0, status: 'NS', time: '19:00', date: d0, sport: 'basketball' },
    { id: 8, league: 'NBA', homeTeam: 'LA Clippers', awayTeam: 'Sacramento Kings', homeScore: 0, awayScore: 0, status: 'NS', time: '22:30', date: d0, sport: 'basketball' },
    { id: 9, league: 'NBA', homeTeam: 'Atlanta Hawks', awayTeam: 'Toronto Raptors', homeScore: 105, awayScore: 98, status: 'FT', time: '18:00', date: d0, period: 'F', sport: 'basketball' },
    { id: 10, league: 'NBA', homeTeam: 'Indiana Pacers', awayTeam: 'Oklahoma City Thunder', homeScore: 0, awayScore: 0, status: 'NS', time: '19:00', date: d0, sport: 'basketball' },
    // Yesterday (all finished)
    { id: 101, league: 'NBA', homeTeam: 'Boston Celtics', awayTeam: 'Dallas Mavericks', homeScore: 112, awayScore: 98, status: 'FT', time: '19:30', date: d_1, period: 'F', sport: 'basketball' },
    { id: 102, league: 'NBA', homeTeam: 'Phoenix Suns', awayTeam: 'Golden State Warriors', homeScore: 105, awayScore: 110, status: 'FT', time: '22:00', date: d_1, period: 'F', sport: 'basketball' },
    { id: 103, league: 'NBA', homeTeam: 'Denver Nuggets', awayTeam: 'Milwaukee Bucks', homeScore: 95, awayScore: 88, status: 'FT', time: '21:00', date: d_1, period: 'F', sport: 'basketball' },
    { id: 104, league: 'NBA', homeTeam: 'LA Lakers', awayTeam: 'Chicago Bulls', homeScore: 102, awayScore: 96, status: 'FT', time: '20:30', date: d_1, period: 'F', sport: 'basketball' },
    { id: 105, league: 'NBA', homeTeam: 'Miami Heat', awayTeam: 'New York Knicks', homeScore: 99, awayScore: 103, status: 'FT', time: '19:00', date: d_1, period: 'F', sport: 'basketball' },
    // 2 days ago
    { id: 201, league: 'NBA', homeTeam: 'Cleveland Cavaliers', awayTeam: 'Boston Celtics', homeScore: 108, awayScore: 115, status: 'FT', time: '19:30', date: d_2, period: 'F', sport: 'basketball' },
    { id: 202, league: 'NBA', homeTeam: 'Toronto Raptors', awayTeam: 'Atlanta Hawks', homeScore: 92, awayScore: 87, status: 'FT', time: '19:00', date: d_2, period: 'F', sport: 'basketball' },
    // Tomorrow (not started)
    { id: 301, league: 'NBA', homeTeam: 'Dallas Mavericks', awayTeam: 'Boston Celtics', homeScore: 0, awayScore: 0, status: 'NS', time: '20:00', date: d1, sport: 'basketball' },
    { id: 302, league: 'NBA', homeTeam: 'Chicago Bulls', awayTeam: 'LA Lakers', homeScore: 0, awayScore: 0, status: 'NS', time: '22:30', date: d1, sport: 'basketball' },

    // ── MLB ──
    // Today
    { id: 11, league: 'MLB', homeTeam: 'NY Yankees', awayTeam: 'Boston Red Sox', homeScore: 5, awayScore: 3, status: 'FT', time: '13:05', date: d0, period: '9', sport: 'baseball' },
    { id: 12, league: 'MLB', homeTeam: 'LA Dodgers', awayTeam: 'San Francisco Giants', homeScore: 2, awayScore: 4, status: 'FT', time: '16:10', date: d0, period: '9', sport: 'baseball' },
    { id: 13, league: 'MLB', homeTeam: 'Houston Astros', awayTeam: 'Texas Rangers', homeScore: 0, awayScore: 0, status: 'NS', time: '20:10', date: d0, sport: 'baseball' },
    { id: 14, league: 'MLB', homeTeam: 'Chicago Cubs', awayTeam: 'St. Louis Cardinals', homeScore: 7, awayScore: 1, status: 'FT', time: '14:20', date: d0, period: '9', sport: 'baseball' },
    { id: 15, league: 'MLB', homeTeam: 'Atlanta Braves', awayTeam: 'NY Mets', homeScore: 3, awayScore: 2, status: 'LIVE', time: '19:20', date: d0, period: '7th', sport: 'baseball' },
    { id: 16, league: 'MLB', homeTeam: 'Seattle Mariners', awayTeam: 'Oakland Athletics', homeScore: 0, awayScore: 0, status: 'NS', time: '22:10', date: d0, sport: 'baseball' },
    // Yesterday
    { id: 111, league: 'MLB', homeTeam: 'NY Yankees', awayTeam: 'Baltimore Orioles', homeScore: 4, awayScore: 2, status: 'FT', time: '13:05', date: d_1, period: '9', sport: 'baseball' },
    { id: 112, league: 'MLB', homeTeam: 'LA Dodgers', awayTeam: 'San Diego Padres', homeScore: 6, awayScore: 3, status: 'FT', time: '16:10', date: d_1, period: '9', sport: 'baseball' },
    { id: 113, league: 'MLB', homeTeam: 'Houston Astros', awayTeam: 'Texas Rangers', homeScore: 3, awayScore: 5, status: 'FT', time: '20:10', date: d_1, period: '9', sport: 'baseball' },
    { id: 114, league: 'MLB', homeTeam: 'Boston Red Sox', awayTeam: 'Tampa Bay Rays', homeScore: 2, awayScore: 1, status: 'FT', time: '13:35', date: d_1, period: '9', sport: 'baseball' },
    // 2 days ago
    { id: 211, league: 'MLB', homeTeam: 'Chicago Cubs', awayTeam: 'Milwaukee Brewers', homeScore: 5, awayScore: 7, status: 'FT', time: '14:20', date: d_2, period: '9', sport: 'baseball' },
    { id: 212, league: 'MLB', homeTeam: 'Atlanta Braves', awayTeam: 'Philadelphia Phillies', homeScore: 8, awayScore: 4, status: 'FT', time: '19:20', date: d_2, period: '9', sport: 'baseball' },

    // ── NFL ──
    // Today
    { id: 17, league: 'NFL', homeTeam: 'Kansas City Chiefs', awayTeam: 'Buffalo Bills', homeScore: 27, awayScore: 24, status: 'FT', time: '13:00', date: d0, period: 'F', sport: 'american-football' },
    { id: 18, league: 'NFL', homeTeam: 'Dallas Cowboys', awayTeam: 'Philadelphia Eagles', homeScore: 14, awayScore: 17, status: 'FT', time: '16:25', date: d0, period: 'F', sport: 'american-football' },
    { id: 19, league: 'NFL', homeTeam: 'San Francisco 49ers', awayTeam: 'Seattle Seahawks', homeScore: 31, awayScore: 28, status: 'FT', time: '20:20', date: d0, period: 'F', sport: 'american-football' },
    { id: 20, league: 'NFL', homeTeam: 'Green Bay Packers', awayTeam: 'Chicago Bears', homeScore: 0, awayScore: 0, status: 'NS', time: '13:00', date: d0, sport: 'american-football' },
    { id: 21, league: 'NFL', homeTeam: 'Baltimore Ravens', awayTeam: 'Cincinnati Bengals', homeScore: 21, awayScore: 10, status: 'FT', time: '13:00', date: d0, period: 'F', sport: 'american-football' },
    { id: 22, league: 'NFL', homeTeam: 'LA Rams', awayTeam: 'Arizona Cardinals', homeScore: 0, awayScore: 0, status: 'NS', time: '16:05', date: d0, sport: 'american-football' },
    // Yesterday
    { id: 117, league: 'NFL', homeTeam: 'Pittsburgh Steelers', awayTeam: 'Cleveland Browns', homeScore: 24, awayScore: 20, status: 'FT', time: '13:00', date: d_1, period: 'F', sport: 'american-football' },
    { id: 118, league: 'NFL', homeTeam: 'New England Patriots', awayTeam: 'NY Jets', homeScore: 17, awayScore: 14, status: 'FT', time: '13:00', date: d_1, period: 'F', sport: 'american-football' },
    { id: 119, league: 'NFL', homeTeam: 'Denver Broncos', awayTeam: 'Las Vegas Raiders', homeScore: 28, awayScore: 31, status: 'FT', time: '16:25', date: d_1, period: 'F', sport: 'american-football' },
    // 2 days ago
    { id: 217, league: 'NFL', homeTeam: 'Tennessee Titans', awayTeam: 'Jacksonville Jaguars', homeScore: 10, awayScore: 21, status: 'FT', time: '13:00', date: d_2, period: 'F', sport: 'american-football' },
    { id: 218, league: 'NFL', homeTeam: 'Indianapolis Colts', awayTeam: 'Houston Texans', homeScore: 14, awayScore: 7, status: 'FT', time: '13:00', date: d_2, period: 'F', sport: 'american-football' },

    // ── Soccer ──
    // Today
    { id: 23, league: 'Premier League', homeTeam: 'Man City', awayTeam: 'Liverpool', homeScore: 2, awayScore: 1, status: 'FT', time: '12:30', date: d0, period: 'FT', sport: 'football' },
    { id: 24, league: 'La Liga', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: 1, awayScore: 1, status: 'FT', time: '15:00', date: d0, period: 'FT', sport: 'football' },
    { id: 25, league: 'MLS', homeTeam: 'LA Galaxy', awayTeam: 'Inter Miami', homeScore: 0, awayScore: 0, status: 'NS', time: '19:30', date: d0, sport: 'football' },
    // Yesterday
    { id: 123, league: 'Premier League', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeScore: 3, awayScore: 0, status: 'FT', time: '15:00', date: d_1, period: 'FT', sport: 'football' },
    { id: 124, league: 'La Liga', homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', homeScore: 2, awayScore: 0, status: 'FT', time: '21:00', date: d_1, period: 'FT', sport: 'football' },
    { id: 125, league: 'Serie A', homeTeam: 'Juventus', awayTeam: 'AC Milan', homeScore: 1, awayScore: 1, status: 'FT', time: '14:45', date: d_1, period: 'FT', sport: 'football' },
    // 2 days ago
    { id: 223, league: 'Premier League', homeTeam: 'Tottenham', awayTeam: 'Man United', homeScore: 2, awayScore: 2, status: 'FT', time: '12:30', date: d_2, period: 'FT', sport: 'football' },
    { id: 224, league: 'Bundesliga', homeTeam: 'Bayern Munich', awayTeam: 'Dortmund', homeScore: 4, awayScore: 2, status: 'FT', time: '15:30', date: d_2, period: 'FT', sport: 'football' },
  ];

  // Filter by sport
  const sportGames = sport === 'all'
    ? allGames
    : allGames.filter(g => g.sport === sport);

  return sportGames;
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
