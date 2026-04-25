const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

const MOBILE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ── Per-match cache (Map: matchId -> {data, ts}) ─────────────────────────────
const matchCache = new Map();
let scheduleCache = { data: null, ts: 0 };
let pointsCache   = { data: null, ts: 0 };

// ── Live match scraper ────────────────────────────────────────────────────────
async function scrapeMatch(matchId) {
  const url = `https://m.cricbuzz.com/live-cricket-scores/${matchId}`;
  const { data: html } = await axios.get(url, { headers: MOBILE_HEADERS, timeout: 15000 });
  const $ = cheerio.load(html);

  // ── Result: scan TEXT NODES ONLY so child elements don't concatenate ────────
  let result = null;
  let isCompleted = false;

  // Walk every text node in the document
  $('body *').contents().filter(function () {
    return this.nodeType === 3; // text nodes only
  }).each(function () {
    const t = this.data.replace(/\s+/g, ' ').trim();
    if (t.length > 10 && t.length < 180) {
      if (/won by\s+\d+\s+(runs?|wickets?|wkts?)/i.test(t)) {
        result = t;
        isCompleted = true;
        return false; // break
      }
      if (/match (tied|abandoned|no result)/i.test(t) && t.length < 80) {
        result = t;
        isCompleted = true;
        return false;
      }
    }
  });

  // ── Innings: parse from full body text ──────────────────────────────────────
  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const innings = [];
  const innRx = /\b([A-Z]{2,5})\s+(\d{1,3})\/(\d{1,2})\s*\((\d{1,2}\.?\d?)\)/g;
  const seen = new Set();
  let m;
  while ((m = innRx.exec(bodyText)) !== null) {
    const key = `${m[1]}-${m[2]}-${m[3]}`;
    if (!seen.has(key)) {
      seen.add(key);
      innings.push({ team: m[1], runs: +m[2], wickets: +m[3], overs: parseFloat(m[4]) });
    }
    if (innings.length >= 2) break;
  }

  // ── Live rates ───────────────────────────────────────────────────────────────
  const crrM = bodyText.match(/CRR\s*:?\s*([\d.]+)/i);
  const rrrM = bodyText.match(/RRR\s*:?\s*([\d.]+)/i);
  const reqM = bodyText.match(/need\s+(\d+)\s+(?:more\s+)?runs?\s+(?:in|from)\s+(\d+)\s+balls?/i);
  if (!crrM && innings.length >= 1) isCompleted = true;

  // ── Commentary from embedded JSON ──────────────────────────────────────────
  let bigChunk = '';
  $('script').each((_, el) => {
    const s = $(el).html() || '';
    if (s.includes('commText')) bigChunk += s;
  });
  const commentary = [];
  const commRx = /"commText":"((?:[^"\\]|\\.)*)"/g;
  while ((m = commRx.exec(bigChunk)) !== null && commentary.length < 25) {
    const t = m[1].replace(/<[^>]+>/g, '').replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
    if (t.length > 5) commentary.push(t);
  }

  // ── Player of the Match ─────────────────────────────────────────────────────
  let playerOfMatch = null;
  const potmM = bodyText.match(/PLAYER OF THE MATCH\s*([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);
  if (potmM) playerOfMatch = potmM[1].trim();

  return {
    matchId, isCompleted, result, playerOfMatch,
    innings,
    crr: crrM ? crrM[1] : null,
    rrr: rrrM ? rrrM[1] : null,
    reqRuns: reqM ? +reqM[1] : null,
    reqBalls: reqM ? +reqM[2] : null,
    commentary: commentary.slice(0, 25),
    scrapedAt: new Date().toISOString(),
  };
}

// ── Series schedule scraper ───────────────────────────────────────────────────
async function scrapeSchedule() {
  const url = 'https://m.cricbuzz.com/cricket-series/9241/indian-premier-league-2026/matches';
  const { data: html } = await axios.get(url, { headers: MOBILE_HEADERS, timeout: 15000 });
  const $ = cheerio.load(html);

  const matches = [];
  // Each match appears in a card/list item. Look for match ID in href links.
  $('a[href*="/live-cricket-scores/"], a[href*="/cricket-scorecard/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const idM = href.match(/\/(\d{5,7})\//);
    if (!idM) return;
    const matchId = idM[1];
    if (matches.find(m => m.matchId === matchId)) return; // dedupe

    const card = $(el).closest('div, li, section');
    const text = card.text().replace(/\s+/g, ' ').trim();

    // Extract teams: look for known IPL team abbreviations
    const teamRx = /\b(MI|CSK|RCB|KKR|SRH|DC|PBKS|GT|LSG|RR)\b/g;
    const teamMatches = [...text.matchAll(teamRx)].map(t => t[1]);
    const teams = [...new Set(teamMatches)].slice(0, 2);

    // Extract result
    let result = null;
    let status = 'UPCOMING';
    const wonM = text.match(/([\w\s]+ won by [\d]+ (?:runs?|wickets?|wkts?))/i);
    if (wonM) { result = wonM[1].trim(); status = 'ENDED'; }
    if (/no result|abandoned|tied/i.test(text)) status = 'ENDED';

    // Extract date/time
    const dateM = text.match(/(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(?:\d{4})?)/i);
    const date = dateM ? dateM[1].trim() : '';

    if (teams.length === 2) {
      matches.push({ matchId, team1: teams[0], team2: teams[1], result, status, date });
    }
  });

  return { matches, scrapedAt: new Date().toISOString() };
}

// ── Points table scraper ──────────────────────────────────────────────────────
async function scrapePointsTable() {
  const url = 'https://m.cricbuzz.com/cricket-series/9241/indian-premier-league-2026/points-table';
  const { data: html } = await axios.get(url, { headers: MOBILE_HEADERS, timeout: 15000 });
  const $ = cheerio.load(html);

  const table = [];
  // Try to find table rows
  $('tr, [class*="standings"], [class*="points"]').each((_, el) => {
    const cells = $(el).find('td, [class*="cell"]');
    if (cells.length < 4) return;
    const vals = cells.map((_, c) => $(c).text().replace(/\s+/g, ' ').trim()).get();
    if (!vals[0] || !/[A-Z]{2,5}/.test(vals[0])) return;
    table.push({
      team: vals[0],
      p: vals[1] || '0',
      w: vals[2] || '0',
      l: vals[3] || '0',
      nr: vals[4] || '0',
      pts: vals[5] || '0',
      nrr: vals[6] || '0.000',
    });
  });

  // Fallback: extract from raw text patterns like "MI 10 7 3 0 14 +0.456"
  if (table.length === 0) {
    const bodyText = $('body').text().replace(/\s+/g, ' ');
    const rowRx = /\b(MI|CSK|RCB|KKR|SRH|DC|PBKS|GT|LSG|RR)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([+-]?\d+\.\d+)/g;
    let m;
    while ((m = rowRx.exec(bodyText)) !== null) {
      table.push({ team: m[1], p: m[2], w: m[3], l: m[4], nr: m[5], pts: m[6], nrr: m[7] });
    }
  }

  return { table, scrapedAt: new Date().toISOString() };
}

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/:matchId/live', async (req, res) => {
  try {
    const { matchId } = req.params;
    const now = Date.now();
    const cached = matchCache.get(matchId);
    const ttl = cached?.data?.isCompleted ? 5 * 60 * 1000 : 20 * 1000;
    if (cached && (now - cached.ts) < ttl) {
      return res.json({ ...cached.data, cached: true });
    }
    const data = await scrapeMatch(matchId);
    matchCache.set(matchId, { data, ts: now });
    res.json(data);
  } catch (err) {
    console.error('Cricket scrape error:', err.message);
    res.status(502).json({ error: 'Scrape failed', detail: err.message });
  }
});

router.get('/series/schedule', async (req, res) => {
  try {
    const now = Date.now();
    if (scheduleCache.data && (now - scheduleCache.ts) < 5 * 60 * 1000) {
      return res.json({ ...scheduleCache.data, cached: true });
    }
    const data = await scrapeSchedule();
    scheduleCache = { data, ts: now };
    res.json(data);
  } catch (err) {
    console.error('Schedule scrape error:', err.message);
    res.status(502).json({ error: 'Schedule scrape failed', detail: err.message });
  }
});

router.get('/series/pointstable', async (req, res) => {
  try {
    const now = Date.now();
    if (pointsCache.data && (now - pointsCache.ts) < 5 * 60 * 1000) {
      return res.json({ ...pointsCache.data, cached: true });
    }
    const data = await scrapePointsTable();
    pointsCache = { data, ts: now };
    res.json(data);
  } catch (err) {
    console.error('Points table scrape error:', err.message);
    res.status(502).json({ error: 'Points table scrape failed', detail: err.message });
  }
});

module.exports = router;
