#!/usr/bin/env node
// ============================================================
// fetch-odds.mjs
// Fetches live odds + scores from The Odds API → uploads to Supabase Storage
// Schedule: GitHub Actions runs this every 2 hours (see .github/workflows/fetch-odds.yml)
// ============================================================

// Los secrets de GitHub Actions a veces quedan con basura pegada por error
// (comillas, "NOMBRE=" copiado de un .env, saltos de línea) — se limpia acá
// para no fallar en silencio con un "Invalid URL" difícil de diagnosticar.
function cleanSecret(raw, envName) {
  if (!raw) return raw;
  // Quita BOM y caracteres de ancho cero que dejan algunos copy-paste (Notepad/Word)
  let v = raw.replace(/[​-‍﻿]/g, '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  const prefix = `${envName}=`;
  if (v.startsWith(prefix)) v = v.slice(prefix.length).trim();
  return v;
}

// Para la URL, en vez de confiar en que el secret venga "limpio", se extrae
// directamente el patrón https://... de adentro del valor crudo — así no
// importa qué basura haya quedado pegada antes/después.
function extractUrl(raw, fallback) {
  const cleaned = cleanSecret(raw, 'SUPABASE_URL');
  if (!cleaned) return fallback;
  const match = cleaned.match(/https?:\/\/[^\s"'<>]+/);
  return match ? match[0].replace(/[/"']+$/, '') : fallback;
}

const ODDS_API_KEY  = cleanSecret(process.env.ODDS_API_KEY, 'ODDS_API_KEY');
const SUPABASE_URL  = extractUrl(process.env.SUPABASE_URL, 'https://byulmtsffimwvejfoppk.supabase.co');
const SERVICE_KEY   = cleanSecret(process.env.SUPABASE_SERVICE_KEY, 'SUPABASE_SERVICE_KEY') || '';

if (!ODDS_API_KEY) {
  console.error('❌ Falta la variable de entorno ODDS_API_KEY. Configúrala en Settings → Secrets → Actions del repo.');
  process.exit(1);
}

try {
  new URL(SUPABASE_URL);
} catch {
  console.error(`❌ SUPABASE_URL no es una URL válida: "${SUPABASE_URL}". Revisa el secret en Settings → Secrets → Actions (debe ser solo https://xxxx.supabase.co, sin comillas ni texto extra).`);
  process.exit(1);
}

const ODDS_BASE = 'https://api.the-odds-api.com/v4';

// Sport mapping: our SportCode → Odds API sport key
const SPORT_MAP = [
  { code: 'MLB',    key: 'baseball_mlb',            markets: 'h2h,spreads,totals' },
  { code: 'NBA',    key: 'basketball_nba',           markets: 'h2h,spreads,totals' },
  { code: 'WNBA',   key: 'basketball_wnba',          markets: 'h2h,spreads,totals' },
  { code: 'Soccer', key: 'soccer_usa_mls',           markets: 'h2h,totals' },
  // LMB / BPS / CPBL use mock data (no API key available)
];

// Mercados por período parcial — confirmados en vivo contra la API real
// (2026-08-04, 1 crédito por llamada sin importar cuántos mercados se pidan
// juntos vía el endpoint /events/{id}/odds). Las llaves (primeraMitad/
// segundaMitad/primeraTercia/periodo1-4) tienen que calzar con `periodTabs`
// en src/data/mockData.ts del frontend y con las traducciones en
// src/lib/i18n.ts — si se agrega un período acá hay que agregarlo ahí también.
//
// MLB no tiene "mitades" reales — "primeraMitad" se mapea a las primeras 5
// entradas (el mercado más común después del juego completo) y
// "primeraTercia" a las primeras 3. "extra" no tiene mercado pregame real en
// the-odds-api — se deja sin datos a propósito, nunca se inventa un número.
const PERIOD_MARKETS = {
  baseball_mlb: {
    primeraMitad:  { ml: 'h2h_1st_5_innings', rl: 'spreads_1st_5_innings', ou: 'totals_1st_5_innings' },
    primeraTercia: { ml: 'h2h_1st_3_innings', rl: 'spreads_1st_3_innings', ou: 'totals_1st_3_innings' },
  },
  basketball_nba: {
    primeraMitad: { ml: 'h2h_h1' }, segundaMitad: { ml: 'h2h_h2' },
    periodo1: { ml: 'h2h_q1' }, periodo2: { ml: 'h2h_q2' }, periodo3: { ml: 'h2h_q3' }, periodo4: { ml: 'h2h_q4' },
  },
  basketball_wnba: {
    primeraMitad: { ml: 'h2h_h1' }, segundaMitad: { ml: 'h2h_h2' },
    periodo1: { ml: 'h2h_q1' }, periodo2: { ml: 'h2h_q2' }, periodo3: { ml: 'h2h_q3' }, periodo4: { ml: 'h2h_q4' },
  },
  soccer_usa_mls: {
    primeraMitad: { ml: 'h2h_h1' }, segundaMitad: { ml: 'h2h_h2' },
  },
};

function fmtTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'America/New_York',
  });
}

// "2026-08-03T15:00:00Z" → "2026-08-03" en hora del Este (para filtrar por día en Resultados)
function fmtDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
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
    // Empate (Draw) — solo existe en fútbol (soccer_usa_mls); MLB/NBA/WNBA
    // no tienen este outcome en su mercado h2h real.
    const draw = h2h.outcomes.find(o => o.name === 'Draw');
    if (draw) odds.draw = Math.round(draw.price);
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

// Deportes con "Super Run Line"/"Run Line Alternativo" (MLB únicamente, igual
// que en la tabla de referencia del dueño — NBA/WNBA/Soccer no muestran esas
// dos columnas). Se leen del mismo mercado real `alternate_spreads` (la
// escalera completa de líneas alternas), tomando puntos específicos:
//   SRL = el siguiente incremento por encima de la línea estándar (±2.5)
//   RLA = la línea estándar (±1.5) pero del lado contrario (equipo dado
//         vuelta) — "qué pasaría si el desvalido tomara la línea del favorito"
const SRL_RLA_SPORTS = new Set(['baseball_mlb']);

function pickAlternatePoint(market, teamName, point) {
  const o = market.outcomes.find((x) => x.name === teamName && Number(x.point) === point);
  if (!o) return null;
  return { line: point >= 0 ? `+${point}` : `${point}`, odds: Math.round(o.price) };
}

// ── Mercados extra por evento — período parcial (1ra mitad/tercia, cuartos),
// SOLO equipo (team_totals, TODOS los deportes) y SRL/RLA (alternate_spreads,
// solo MLB). Todo en UNA sola llamada por juego (1 crédito, sin importar
// cuántos mercados se pidan juntos — confirmado contra la API real).
async function fetchEventExtras(sportKey, eventId, awayTeam, homeTeam) {
  const periodDefs = PERIOD_MARKETS[sportKey] || {};
  const wantsAltSpreads = SRL_RLA_SPORTS.has(sportKey);

  const marketKeys = new Set(['team_totals']);
  for (const m of Object.values(periodDefs)) [m.ml, m.rl, m.ou].filter(Boolean).forEach((k) => marketKeys.add(k));
  if (wantsAltSpreads) marketKeys.add('alternate_spreads');

  const url = `${ODDS_BASE}/sports/${sportKey}/events/${eventId}/odds/?`
    + `apiKey=${ODDS_API_KEY}&regions=us&markets=${[...marketKeys].join(',')}&oddsFormat=american`;

  const res = await fetch(url);
  if (!res.ok) return {};
  const body = await res.json();
  if (!body?.bookmakers) return {};

  // Junta los mercados de todas las casas — el primer bookmaker que traiga
  // cada mercado gana (mismo criterio que parseMarkets con el mercado
  // principal, que usa bookmakers[0]).
  const marketByKey = {};
  for (const bm of body.bookmakers) {
    for (const m of bm.markets || []) {
      if (!marketByKey[m.key]) marketByKey[m.key] = m;
    }
  }

  const out = {};

  // Períodos parciales
  const periods = {};
  for (const [periodKey, defs] of Object.entries(periodDefs)) {
    const p = {};
    if (defs.ml && marketByKey[defs.ml]) {
      const m = marketByKey[defs.ml];
      const ao = m.outcomes.find(o => o.name === awayTeam)?.price;
      const ho = m.outcomes.find(o => o.name === homeTeam)?.price;
      if (ao != null && ho != null) p.ml = [Math.round(ao), Math.round(ho)];
    }
    if (defs.rl && marketByKey[defs.rl]) {
      const m = marketByKey[defs.rl];
      const as = m.outcomes.find(o => o.name === awayTeam);
      const hs = m.outcomes.find(o => o.name === homeTeam);
      if (as && hs) {
        p.rl = [
          { line: as.point >= 0 ? `+${as.point}` : `${as.point}`, odds: Math.round(as.price) },
          { line: hs.point >= 0 ? `+${hs.point}` : `${hs.point}`, odds: Math.round(hs.price) },
        ];
      }
    }
    if (defs.ou && marketByKey[defs.ou]) {
      const m = marketByKey[defs.ou];
      const ov = m.outcomes.find(o => o.name === 'Over');
      const un = m.outcomes.find(o => o.name === 'Under');
      if (ov && un) p.ou = [{ line: ov.point, over: Math.round(ov.price), under: Math.round(un.price) }];
    }
    if (Object.keys(p).length > 0) periods[periodKey] = p;
  }
  if (Object.keys(periods).length > 0) out.periods = periods;

  // SOLO equipo — team_totals real, away y home cada uno con su propia línea
  // (no siempre coinciden entre sí, cada equipo tiene su propio total).
  if (marketByKey.team_totals) {
    const m = marketByKey.team_totals;
    const awayOver = m.outcomes.find(o => o.name === 'Over' && o.description === awayTeam);
    const awayUnder = m.outcomes.find(o => o.name === 'Under' && o.description === awayTeam);
    const homeOver = m.outcomes.find(o => o.name === 'Over' && o.description === homeTeam);
    const homeUnder = m.outcomes.find(o => o.name === 'Under' && o.description === homeTeam);
    if (awayOver && homeOver) out.soloPos = [
      { line: awayOver.point, odds: Math.round(awayOver.price) },
      { line: homeOver.point, odds: Math.round(homeOver.price) },
    ];
    if (awayUnder && homeUnder) out.soloNeg = [
      { line: awayUnder.point, odds: Math.round(awayUnder.price) },
      { line: homeUnder.point, odds: Math.round(homeUnder.price) },
    ];
  }

  // SRL / RLA — solo MLB, de la escalera real de alternate_spreads.
  if (wantsAltSpreads && marketByKey.alternate_spreads) {
    const m = marketByKey.alternate_spreads;
    const srlAway = pickAlternatePoint(m, awayTeam, 2.5);
    const srlHome = pickAlternatePoint(m, homeTeam, -2.5);
    if (srlAway && srlHome) out.srl = [srlAway, srlHome];

    const rlaAway = pickAlternatePoint(m, awayTeam, -1.5);
    const rlaHome = pickAlternatePoint(m, homeTeam, 1.5);
    if (rlaAway && rlaHome) out.rla = [rlaAway, rlaHome];
  }

  return out;
}

// ── Scores (marcador + estado) — endpoint separado de odds ──────────────────
async function fetchScores(sportKey) {
  const url = `${ODDS_BASE}/sports/${sportKey}/scores/?apiKey=${ODDS_API_KEY}&daysFrom=3&dateFormat=iso`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    console.warn(`[${sportKey}] scores HTTP ${res.status}: ${body}`);
    return [];
  }
  const data = await res.json();
  console.log(`[${sportKey}] Got ${data.length} score entries. Remaining requests: ${res.headers.get('x-requests-remaining')}`);
  return data;
}

function transformScores(sportKey, rawGames) {
  return rawGames.map((g, idx) => {
    const scores = g.scores || [];
    const awayEntry = scores.find(s => s.name === g.away_team);
    const homeEntry = scores.find(s => s.name === g.home_team);
    const awayScore = awayEntry ? Number(awayEntry.score) : null;
    const homeScore = homeEntry ? Number(homeEntry.score) : null;

    let status = 'NS';
    if (g.completed) status = 'FT';
    else if (awayScore !== null || homeScore !== null) status = 'LIVE';

    return {
      id: `${sportKey}-${g.id?.slice(0, 8) || idx}`,
      time: fmtTime(g.commence_time),
      date: fmtDate(g.commence_time),
      away: { name: g.away_team, score: awayScore },
      home: { name: g.home_team, score: homeScore },
      status,
    };
  });
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
  const resultsMap = {};
  let totalGames = 0;
  let totalResults = 0;

  for (const { code, key, markets } of SPORT_MAP) {
    try {
      const raw = await fetchSport(key, markets);
      const games = transformGames(code, raw);

      // Mercados extra — período parcial + SOLO equipo (team_totals) + SRL/RLA
      // en MLB. 1 llamada extra por juego (1 crédito c/u). `raw` y `games`
      // quedan siempre alineados por índice (transformGames no filtra
      // ninguno), así que se puede iterar en paralelo con zip.
      if (PERIOD_MARKETS[key]) {
        console.log(`   Fetching extra markets for ${games.length} ${code} games...`);
        for (let i = 0; i < games.length; i++) {
          try {
            const extra = await fetchEventExtras(key, raw[i].id, raw[i].away_team, raw[i].home_team);
            if (extra.periods) games[i].periods = extra.periods;
            if (extra.soloPos) games[i].odds.soloPos = extra.soloPos;
            if (extra.soloNeg) games[i].odds.soloNeg = extra.soloNeg;
            if (extra.srl) games[i].odds.srl = extra.srl;
            if (extra.rla) games[i].odds.rla = extra.rla;
          } catch (e) {
            console.warn(`     ⚠️  extra markets fetch failed for ${raw[i].away_team} @ ${raw[i].home_team}: ${e.message}`);
          }
        }
      }

      gamesMap[code] = games;
      totalGames += games.length;
      console.log(`   ${code}: ${games.length} games`);
    } catch (err) {
      console.warn(`   ⚠️  ${code} failed: ${err.message}`);
      gamesMap[code] = [];
    }

    try {
      const rawScores = await fetchScores(key);
      const results = transformScores(code, rawScores);
      resultsMap[code] = results;
      totalResults += results.length;
      console.log(`   ${code}: ${results.length} results`);
    } catch (err) {
      console.warn(`   ⚠️  ${code} scores failed: ${err.message}`);
      resultsMap[code] = [];
    }
  }

  const output = {
    last_updated: new Date().toISOString(),
    games: gamesMap,
    results: resultsMap,
  };

  console.log(`\n📦 Total games: ${totalGames} | Total results: ${totalResults}`);
  await uploadToSupabase(output);
  console.log('🏁 Done\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
