#!/usr/bin/env node
// ============================================================
// fetch-odds.mjs
// Fetches live odds from The Odds API → uploads to Supabase Storage
// Schedule: GitHub Actions runs this daily at 11am ET (15:00 UTC)
// ============================================================

const ODDS_API_KEY  = process.env.ODDS_API_KEY  || '4438da50f0c328b5a126888c41ee2ffa';
const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://byulmtsffimwvejfoppk.supabase.co';
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY || '';

const ODDS_BASE = 'https://api.the-odds-api.com/v4';

// Sport mapping: our SportCode → Odds API sport key
const SPORT_MAP = [
  { code: 'MLB',    key: 'baseball_mlb',            markets: 'h2h,spreads,totals' },
  { code: 'NBA',    key: 'basketball_nba',           markets: 'h2h,spreads,totals' },
  { code: 'WNBA',   key: 'basketball_wnba',          markets: 'h2h,spreads,totals' },
  { code: 'Soccer', key: 'soccer_usa_mls',           markets: 'h2h,totals' },
  // LMB / BPS / CPBL use mock data (no API key available)
];

function fmtTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'America/New_York',
  });
}

function parseMarkets(game) {
  const bookmaker = game.bookmakers?.[0];
  if (!bookmaker) return {};

  const h2h = bookmaker.markets?.find(m => m.key === 'h2h');
  const spreads = bookmaker.markets?.find(m => m.key === 'spreads');
  const totals = bookmaker.markets?.find(m => m.key === 'totals');

  const odds = {};

  // ML: [awayOdds, homeOdds]
  if (h2h) {
    const away = h2h.outcomes.find(o => o.name === game.away_team);
    const home = h2h.outcomes.find(o => o.name === game.home_team);
    if (away && home) {
      odds.ml = [Math.round(away.price), Math.round(home.price)];
    }
  }

  // RL (spreads): [{ line, odds }, { line, odds }]  away first
  if (spreads) {
    const away = spreads.outcomes.find(o => o.name === game.away_team);
    const home = spreads.outcomes.find(o => o.name === game.home_team);
    if (away && home) {
      const awayLine = away.point >= 0 ? `+${away.point}` : `${away.point}`;
      const homeLine = home.point >= 0 ? `+${home.point}` : `${home.point}`;
      odds.rl = [
        { line: awayLine, odds: Math.round(away.price) },
        { line: homeLine, odds: Math.round(home.price) },
      ];
    }
  }

  // OU (totals): [{ line, over, under }]
  if (totals) {
    const over  = totals.outcomes.find(o => o.name === 'Over');
    const under = totals.outcomes.find(o => o.name === 'Under');
    if (over && under) {
      odds.ou = [{
        line: over.point,
        over: Math.round(over.price),
        under: Math.round(under.price),
      }];
    }
  }

  return odds;
}

async function fetchSport(sportKey, markets) {
  const url = `${ODDS_BASE}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=${markets}&oddsFormat=american`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.warn(`[${sportKey}] HTTP ${res.status}: ${body}`);
    return [];
  }
  const data = await res.json();
  console.log(`[${sportKey}] Got ${data.length} games. Remaining requests: ${res.headers.get('x-requests-remaining')}`);
  return data;
}

function transformGames(sportKey, rawGames) {
  return rawGames.map((g, idx) => ({
    id: `${sportKey}-${g.id?.slice(0, 8) || idx}`,
    time: fmtTime(g.commence_time),
    away: { name: g.away_team },
    home: { name: g.home_team },
    odds: parseMarkets(g),
  }));
}

async function uploadToSupabase(data) {
  if (!SERVICE_KEY) {
    console.warn('⚠️  No SUPABASE_SERVICE_KEY — skipping upload (dry run)');
    console.log('Preview:', JSON.stringify(data, null, 2).slice(0, 800));
    return;
  }

  const body = JSON.stringify(data, null, 2);
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/odds-data/games.json`;
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization':  `Bearer ${SERVICE_KEY}`,
      'Content-Type':   'application/json',
      'Cache-Control':  'no-cache',
      'x-upsert':       'true',
    },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upload failed: ${res.status} — ${err}`);
  }
  console.log(`✅ Uploaded games.json (${(body.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log(`\n🏟️  fetch-odds — ${new Date().toISOString()}`);
  console.log(`   API Key: ${ODDS_API_KEY.slice(0, 8)}...`);

  const gamesMap = {};
  let totalGames = 0;

  for (const { code, key, markets } of SPORT_MAP) {
    try {
      const raw = await fetchSport(key, markets);
      const games = transformGames(code, raw);
      gamesMap[code] = games;
      totalGames += games.length;
      console.log(`   ${code}: ${games.length} games`);
    } catch (err) {
      console.warn(`   ⚠️  ${code} failed: ${err.message}`);
      gamesMap[code] = [];
    }
  }

  const output = {
    last_updated: new Date().toISOString(),
    games: gamesMap,
  };

  console.log(`\n📦 Total games: ${totalGames}`);
  await uploadToSupabase(output);
  console.log('🏁 Done\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
