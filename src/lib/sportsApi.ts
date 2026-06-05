// ============================================
// FSB Pro - Sports API Client
// Supports: API-SPORTS.io (free tier: 100 req/day)
// Fallback: Mock data when no API key
// ============================================

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

// Get API key from settings (user can configure)
function getApiKey(): string | null {
  try {
    const settings = JSON.parse(localStorage.getItem('fsb_settings_v2') || '{}');
    return settings.sports_api_key || null;
  } catch {
    return null;
  }
}

// Sport ID mapping for API-SPORTS
const SPORT_IDS: Record<string, { id: string; name: string }> = {
  basketball: { id: 'basketball', name: 'NBA' },
  baseball: { id: 'baseball', name: 'MLB' },
  'american-football': { id: 'american-football', name: 'NFL' },
  football: { id: 'football', name: 'Soccer' },
};

// ============================================
// Mock Data (fallback when no API key)
// ============================================
function generateMockScores(sport: string): GameResult[] {
  const today = new Date().toISOString().split('T')[0];

  const baseGames: Record<string, GameResult[]> = {
    basketball: [
      { id: 1, league: 'NBA', homeTeam: 'Boston', awayTeam: 'Lakers', homeScore: 108, awayScore: 104, status: 'FT', time: '7:30 PM', date: today, period: 'F', sport: 'basketball' },
      { id: 2, league: 'NBA', homeTeam: 'Golden State', awayTeam: 'Dallas', homeScore: 95, awayScore: 88, status: 'LIVE', time: '10:00 PM', date: today, period: 'Q3 8:24', sport: 'basketball' },
      { id: 3, league: 'NBA', homeTeam: 'Miami', awayTeam: 'Chicago', homeScore: 0, awayScore: 0, status: 'NS', time: '8:00 PM', date: today, sport: 'basketball' },
      { id: 4, league: 'NBA', homeTeam: 'Phoenix', awayTeam: 'Denver', homeScore: 112, awayScore: 115, status: 'FT', time: '9:00 PM', date: today, period: 'F', sport: 'basketball' },
      { id: 5, league: 'NBA', homeTeam: 'Milwaukee', awayTeam: 'Cleveland', homeScore: 67, awayScore: 72, status: 'LIVE', time: '7:00 PM', date: today, period: 'Q3 2:15', sport: 'basketball' },
      { id: 6, league: 'NBA', homeTeam: 'Memphis', awayTeam: 'Houston', homeScore: 0, awayScore: 0, status: 'NS', time: '8:30 PM', date: today, sport: 'basketball' },
      { id: 7, league: 'NBA', homeTeam: 'Toronto', awayTeam: 'New York', homeScore: 102, awayScore: 98, status: 'FT', time: '5:00 PM', date: today, period: 'F', sport: 'basketball' },
      { id: 8, league: 'NBA', homeTeam: 'LA Clippers', awayTeam: 'Sacramento', homeScore: 0, awayScore: 0, status: 'NS', time: '10:30 PM', date: today, sport: 'basketball' },
    ],
    baseball: [
      { id: 9, league: 'MLB', homeTeam: 'NY Yankees', awayTeam: 'Boston', homeScore: 5, awayScore: 3, status: 'FT', time: '1:05 PM', date: today, period: '9', sport: 'baseball' },
      { id: 10, league: 'MLB', homeTeam: 'LA Dodgers', awayTeam: 'San Francisco', homeScore: 2, awayScore: 2, status: 'LIVE', time: '4:10 PM', date: today, period: '7th', sport: 'baseball' },
      { id: 11, league: 'MLB', homeTeam: 'Houston', awayTeam: 'Texas', homeScore: 0, awayScore: 0, status: 'NS', time: '8:10 PM', date: today, sport: 'baseball' },
      { id: 12, league: 'MLB', homeTeam: 'Chicago Cubs', awayTeam: 'St. Louis', homeScore: 4, awayScore: 1, status: 'FT', time: '2:20 PM', date: today, period: '9', sport: 'baseball' },
      { id: 13, league: 'MLB', homeTeam: 'Atlanta', awayTeam: 'NY Mets', homeScore: 0, awayScore: 1, status: 'LIVE', time: '7:20 PM', date: today, period: '3rd', sport: 'baseball' },
      { id: 14, league: 'MLB', homeTeam: 'Seattle', awayTeam: 'Oakland', homeScore: 0, awayScore: 0, status: 'NS', time: '10:10 PM', date: today, sport: 'baseball' },
    ],
    'american-football': [
      { id: 15, league: 'NFL', homeTeam: 'Kansas City', awayTeam: 'Buffalo', homeScore: 27, awayScore: 24, status: 'FT', time: '1:00 PM', date: today, period: 'F', sport: 'american-football' },
      { id: 16, league: 'NFL', homeTeam: 'Dallas', awayTeam: 'Philadelphia', homeScore: 14, awayScore: 17, status: 'LIVE', time: '4:25 PM', date: today, period: 'Q3 5:12', sport: 'american-football' },
      { id: 17, league: 'NFL', homeTeam: 'San Francisco', awayTeam: 'Seattle', homeScore: 31, awayScore: 28, status: 'FT', time: '8:20 PM', date: today, period: 'F', sport: 'american-football' },
      { id: 18, league: 'NFL', homeTeam: 'Green Bay', awayTeam: 'Chicago', homeScore: 0, awayScore: 0, status: 'NS', time: '1:00 PM', date: today, sport: 'american-football' },
      { id: 19, league: 'NFL', homeTeam: 'Baltimore', awayTeam: 'Cincinnati', homeScore: 21, awayScore: 10, status: 'FT', time: '1:00 PM', date: today, period: 'F', sport: 'american-football' },
      { id: 20, league: 'NFL', homeTeam: 'LA Rams', awayTeam: 'Arizona', homeScore: 0, awayScore: 7, status: 'LIVE', time: '4:05 PM', date: today, period: 'Q1 8:45', sport: 'american-football' },
    ],
    football: [
      { id: 21, league: 'Premier League', homeTeam: 'Man City', awayTeam: 'Liverpool', homeScore: 2, awayScore: 1, status: 'FT', time: '12:30 PM', date: today, period: 'FT', sport: 'football' },
      { id: 22, league: 'La Liga', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: 0, awayScore: 0, status: 'LIVE', time:  '3:00 PM', date: today, period: '67\'', sport: 'football' },
      { id: 23, league: 'MLS', homeTeam: 'LA Galaxy', awayTeam: 'Inter Miami', homeScore: 0, awayScore: 0, status: 'NS', time: '7:30 PM', date: today, sport: 'football' },
      { id: 24, league: 'Serie A', homeTeam: 'Juventus', awayTeam: 'AC Milan', homeScore: 1, awayScore: 1, status: 'FT', time: '2:45 PM', date: today, period: 'FT', sport: 'football' },
    ],
  };

  if (sport === 'all') {
    return Object.values(baseGames).flat();
  }
  return baseGames[sport] || baseGames.basketball;
}

// ============================================
// Fetch from API-SPORTS (or fallback to mock)
// ============================================
export async function fetchLiveScores(sport: string): Promise<GameResult[]> {
  const apiKey = getApiKey();

  // No API key → use mock data
  if (!apiKey) {
    return generateMockScores(sport);
  }

  // Has API key → try real API
  try {
    const sportConfig = SPORT_IDS[sport];
    if (!sportConfig) return generateMockScores(sport);

    const today = new Date().toISOString().split('T')[0];
    const baseUrl = `https://v1.${sportConfig.id}.api-sports.io`;

    const response = await fetch(`${baseUrl}/games?date=${today}&league=12&season=2024-2025`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': baseUrl.replace('https://', ''),
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data.response || !Array.isArray(data.response)) {
      return generateMockScores(sport);
    }

    return data.response.map((g: any) => ({
      id: g.id || Math.random(),
      league: g.league?.name || sportConfig.name,
      homeTeam: g.teams?.home?.name || 'Home',
      awayTeam: g.teams?.away?.name || 'Away',
      homeScore: g.scores?.home?.total || 0,
      awayScore: g.scores?.away?.total || 0,
      status: (g.status?.short || 'NS') as GameResult['status'],
      time: g.time || '',
      date: g.date || today,
      period: g.periods?.current?.toString() || '',
      sport,
    }));
  } catch (err) {
    console.warn('Sports API error, using mock data:', err);
    return generateMockScores(sport);
  }
}

// ============================================
// React Hook for live scores with polling
// ============================================
import { useState, useEffect, useCallback } from 'react';

export function useLiveScores(sport: string = 'all', refreshInterval = 60) {
  const [games, setGames] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLiveScores(sport);
      setGames(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando resultados');
    } finally {
      setLoading(false);
    }
  }, [sport]);

  useEffect(() => {
    let mounted = true;
    let interval: ReturnType<typeof setInterval>;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchLiveScores(sport);
        if (mounted) {
          setGames(data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    interval = setInterval(load, refreshInterval * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sport, refreshInterval]);

  return { games, loading, error, lastUpdated, refresh };
}

// ============================================
// Settings for API key
// ============================================
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
  } catch {
    return null;
  }
}
