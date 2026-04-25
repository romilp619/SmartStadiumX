const axios = require('axios');
const cheerio = require('cheerio');

const matchId = 151889;

async function test() {
  try {
    const url = `https://www.cricbuzz.com/live-cricket-scores/${matchId}`;
    console.log('Fetching:', url);
    const r = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000,
    });
    console.log('Status:', r.status);
    console.log('Content-Type:', r.headers['content-type']);

    const html = r.data;
    const $ = cheerio.load(html);

    // Try to find score in common Cricbuzz elements
    const scoreText = $('.cb-min-bat-rw').first().text() || $('.cb-lv-scrs-well').first().text();
    console.log('Score text:', scoreText);

    // Look for JSON data in script tags
    $('script').each((i, el) => {
      const src = $(el).html() || '';
      if (src.includes('matchHeader') || src.includes('scoreCard') || src.includes('currentRunRate')) {
        console.log(`\n✅ Found match data in script tag ${i}:`);
        console.log(src.slice(0, 1000));
      }
    });

    // Print page title to see what we got
    console.log('\nPage title:', $('title').text());

    // Look for score elements
    console.log('\nAll score-like elements:');
    $('[class*="score"], [class*="Score"], [id*="score"]').each((i, el) => {
      const t = $(el).text().trim();
      if (t) console.log(`  ${$(el).attr('class') || $(el).attr('id')}: ${t.slice(0, 100)}`);
    });

  } catch (e) {
    console.log('Error:', e.response?.status, e.message);
    if (e.response?.data) console.log('Response:', String(e.response.data).slice(0, 500));
  }
}

test();
